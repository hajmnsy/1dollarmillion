// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title  HybridRoscaLotteryV5 — Virtual Deduction (No Sync Needed!)
 * @notice V5 = V4 + Virtual Balance Calculation
 *
 * ====================================================================
 *  WHAT'S NEW IN V5?
 * ====================================================================
 *  V4 used "lazy deduction" — users had to call syncUserState() to
 *  update their balance and the prize pool. This required a bot or
 *  manual interaction.
 *
 *  V5 uses "virtual deduction" — balances are calculated dynamically
 *  at read time. No sync needed! The prize pool is always accurate.
 *
 *  How it works:
 *  - User deposits 5 USDT → totalDeposited += 5, userDeposited[user] = 5
 *  - After 3 days: getUserInfo() returns balance = 5 - (3 × $1) = 2
 *  - currentPool() = totalDeposited - sum(userDeposited) + sum(deductions)
 *  - Everything is automatic, no transactions needed!
 *
 *  Trade-off: Slightly more gas on reads (calculation), but zero
 *  gas for maintenance. Perfect for a lottery with many users.
 * ====================================================================
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";

interface IVRFCoordinatorV2_5 {
    function requestRandomWords(
        bytes32 keyHash,
        uint256 subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords
    ) external returns (uint256 requestId);
}

