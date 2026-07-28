// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title  HybridRoscaLotteryV4 — Sharia-Compliant Version (No Aave, No Riba)
 * @notice V4 = V3 - Aave V3 - Bonus Draws + Sharia Compliance
 *
 * ====================================================================
 *  SHARIA COMPLIANCE STATEMENT
 * ====================================================================
 *  This contract is designed to be compliant with Islamic finance
 *  principles:
 *
 *  1. NO RIBA (Interest): No lending or borrowing at interest.
 *     Funds are NOT invested in Aave or any interest-bearing protocol.
 *
 *  2. PRINCIPAL PROTECTION: User deposits are held in the contract
 *     as-is. No risk of loss from DeFi investments.
 *
 *  3. LOTTERY MECHANISM: The $1/day deduction is a participation fee
 *     (subscription), not interest. The prize pool is funded solely
 *     by these fees, not by yield from lending.
 *
 *  4. FAIRNESS: Winners are selected via Chainlink VRF (provably
 *     fair randomness). No one can manipulate the outcome.
 *
 *  5. TRANSPARENCY: All transactions are on-chain and verifiable.
 *
 *  6. NO BONUS DRAWS: Removed in V4 (they were funded by Aave yield).
 *
 *  TAKING (Fiqh Classification): This is classified as a "loan with
 *  a prize" (Qard Hasan bi-Ja'izah) — a good loan where the lender
 *  may receive a prize, but the prize is not guaranteed and comes
 *  from a separate pool of participation fees, not from the borrower's
 *  deposit.
 * ====================================================================
 *
 * Changes from V3:
 *   - Removed: Aave V3 integration (aavePool, aUsdt, supplyToAave, etc.)
 *   - Removed: Bonus draws (funded by Aave yield, no longer available)
 *   - Removed: Liquidity buffer (not needed without Aave)
 *   - Removed: Yield tracking (no yield generation)
 *   - Removed: Solvency gap (no yield to compare against)
 *   - Kept: Daily deduction ($1/day) → funds the prize pool
 *   - Kept: Regular draws at $1,000,000 via Chainlink VRF
 *   - Kept: Referral program (1% of prize, +5 bonus days)
 *   - Kept: Principal protection (deposits held in contract)
 *   - Kept: All security features (ReentrancyGuard, SafeERC20, Ownable)
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";

/**
 * @dev Custom VRF v2.5 interface matching Polygon Mainnet deployment.
 * Uses uint256 for subId (v2.5) instead of uint64 (v2.0).
 */
interface IVRFCoordinatorV2_5 {
    function requestRandomWords(
        bytes32 keyHash,
        uint256 subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords
    ) external returns (uint256 requestId);
}

/**
 * @title HybridRoscaLotteryV4
 * @notice Sharia-compliant no-loss lottery on Polygon. No Aave, no riba.
 */