contract HybridRoscaLotteryV5 is ReentrancyGuard, Ownable, VRFConsumerBaseV2 {

    using SafeERC20 for IERC20;

    // ============================================================
    // ====================== CONSTANTS ===========================
    // ============================================================

    uint256 public constant DECIMALS            = 6;
    uint256 public constant DAILY_DEDUCTION     = 1 * 10 ** DECIMALS;
    uint256 public constant MIN_DEPOSIT         = 1 * 10 ** DECIMALS;
    uint256 public constant POOL_TARGET         = 1_000_000 * 10 ** DECIMALS;
    uint256 public constant OPERATIONAL_FEE     = 1_000 * 10 ** DECIMALS;
    uint256 public constant WINNER_LOCK_AMOUNT  = 3_650 * 10 ** DECIMALS;
    uint256 public constant WINNER_PAYOUT       = 995_350 * 10 ** DECIMALS;

    uint16  public constant VRF_REQUEST_CONFIRMATIONS = 3;
    uint32  public constant VRF_CALLBACK_GAS_LIMIT    = 500_000;
    uint32  public constant VRF_NUM_WORDS             = 1;

    uint256 public constant REFERRAL_BONUS_DAYS = 5;
    uint256 public constant REFERRAL_FEE_BPS    = 100;
    uint256 public constant REFERRAL_PAYOUT     = (POOL_TARGET * REFERRAL_FEE_BPS) / 10000;
    uint256 public constant WINNER_PAYOUT_REFERRED = POOL_TARGET - OPERATIONAL_FEE - WINNER_LOCK_AMOUNT - REFERRAL_PAYOUT;

    uint256 private constant SECONDS_PER_DAY = 86_400;
    uint256 private constant WINNER_LOCK_DURATION = 365 days * 10;

    // ============================================================
    // ====================== DATA STRUCTURES =====================
    // ============================================================

    struct User {
        uint128 deposited;          // Total amount ever deposited (never decreases)
        uint128 withdrawn;          // Total amount ever withdrawn
        uint64  depositTime;        // When first deposit was made (or last sync)
        uint64  bonusDays;          // Referral bonus days
        uint128 lockedAmount;       // Winner lock
        uint64  lockedStartTime;
        bool    isActive;
        bool    hasWon;
    }

    struct VRFRequest {
        bool    exists;
        bool    fulfilled;
        address winner;
        uint256 randomNumber;
        uint256 activeUserCount;
    }

    // ============================================================
    // ====================== STATE VARIABLES =====================
    // ============================================================

    IERC20  public immutable usdt;
    IVRFCoordinatorV2_5 public immutable vrfCoordinator;
    bytes32 public immutable vrfKeyHash;
    uint256 public immutable vrfSubscriptionId;

    mapping(address => User) public users;
    mapping(address => uint256) public activeUserIndex;
    address[] public activeUsers;

    // Virtual pool: totalDeductions = totalDeposited - totalWithdrawn - totalUserBalances
    // currentPool is calculated dynamically: see getCurrentPool()
    uint256 public totalDeposited;       // Sum of all deposits ever made
    uint256 public totalWithdrawn;       // Sum of all withdrawals ever made
    uint256 public totalLockedAmounts;
    uint256 public accumulatedFees;

    mapping(uint256 => VRFRequest) public vrfRequests;
    uint256 public lastRequestId;
    uint256 public regularDrawCount;

    bool public paused;
    bool public drawInProgress;

    mapping(address => address) public referrerOf;
    mapping(address => uint256) public referralCount;
    mapping(address => uint256) public referralEarnings;

    // ============================================================
    // ====================== EVENTS ==============================
    // ============================================================

    event Deposited(address indexed user, uint256 amount, uint256 virtualBalance, uint256 virtualPool);
    event Withdrawn(address indexed user, uint256 amount, uint256 virtualBalance);
    event UserActivated(address indexed user);
    event UserDeactivated(address indexed user, string reason);
    event DrawTriggered(uint256 indexed requestId, uint256 poolSize, uint256 activeUserCount);
    event DrawCompleted(uint256 indexed requestId, address indexed winner, uint256 payout, uint256 locked);
    event FeesClaimed(address indexed owner, uint256 amount);
    event EmergencyPaused(address indexed by);
    event EmergencyUnpaused(address indexed by);
    event ReferralRegistered(address indexed referrer, address indexed referred);
    event ReferralRewardPaid(address indexed referrer, address indexed winner, uint256 amount);

    // ============================================================
    // ====================== MODIFIERS ===========================
    // ============================================================

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    modifier notDrawInProgress() {
        require(!drawInProgress, "Draw in progress");
        _;
    }

    // ============================================================
    // ====================== CONSTRUCTOR =========================
    // ============================================================

    constructor(
        address _usdt,
        address _vrfCoordinator,
        bytes32 _vrfKeyHash,
        uint256 _vrfSubscriptionId
    ) VRFConsumerBaseV2(_vrfCoordinator) Ownable(msg.sender) {
        require(_usdt != address(0) && _vrfCoordinator != address(0), "Zero address");
        usdt              = IERC20(_usdt);
        vrfCoordinator    = IVRFCoordinatorV2_5(_vrfCoordinator);
        vrfKeyHash        = _vrfKeyHash;
        vrfSubscriptionId = _vrfSubscriptionId;
    }

    // ============================================================
    // ============ VIRTUAL BALANCE CALCULATION ==================
    // ============================================================

    /**
     * @dev Calculate pending deductions for a user since deposit time.
     * Uses virtual calculation — no state change needed!
     */
    function _getPendingDeduction(address userAddr) internal view returns (uint256) {
        User storage u = users[userAddr];
        if (u.deposited == 0 || u.depositTime == 0) return 0;

        uint256 elapsed = block.timestamp - u.depositTime;
        if (elapsed < SECONDS_PER_DAY) return 0;

        uint256 daysElapsed = elapsed / SECONDS_PER_DAY;
        uint256 effectiveDays = daysElapsed + u.bonusDays;
        
        uint256 deduction = effectiveDays * DAILY_DEDUCTION;
        
        // Cap at deposited - withdrawn
        uint256 available = u.deposited - u.withdrawn;
        if (deduction > available) deduction = available;
        
        return deduction;
    }

    /**
     * @notice Get user's current virtual balance (auto-calculated).
     * No sync needed!
     */
    function _getVirtualBalance(address userAddr) internal view returns (uint256) {
        User storage u = users[userAddr];
        if (u.deposited == 0) return 0;
        
        uint256 available = u.deposited - u.withdrawn;
        uint256 pending = _getPendingDeduction(userAddr);
        
        return available > pending ? available - pending : 0;
    }

    /**
     * @notice Get current prize pool (auto-calculated from all deductions).
     * No sync needed!
     */
    function getCurrentPool() public view returns (uint256) {
        // Pool = totalDeposited - totalWithdrawn - sum(virtualBalances) - totalLocked - fees
        uint256 contractBalance = usdt.balanceOf(address(this));
        
        // Subtract locked amounts and fees (not part of prize pool)
        uint256 nonPool = totalLockedAmounts + accumulatedFees;
        
        // Calculate total user balances (virtually)
        uint256 totalUserBal = 0;
        for (uint256 i = 0; i < activeUsers.length; i++) {
            totalUserBal += _getVirtualBalance(activeUsers[i]);
        }
        
        // Also include inactive users who might have remaining balance
        // (We track this via totalDeposited - totalWithdrawn - activeUserBalances)
        uint256 allUserBalances = totalDeposited - totalWithdrawn - 
            (getCurrentPoolDeductions());
        
        // Pool = contract balance - user balances - locked - fees
        if (contractBalance <= totalUserBal + nonPool) return 0;
        return contractBalance - totalUserBal - nonPool;
    }

    /**
     * @dev Helper: calculate total deductions across all active users
     */
    function getCurrentPoolDeductions() public view returns (uint256) {
        uint256 totalDeductions = 0;
        for (uint256 i = 0; i < activeUsers.length; i++) {
            totalDeductions += _getPendingDeduction(activeUsers[i]);
        }
        return totalDeductions;
    }

    /**
     * @notice Get days remaining for a user (virtual calculation)
     */
    function _getDaysRemaining(address userAddr) internal view returns (uint256) {
        uint256 balance = _getVirtualBalance(userAddr);
        if (balance == 0) return 0;
        return balance / DAILY_DEDUCTION;
    }

    // ============================================================
    // =================== USER FUNCTIONS =========================
    // ============================================================

    function deposit(uint256 amount, address referrer)
        external
        nonReentrant
        whenNotPaused
        notDrawInProgress
    {
        require(amount >= MIN_DEPOSIT, "Deposit below minimum");
        require(!users[msg.sender].hasWon, "Winner cannot reenter");

        // Register referrer
        if (referrer != address(0) && referrer != msg.sender && referrerOf[msg.sender] == address(0)) {
            if (users[referrer].depositTime > 0 || users[referrer].isActive) {
                referrerOf[msg.sender] = referrer;
                referralCount[referrer] += 1;
                emit ReferralRegistered(referrer, msg.sender);
            }
        }

        // Apply pending deduction first (sync on deposit)
        _applyDeduction(msg.sender);

        usdt.safeTransferFrom(msg.sender, address(this), amount);

        User storage u = users[msg.sender];
        u.deposited += uint128(amount);
        totalDeposited += amount;

        if (!u.isActive) {
            _activateUser(msg.sender);
        }

        // Award referral bonus days
        if (referrer != address(0) && u.bonusDays == 0 && referrerOf[msg.sender] != address(0)) {
            u.bonusDays = uint64(REFERRAL_BONUS_DAYS);
            User storage r = users[referrer];
            if (r.bonusDays == 0) {
                r.bonusDays = uint64(REFERRAL_BONUS_DAYS);
            }
        }

        emit Deposited(msg.sender, amount, _getVirtualBalance(msg.sender), getCurrentPool());

        _checkAndTriggerDraw();
    }

    function deposit(uint256 amount) external {
        _depositSimple(amount);
    }

    function _depositSimple(uint256 amount) internal {
        require(amount >= MIN_DEPOSIT, "Deposit below minimum");
        require(!users[msg.sender].hasWon, "Winner cannot reenter");

        _applyDeduction(msg.sender);
        usdt.safeTransferFrom(msg.sender, address(this), amount);

        User storage u = users[msg.sender];
        u.deposited += uint128(amount);
        totalDeposited += amount;

        if (!u.isActive) {
            _activateUser(msg.sender);
        }

        emit Deposited(msg.sender, amount, _getVirtualBalance(msg.sender), getCurrentPool());
        _checkAndTriggerDraw();
    }

    function withdraw(uint256 amount)
        external
        nonReentrant
        whenNotPaused
        notDrawInProgress
    {
        require(amount > 0, "Zero amount");

        _applyDeduction(msg.sender);

        User storage u = users[msg.sender];
        uint256 balance = _getVirtualBalance(msg.sender);
        require(balance >= amount, "Insufficient balance");

        u.withdrawn += uint128(amount);
        totalWithdrawn += amount;

        usdt.safeTransfer(msg.sender, amount);

        if (_getVirtualBalance(msg.sender) == 0 && u.isActive) {
            _deactivateUser(msg.sender, "Balance depleted");
        }

        emit Withdrawn(msg.sender, amount, _getVirtualBalance(msg.sender));
    }

    // ============================================================
    // =================== INTERNAL FUNCTIONS =====================
    // ============================================================

    /**
     * @dev Apply deduction by updating depositTime (sync point).
     * This is called on deposit/withdraw — the only time state changes.
     */
    function _applyDeduction(address userAddr) internal {
        User storage u = users[userAddr];
        if (u.deposited == 0 || u.depositTime == 0) return;

        uint256 pending = _getPendingDeduction(userAddr);
        if (pending == 0) return;

        // Update withdrawn to reflect deduction
        u.withdrawn += uint128(pending);
        totalWithdrawn += pending;
        u.depositTime = uint64(block.timestamp);

        if (u.bonusDays > 0) {
            u.bonusDays = 0;
        }

        if (_getVirtualBalance(userAddr) == 0 && u.isActive) {
            _deactivateUser(userAddr, "Balance depleted");
        }
    }

    function _activateUser(address userAddr) internal {
        User storage u = users[userAddr];
        u.isActive = true;
        if (u.depositTime == 0) {
            u.depositTime = uint64(block.timestamp);
        }
        activeUserIndex[userAddr] = activeUsers.length;
        activeUsers.push(userAddr);
        emit UserActivated(userAddr);
    }

    function _deactivateUser(address userAddr, string memory reason) internal {
        User storage u = users[userAddr];
        u.isActive = false;

        uint256 idx = activeUserIndex[userAddr];
        uint256 lastIdx = activeUsers.length - 1;

        if (idx != lastIdx) {
            address lastUser = activeUsers[lastIdx];
            activeUsers[idx] = lastUser;
            activeUserIndex[lastUser] = idx;
        }

        activeUsers.pop();
        delete activeUserIndex[userAddr];

        emit UserDeactivated(userAddr, reason);
    }

    // ============================================================
    // =================== DRAW FUNCTIONS =========================
    // ============================================================

    function _checkAndTriggerDraw() internal {
        uint256 pool = getCurrentPool();
        if (pool >= POOL_TARGET && !drawInProgress && activeUsers.length > 0) {
            _triggerDraw();
        }
    }

    function triggerDrawIfTargetReached() external whenNotPaused notDrawInProgress {
        require(getCurrentPool() >= POOL_TARGET, "Pool target not reached");
        require(activeUsers.length > 0, "No active users");
        _triggerDraw();
    }

    function _triggerDraw() internal {
        drawInProgress = true;

        uint256 requestId = vrfCoordinator.requestRandomWords(
            vrfKeyHash,
            vrfSubscriptionId,
            VRF_REQUEST_CONFIRMATIONS,
            VRF_CALLBACK_GAS_LIMIT,
            VRF_NUM_WORDS
        );

        vrfRequests[requestId] = VRFRequest({
            exists: true,
            fulfilled: false,
            winner: address(0),
            randomNumber: 0,
            activeUserCount: activeUsers.length
        });

        lastRequestId = requestId;
        emit DrawTriggered(requestId, getCurrentPool(), activeUsers.length);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
        override
    {
        VRFRequest storage req = vrfRequests[requestId];
        require(req.exists, "Unknown request");
        require(!req.fulfilled, "Already fulfilled");

        req.fulfilled = true;
        req.randomNumber = randomWords[0];

        _completeDraw(requestId);
    }

    function _completeDraw(uint256 requestId) internal {
        VRFRequest storage req = vrfRequests[requestId];
        uint256 userCount = activeUsers.length;
        require(userCount > 0, "No active users");

        uint256 winnerIndex = req.randomNumber % userCount;
        address winner = activeUsers[winnerIndex];
        req.winner = winner;

        // Apply final deduction for winner
        _applyDeduction(winner);

        User storage w = users[winner];
        w.hasWon = true;
        w.lockedAmount += uint128(WINNER_LOCK_AMOUNT);
        w.lockedStartTime = uint64(block.timestamp);
        totalLockedAmounts += WINNER_LOCK_AMOUNT;

        accumulatedFees += OPERATIONAL_FEE;

        _deactivateUser(winner, "User won the draw");

        drawInProgress = false;
        regularDrawCount += 1;

        // Payout
        address _referrer = referrerOf[winner];
        bool hasReferrer = _referrer != address(0);

        if (hasReferrer) {
            require(usdt.balanceOf(address(this)) >= OPERATIONAL_FEE + WINNER_PAYOUT_REFERRED + REFERRAL_PAYOUT, "Insufficient liquidity");

            usdt.safeTransfer(owner(), OPERATIONAL_FEE);
            accumulatedFees -= OPERATIONAL_FEE;

            usdt.safeTransfer(winner, WINNER_PAYOUT_REFERRED);
            usdt.safeTransfer(_referrer, REFERRAL_PAYOUT);
            referralEarnings[_referrer] += REFERRAL_PAYOUT;

            emit ReferralRewardPaid(_referrer, winner, REFERRAL_PAYOUT);
            emit DrawCompleted(requestId, winner, WINNER_PAYOUT_REFERRED, WINNER_LOCK_AMOUNT);
        } else {
            require(usdt.balanceOf(address(this)) >= OPERATIONAL_FEE + WINNER_PAYOUT, "Insufficient liquidity");

            usdt.safeTransfer(owner(), OPERATIONAL_FEE);
            accumulatedFees -= OPERATIONAL_FEE;

            usdt.safeTransfer(winner, WINNER_PAYOUT);
            emit DrawCompleted(requestId, winner, WINNER_PAYOUT, WINNER_LOCK_AMOUNT);
        }

        emit FeesClaimed(owner(), OPERATIONAL_FEE);
    }

    // ============================================================
    // =================== ADMIN FUNCTIONS ========================
    // ============================================================

    function withdrawLockedAmount() external nonReentrant whenNotPaused notDrawInProgress {
        User storage u = users[msg.sender];
        require(u.lockedAmount > 0, "No locked amount");
        require(block.timestamp >= u.lockedStartTime + WINNER_LOCK_DURATION, "Lock period not ended");

        uint256 amount = u.lockedAmount;
        u.lockedAmount = 0;
        u.lockedStartTime = 0;
        totalLockedAmounts -= amount;

        usdt.safeTransfer(msg.sender, amount);
    }

    function claimFees() external onlyOwner nonReentrant {
        require(accumulatedFees > 0, "No fees");
        uint256 amount = accumulatedFees;
        accumulatedFees = 0;
        usdt.safeTransfer(owner(), amount);
        emit FeesClaimed(owner(), amount);
    }

    function pause() external onlyOwner {
        paused = true;
        emit EmergencyPaused(msg.sender);
    }

    function unpause() external onlyOwner {
        paused = false;
        emit EmergencyUnpaused(msg.sender);
    }

    function rescueToken(address token, uint256 amount) external onlyOwner {
        require(token != address(usdt), "Cannot rescue USDT");
        IERC20(token).safeTransfer(owner(), amount);
    }

    // ============================================================
    // =================== VIEW FUNCTIONS =========================
    // ============================================================

    function getActiveUserCount() external view returns (uint256) {
        return activeUsers.length;
    }

    function getActiveUsers() external view returns (address[] memory) {
        return activeUsers;
    }

    /**
     * @notice Get user info with VIRTUAL balances (always up-to-date!)
     * No sync needed — balance is calculated at read time.
     */
    function getUserInfo(address userAddr)
        external
        view
        returns (
            uint128 balance,
            uint128 lockedAmount,
            uint64  lastDeductionTime,
            bool    isActive,
            bool    hasWon,
            uint64  lockedStartTime
        )
    {
        User storage u = users[userAddr];
        return (
            uint128(_getVirtualBalance(userAddr)),
            u.lockedAmount,
            u.depositTime,
            u.isActive,
            u.hasWon,
            u.lockedStartTime
        );
    }

    function contractUsdtBalance() external view returns (uint256) {
        return usdt.balanceOf(address(this));
    }

    /**
     * @notice Accounting summary with virtual pool (always accurate!)
     */
    function accountingSummary()
        external
        view
        returns (
            uint256 totalBalance,
            uint256 userBalances,
            uint256 poolAmount,
            uint256 lockedAmounts,
            uint256 fees
        )
    {
        uint256 totalUserBal = 0;
        for (uint256 i = 0; i < activeUsers.length; i++) {
            totalUserBal += _getVirtualBalance(activeUsers[i]);
        }

        return (
            usdt.balanceOf(address(this)),
            totalUserBal,
            getCurrentPool(),
            totalLockedAmounts,
            accumulatedFees
        );
    }

    function getReferralInfo(address userAddr)
        external
        view
        returns (
            address referrer,
            uint256 count,
            uint256 earnings,
            uint256 bonusDays
        )
    {
        User storage u = users[userAddr];
        return (
            referrerOf[userAddr],
            referralCount[userAddr],
            referralEarnings[userAddr],
            u.bonusDays
        );
    }

    /**
     * @notice Get days remaining for user (virtual)
     */
    function getDaysRemaining(address userAddr) external view returns (uint256) {
        return _getDaysRemaining(userAddr);
    }
}