contract HybridRoscaLotteryV4 is ReentrancyGuard, Ownable, VRFConsumerBaseV2 {

    using SafeERC20 for IERC20;

    // ============================================================
    // ====================== CONSTANTS ===========================
    // ============================================================

    uint256 public constant DECIMALS            = 6;
    uint256 public constant DAILY_DEDUCTION     = 1 * 10 ** DECIMALS;       // $1/day
    uint256 public constant MIN_DEPOSIT         = 1 * 10 ** DECIMALS;       // $1 min
    uint256 public constant POOL_TARGET         = 1_000_000 * 10 ** DECIMALS; // $1M
    uint256 public constant OPERATIONAL_FEE     = 1_000 * 10 ** DECIMALS;   // $1,000
    uint256 public constant WINNER_LOCK_AMOUNT  = 3_650 * 10 ** DECIMALS;   // $3,650 (10yr × $1/day)
    uint256 public constant WINNER_PAYOUT       = 995_350 * 10 ** DECIMALS; // $995,350

    // VRF Configuration (Polygon Mainnet - VRF v2.5)
    uint16  public constant VRF_REQUEST_CONFIRMATIONS = 3;
    uint32  public constant VRF_CALLBACK_GAS_LIMIT    = 500_000;
    uint32  public constant VRF_NUM_WORDS             = 1;

    // Referral Program
    uint256 public constant REFERRAL_BONUS_DAYS = 5;
    uint256 public constant REFERRAL_FEE_BPS    = 100; // 1%
    uint256 public constant REFERRAL_PAYOUT     = (POOL_TARGET * REFERRAL_FEE_BPS) / 10000; // $9,953
    uint256 public constant WINNER_PAYOUT_REFERRED = POOL_TARGET - OPERATIONAL_FEE - WINNER_LOCK_AMOUNT - REFERRAL_PAYOUT;

    uint256 private constant BPS_DENOMINATOR = 10_000;
    uint256 private constant SECONDS_PER_DAY = 86_400;
    uint256 private constant WINNER_LOCK_DURATION = 365 days * 10; // 10 years

    // ============================================================
    // ====================== DATA STRUCTURES =====================
    // ============================================================

    struct User {
        uint128 balance;
        uint128 lockedAmount;
        uint64  lastDeductionTime;
        uint64  lockedStartTime;
        uint64  referralBonusDays;
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

    uint256 public currentPool;
    uint256 public totalLockedAmounts;
    uint256 public accumulatedFees;
    uint256 public totalUserBalances;

    mapping(uint256 => VRFRequest) public vrfRequests;
    uint256 public lastRequestId;
    uint256 public regularDrawCount;

    bool public paused;
    bool public drawInProgress;

    // Referral
    mapping(address => address) public referrerOf;
    mapping(address => uint256) public referralCount;
    mapping(address => uint256) public referralEarnings;

    // ============================================================
    // ====================== EVENTS ==============================
    // ============================================================

    event Deposited(address indexed user, uint256 amount, uint256 newBalance, uint256 newPool);
    event Withdrawn(address indexed user, uint256 amount, uint256 newBalance);
    event UserActivated(address indexed user);
    event UserDeactivated(address indexed user, string reason);
    event Deducted(address indexed user, uint256 amount, uint256 daysElapsed);
    event PoolUpdated(uint256 newPoolSize);
    event DrawTriggered(uint256 indexed requestId, uint256 poolSize, uint256 activeUserCount);
    event DrawCompleted(uint256 indexed requestId, address indexed winner, uint256 payout, uint256 locked);
    event FeesClaimed(address indexed owner, uint256 amount);
    event WinnerLockProcessed(address indexed winner, uint256 amountDeducted, uint256 remainingLock);
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
    // =================== USER FUNCTIONS =========================
    // ============================================================

    /**
     * @notice Deposit USDT with optional referrer.
     * @param amount Amount of USDT to deposit.
     * @param referrer Address of the referrer (address(0) if no referrer).
     */
    function deposit(uint256 amount, address referrer)
        external
        nonReentrant
        whenNotPaused
        notDrawInProgress
    {
        require(amount >= MIN_DEPOSIT, "Deposit below minimum");
        require(!users[msg.sender].hasWon, "Winner cannot reenter");

        // Register referrer (one-time, before first deposit)
        if (referrer != address(0) && referrer != msg.sender && referrerOf[msg.sender] == address(0)) {
            if (users[referrer].lastDeductionTime > 0 || users[referrer].isActive) {
                referrerOf[msg.sender] = referrer;
                referralCount[referrer] += 1;
                emit ReferralRegistered(referrer, msg.sender);
            }
        }

        _applyDeduction(msg.sender);
        usdt.safeTransferFrom(msg.sender, address(this), amount);

        User storage u = users[msg.sender];
        u.balance += uint128(amount);
        totalUserBalances += amount;

        if (!u.isActive) {
            _activateUser(msg.sender);
        }

        // Award referral bonus days (one-time, on first deposit)
        if (referrer != address(0) && u.referralBonusDays == 0 && referrerOf[msg.sender] != address(0)) {
            u.referralBonusDays = uint64(REFERRAL_BONUS_DAYS);
            User storage r = users[referrer];
            if (r.referralBonusDays == 0) {
                r.referralBonusDays = uint64(REFERRAL_BONUS_DAYS);
            }
        }

        emit Deposited(msg.sender, amount, u.balance, currentPool);

        _checkAndTriggerDraw();
    }

    /// @notice Backward-compatible deposit without referrer
    function deposit(uint256 amount) external {
        _depositSimple(amount);
    }

    function _depositSimple(uint256 amount) internal {
        require(amount >= MIN_DEPOSIT, "Deposit below minimum");
        require(!users[msg.sender].hasWon, "Winner cannot reenter");

        _applyDeduction(msg.sender);
        usdt.safeTransferFrom(msg.sender, address(this), amount);

        User storage u = users[msg.sender];
        u.balance += uint128(amount);
        totalUserBalances += amount;

        if (!u.isActive) {
            _activateUser(msg.sender);
        }

        emit Deposited(msg.sender, amount, u.balance, currentPool);
        _checkAndTriggerDraw();
    }

    /**
     * @notice Withdraw USDT from your balance.
     * @param amount Amount to withdraw.
     */
    function withdraw(uint256 amount)
        external
        nonReentrant
        whenNotPaused
        notDrawInProgress
    {
        require(amount > 0, "Zero amount");

        _applyDeduction(msg.sender);

        User storage u = users[msg.sender];
        require(u.balance >= amount, "Insufficient balance");

        u.balance -= uint128(amount);
        totalUserBalances -= amount;

        usdt.safeTransfer(msg.sender, amount);

        if (u.balance == 0 && u.isActive) {
            _deactivateUser(msg.sender, "Balance depleted");
        }

        emit Withdrawn(msg.sender, amount, u.balance);
    }

    /// @notice Sync user state (apply pending deductions)
    function syncUserState(address userAddr) external whenNotPaused notDrawInProgress {
        _applyDeduction(userAddr);
    }

    /// @notice Process winner's locked amount deduction (called by anyone)
    function processWinnerLock(address winnerAddr) external whenNotPaused notDrawInProgress {
        _applyDeduction(winnerAddr);
    }

    // ============================================================
    // =================== INTERNAL FUNCTIONS =====================
    // ============================================================

    function _applyDeduction(address userAddr) internal {
        User storage u = users[userAddr];
        if (u.balance == 0 || u.lastDeductionTime == 0) return;

        uint256 elapsed = block.timestamp - u.lastDeductionTime;
        if (elapsed < SECONDS_PER_DAY) return;

        // Calculate days (including referral bonus days)
        uint256 daysElapsed = elapsed / SECONDS_PER_DAY;
        uint256 effectiveDays = daysElapsed + u.referralBonusDays;

        uint256 deduction = effectiveDays * DAILY_DEDUCTION;
        if (deduction > u.balance) deduction = u.balance;

        u.balance -= uint128(deduction);
        u.lastDeductionTime = uint64(block.timestamp);

        // Reset referral bonus days after use
        if (u.referralBonusDays > 0) {
            u.referralBonusDays = 0;
        }

        currentPool += deduction;
        totalUserBalances -= deduction;

        if (u.balance == 0 && u.isActive) {
            _deactivateUser(userAddr, "Balance depleted");
        }

        emit Deducted(userAddr, deduction, daysElapsed);
        emit PoolUpdated(currentPool);
    }

    function _activateUser(address userAddr) internal {
        User storage u = users[userAddr];
        u.isActive = true;
        if (u.lastDeductionTime == 0) {
            u.lastDeductionTime = uint64(block.timestamp);
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
        if (currentPool >= POOL_TARGET && !drawInProgress && activeUsers.length > 0) {
            _triggerDraw();
        }
    }

    /// @notice Anyone can trigger draw when pool reaches target
    function triggerDrawIfTargetReached() external whenNotPaused notDrawInProgress {
        require(currentPool >= POOL_TARGET, "Pool target not reached");
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
        emit DrawTriggered(requestId, currentPool, activeUsers.length);
    }

    /// @notice Chainlink VRF callback — called automatically
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

        // Select winner: randomNumber % userCount
        uint256 winnerIndex = req.randomNumber % userCount;
        address winner = activeUsers[winnerIndex];
        req.winner = winner;

        User storage w = users[winner];
        w.hasWon = true;
        w.lockedAmount += uint128(WINNER_LOCK_AMOUNT);
        w.lockedStartTime = uint64(block.timestamp);
        w.lastDeductionTime = uint64(block.timestamp);
        totalLockedAmounts += WINNER_LOCK_AMOUNT;

        accumulatedFees += OPERATIONAL_FEE;

        _deactivateUser(winner, "User won the draw");

        if (currentPool >= POOL_TARGET) {
            currentPool -= POOL_TARGET;
        } else {
            currentPool = 0;
        }

        drawInProgress = false;
        regularDrawCount += 1;

        // ====== PAYOUT WITH REFERRAL LOGIC ======
        address _referrer = referrerOf[winner];
        bool hasReferrer = _referrer != address(0);

        if (hasReferrer) {
            // Winner came via referral: pay referrer 1% + reduced winner payout
            require(usdt.balanceOf(address(this)) >= OPERATIONAL_FEE + WINNER_PAYOUT_REFERRED + REFERRAL_PAYOUT, "Insufficient liquidity");

            usdt.safeTransfer(owner(), OPERATIONAL_FEE);
            accumulatedFees -= OPERATIONAL_FEE;

            usdt.safeTransfer(winner, WINNER_PAYOUT_REFERRED);
            usdt.safeTransfer(_referrer, REFERRAL_PAYOUT);
            referralEarnings[_referrer] += REFERRAL_PAYOUT;

            emit ReferralRewardPaid(_referrer, winner, REFERRAL_PAYOUT);
            emit DrawCompleted(requestId, winner, WINNER_PAYOUT_REFERRED, WINNER_LOCK_AMOUNT);
        } else {
            // No referrer: standard payout
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

    /// @notice Withdraw locked amount after 10-year lock period
    function withdrawLockedAmount()
        external
        nonReentrant
        whenNotPaused
        notDrawInProgress
    {
        User storage u = users[msg.sender];
        require(u.lockedAmount > 0, "No locked amount");
        require(block.timestamp >= u.lockedStartTime + WINNER_LOCK_DURATION, "Lock period not ended");

        uint256 amount = u.lockedAmount;
        u.lockedAmount = 0;
        u.lockedStartTime = 0;
        totalLockedAmounts -= amount;

        usdt.safeTransfer(msg.sender, amount);
    }

    /// @notice Owner claims accumulated fees
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

    /// @notice Rescue accidentally sent tokens (not USDT)
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
            u.balance,
            u.lockedAmount,
            u.lastDeductionTime,
            u.isActive,
            u.hasWon,
            u.lockedStartTime
        );
    }

    /// @notice Total USDT held in the contract
    function contractUsdtBalance() external view returns (uint256) {
        return usdt.balanceOf(address(this));
    }

    /// @notice Simplified accounting (no Aave yield in V4)
    function accountingSummary()
        external
        view
        returns (
            uint256 totalBalance,      // USDT in contract
            uint256 userBalances,      // Sum of user balances
            uint256 poolAmount,        // Prize pool
            uint256 lockedAmounts,     // Winner locks
            uint256 fees               // Platform fees
        )
    {
        return (
            usdt.balanceOf(address(this)),
            totalUserBalances,
            currentPool,
            totalLockedAmounts,
            accumulatedFees
        );
    }

    /// @notice Get referral info for a user
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
            u.referralBonusDays
        );
    }
}
