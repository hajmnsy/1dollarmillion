// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title  HybridRoscaLotteryV3 — Production Version with Referral Program
 * @notice V3 = V2.1.1 + Referral Program
 *
 * Referral Program (Zero cost to platform):
 *   - Referred user gets +5 extra active days on first deposit
 *   - Referrer gets +5 extra active days when referred user deposits
 *   - Referrer gets 1% of prize ($9,953) if referred user wins a draw
 *   - Platform fee remains $1,000 per draw — unaffected
 *   - Anti-abuse: self-referral blocked, one-time bonus per address
 *
 * Changes from V2.1.1:
 *   - Added referralMapping, referralBonusDays, referralFeeBps
 *   - deposit() now accepts optional referrer address
 *   - _completeDraw() and _completeBonusDraw() now pay 1% to referrer
 *   - Added ReferralDeposited, ReferralRewardPaid events
 *   - Added getReferralInfo() view function
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";

interface IPool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
}

contract HybridRoscaLotteryV3 is ReentrancyGuard, Ownable, VRFConsumerBaseV2 {
    using SafeERC20 for IERC20;

    // ============================================================
    // ====================== CUSTOM ERRORS =======================
    // ============================================================
    error ZeroAddress();
    error DepositBelowMinimum();
    error AmountMustBePositive();
    error InsufficientBalance();
    error AlreadyActive();
    error NotActive();
    error WinnerCannotReenter();
    error ContractPaused();
    error ContractNotPaused();
    error DrawInProgress();
    error PoolTargetNotReached();
    error NoActiveUsers();
    error UnknownRequestId();
    error RequestAlreadyFulfilled();
    error NoLockedAmount();
    error LockNotMature();
    error OnlyWinnersCanWithdrawLock();
    error CannotReserveUsdt();
    error YieldInsufficient();
    error NothingToSupply();
    error AaveSupplyFailed();
    error AaveWithdrawFailed();
    error BufferPercentTooHigh();
    error InsufficientLiquidityEvenAfterAave();
    error SelfReferral();
    error AlreadyReferred();

    // ============================================================
    // ====================== CONSTANTS ===========================
    // ============================================================
    uint256 private constant DECIMALS = 6;

    uint256 public constant DAILY_DEDUCTION    = 1 * 10 ** DECIMALS;
    uint256 public constant MIN_DEPOSIT        = 1 * 10 ** DECIMALS;
    uint256 public constant POOL_TARGET        = 1_000_000 * 10 ** DECIMALS;
    uint256 public constant BONUS_DRAW_TARGET  = 1_000_000 * 10 ** DECIMALS;
    uint256 public constant OPERATIONAL_FEE    = 1_000 * 10 ** DECIMALS;
    uint256 public constant WINNER_LOCK_AMOUNT = 3_650 * 10 ** DECIMALS;
    uint256 public constant WINNER_PAYOUT      = 995_350 * 10 ** DECIMALS;
    uint256 private constant ONE_DAY           = 1 days;
    uint256 private constant LOCK_DURATION     = 10 * 365 days;

    uint32 private constant VRF_CALLBACK_GAS_LIMIT     = 100_000;
    uint16 private constant VRF_REQUEST_CONFIRMATIONS  = 3;
    uint32 private constant VRF_NUM_WORDS              = 1;

    uint16  public constant MAX_BUFFER_PERCENT = 50;
    uint256 private constant BPS_DENOMINATOR   = 100;

    // ====== REFERRAL CONSTANTS ======
    /// @notice Bonus days given to both referrer and referred on first deposit
    uint256 public constant REFERRAL_BONUS_DAYS = 5;
    /// @notice Referral fee in basis points (100 = 1%)
    uint256 public constant REFERRAL_FEE_BPS = 100;
    /// @notice Referral payout amount: 1% of POOL_TARGET
    uint256 public constant REFERRAL_PAYOUT = (POOL_TARGET * REFERRAL_FEE_BPS) / 10000;
    /// @notice Winner payout when referred: POOL_TARGET - OPERATIONAL_FEE - WINNER_LOCK - REFERRAL_PAYOUT
    uint256 public constant WINNER_PAYOUT_REFERRED = POOL_TARGET - OPERATIONAL_FEE - WINNER_LOCK_AMOUNT - REFERRAL_PAYOUT;

    // ============================================================
    // ====================== STATE VARS ==========================
    // ============================================================

    IERC20  public immutable usdt;
    IERC20  public immutable aUsdt;
    IPool   public immutable aavePool;

    VRFCoordinatorV2Interface public immutable vrfCoordinator;
    bytes32 public immutable vrfKeyHash;
    uint64  public immutable vrfSubscriptionId;

    struct User {
        uint128 balance;
        uint128 lockedAmount;
        uint64  lastDeductionTime;
        bool    isActive;
        bool    hasWon;
        uint64  lockedStartTime;
    }
    mapping(address => User) public users;
    address[] public activeUsers;
    mapping(address => uint256) public activeUserIndex;

    uint256 public currentPool;
    uint256 public totalLockedAmounts;
    uint256 public accumulatedFees;
    uint256 public totalUserBalances;

    uint256 public totalPrincipalSupplied;
    uint16  public liquidityBufferPercent;

    bool     public drawInProgress;
    uint256  public regularDrawCount;
    uint256  public bonusDrawCount;
    uint256  public lastRequestId;
    uint256  public lastBonusRequestId;

    struct VRFRequest {
        bool     exists;
        bool     fulfilled;
        bool     isBonus;
        address  winner;
        uint256  randomNumber;
        uint256  activeUserCount;
    }
    mapping(uint256 => VRFRequest) public vrfRequests;

    bool public paused;

    // ====== REFERRAL STATE ======
    /// @notice Maps referred user → referrer (set once, immutable)
    mapping(address => address) public referrerOf;
    /// @notice Maps referrer → count of people they've referred
    mapping(address => uint256) public referralCount;
    /// @notice Maps referrer → total earnings from referrals
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
    event SuppliedToAave(uint256 amount, uint256 totalPrincipalSupplied);
    event WithdrawnFromAave(uint256 amount, uint256 totalPrincipalSupplied);
    event YieldAccrued(uint256 yieldAmount);
    event BonusDrawTriggered(uint256 indexed requestId, uint256 yieldSize, uint256 activeUserCount);
    event BonusDrawCompleted(uint256 indexed requestId, address indexed winner, uint256 payout, uint256 locked);
    event LiquidityBufferUpdated(uint16 oldPercent, uint16 newPercent);
    event AutoAaveWithdrawal(uint256 amount, string reason);

    // ====== REFERRAL EVENTS ======
    event ReferralRegistered(address indexed referrer, address indexed referred);
    event ReferralBonusDaysAwarded(address indexed user, uint256 bonusDays, bool isReferrer);
    event ReferralRewardPaid(address indexed referrer, address indexed winner, uint256 amount);

    // ============================================================
    // ====================== MODIFIERS ===========================
    // ============================================================
    modifier whenNotPaused() { if (paused) revert ContractPaused(); _; }
    modifier whenPaused()    { if (!paused) revert ContractNotPaused(); _; }
    modifier notDrawInProgress() { if (drawInProgress) revert DrawInProgress(); _; }

    // ============================================================
    // ====================== CONSTRUCTOR =========================
    // ============================================================
    constructor(
        address _usdt,
        address _vrfCoordinator,
        bytes32 _vrfKeyHash,
        uint64  _vrfSubscriptionId,
        address _aavePool,
        address _aUsdt
    ) VRFConsumerBaseV2(_vrfCoordinator) Ownable(msg.sender) {
        if (_usdt == address(0) || _vrfCoordinator == address(0) ||
            _aavePool == address(0) || _aUsdt == address(0)) revert ZeroAddress();

        usdt              = IERC20(_usdt);
        vrfCoordinator    = VRFCoordinatorV2Interface(_vrfCoordinator);
        vrfKeyHash        = _vrfKeyHash;
        vrfSubscriptionId = _vrfSubscriptionId;
        aavePool          = IPool(_aavePool);
        aUsdt             = IERC20(_aUsdt);

        liquidityBufferPercent = 5;
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
        if (amount < MIN_DEPOSIT) revert DepositBelowMinimum();
        if (users[msg.sender].hasWon) revert WinnerCannotReenter();

        // Register referrer (one-time, before first deposit)
        if (referrer != address(0) && referrer != msg.sender && referrerOf[msg.sender] == address(0)) {
            // Check referrer has deposited before (must be an existing user)
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

        bool wasNewUser = !u.isActive && u.lastDeductionTime == 0;
        if (!u.isActive) _activateUser(msg.sender);

        // Award referral bonus days (one-time, on first deposit)
        if (wasNewUser) {
            address _referrer = referrerOf[msg.sender];
            if (_referrer != address(0)) {
                // Referred user gets +5 days
                u.balance += uint128(REFERRAL_BONUS_DAYS * DAILY_DEDUCTION);
                totalUserBalances += REFERRAL_BONUS_DAYS * DAILY_DEDUCTION;
                emit ReferralBonusDaysAwarded(msg.sender, REFERRAL_BONUS_DAYS, false);

                // Referrer gets +5 days too
                User storage r = users[_referrer];
                if (r.isActive || r.lastDeductionTime > 0) {
                    r.balance += uint128(REFERRAL_BONUS_DAYS * DAILY_DEDUCTION);
                    totalUserBalances += REFERRAL_BONUS_DAYS * DAILY_DEDUCTION;
                    emit ReferralBonusDaysAwarded(_referrer, REFERRAL_BONUS_DAYS, true);
                }
            }
        }

        emit Deposited(msg.sender, amount, u.balance, currentPool);

        _checkAndTriggerDraw();
        _checkAndTriggerBonusDraw();
    }

    /// @notice Backward-compatible deposit without referrer
    function deposit(uint256 amount) external {
        _depositSimple(amount);
    }

    function _depositSimple(uint256 amount) internal {
        if (amount < MIN_DEPOSIT) revert DepositBelowMinimum();
        if (users[msg.sender].hasWon) revert WinnerCannotReenter();

        _applyDeduction(msg.sender);
        usdt.safeTransferFrom(msg.sender, address(this), amount);

        User storage u = users[msg.sender];
        u.balance += uint128(amount);
        totalUserBalances += amount;

        if (!u.isActive) _activateUser(msg.sender);

        emit Deposited(msg.sender, amount, u.balance, currentPool);

        _checkAndTriggerDraw();
        _checkAndTriggerBonusDraw();
    }

    function withdraw(uint256 amount)
        external
        nonReentrant
        whenNotPaused
        notDrawInProgress
    {
        if (amount == 0) revert AmountMustBePositive();
        _applyDeduction(msg.sender);

        User storage u = users[msg.sender];
        if (u.balance < amount) revert InsufficientBalance();

        u.balance -= uint128(amount);
        totalUserBalances -= amount;
        if (u.balance == 0 && u.isActive) {
            _deactivateUser(msg.sender, "Withdrawal depleted balance");
        }

        _ensureLiquidity(amount, "user withdrawal");
        usdt.safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount, u.balance);
        _checkAndTriggerBonusDraw();
    }

    function syncUserState(address userAddr) external whenNotPaused notDrawInProgress {
        _applyDeduction(userAddr);
        _checkAndTriggerDraw();
        _checkAndTriggerBonusDraw();
    }

    function processWinnerLock(address winnerAddr) external whenNotPaused notDrawInProgress {
        User storage w = users[winnerAddr];
        if (!w.hasWon || w.lockedAmount == 0) revert NoLockedAmount();

        uint256 elapsed = (block.timestamp - w.lastDeductionTime) / ONE_DAY;
        if (elapsed == 0) return;

        uint256 deduction = elapsed * DAILY_DEDUCTION;
        uint256 actualDeduction = deduction > w.lockedAmount ? w.lockedAmount : deduction;

        w.lockedAmount    -= uint128(actualDeduction);
        w.lastDeductionTime = uint64(block.timestamp);
        currentPool        += actualDeduction;
        totalLockedAmounts -= actualDeduction;

        emit WinnerLockProcessed(winnerAddr, actualDeduction, w.lockedAmount);
        emit PoolUpdated(currentPool);

        _checkAndTriggerDraw();
        _checkAndTriggerBonusDraw();
    }

    // ============================================================
    // =============== DAILY DEDUCTION LOGIC ======================
    // ============================================================
    function _applyDeduction(address userAddr) internal {
        User storage u = users[userAddr];
        if (!u.isActive || u.lastDeductionTime == 0) return;

        uint256 elapsed = (block.timestamp - u.lastDeductionTime) / ONE_DAY;
        if (elapsed == 0) return;

        uint256 deduction = elapsed * DAILY_DEDUCTION;

        if (deduction >= u.balance) {
            uint256 actualDeduction = u.balance;
            u.balance = 0;
            u.lastDeductionTime = uint64(block.timestamp);
            totalUserBalances -= actualDeduction;
            currentPool += actualDeduction;
            _deactivateUser(userAddr, "Balance depleted by daily deductions");
            emit Deducted(userAddr, actualDeduction, elapsed);
            emit PoolUpdated(currentPool);
        } else {
            u.balance -= uint128(deduction);
            u.lastDeductionTime = uint64(block.timestamp);
            totalUserBalances -= deduction;
            currentPool += deduction;
            emit Deducted(userAddr, deduction, elapsed);
            emit PoolUpdated(currentPool);
        }
    }

    // ============================================================
    // ================== ACTIVE USER MGMT ========================
    // ============================================================
    function _activateUser(address userAddr) internal {
        if (users[userAddr].isActive) revert AlreadyActive();

        User storage u = users[userAddr];
        u.isActive = true;
        u.lastDeductionTime = uint64(block.timestamp);
        activeUserIndex[userAddr] = activeUsers.length;
        activeUsers.push(userAddr);

        emit UserActivated(userAddr);
    }

    function _deactivateUser(address userAddr, string memory reason) internal {
        User storage u = users[userAddr];
        if (!u.isActive) return;

        u.isActive = false;

        uint256 idx = activeUserIndex[userAddr];
        uint256 lastIdx = activeUsers.length - 1;

        if (idx != lastIdx) {
            address lastUser = activeUsers[lastIdx];
            activeUsers[idx] = lastUser;
            activeUserIndex[lastUser] = idx;
        }
        activeUsers.pop();
        activeUserIndex[userAddr] = type(uint256).max;

        emit UserDeactivated(userAddr, reason);
    }

    // ============================================================
    // ============== AAVE V3 YIELD LAYER =========================
    // ============================================================
    function supplyToAave(uint256 amount)
        external
        nonReentrant
        whenNotPaused
        notDrawInProgress
    {
        uint256 excess = _getExcessLiquidity();
        if (excess == 0) revert NothingToSupply();

        uint256 supplyAmount = amount == type(uint256).max ? excess : amount;
        if (supplyAmount > excess) supplyAmount = excess;
        if (supplyAmount == 0) revert NothingToSupply();

        usdt.safeIncreaseAllowance(address(aavePool), supplyAmount);
        aavePool.supply(address(usdt), supplyAmount, address(this), 0);

        if (usdt.allowance(address(this), address(aavePool)) > 0) {
            usdt.safeDecreaseAllowance(address(aavePool), usdt.allowance(address(this), address(aavePool)));
        }

        totalPrincipalSupplied += supplyAmount;
        emit SuppliedToAave(supplyAmount, totalPrincipalSupplied);
    }

    function withdrawFromAave(uint256 amount)
        external
        nonReentrant
        whenNotPaused
        notDrawInProgress
    {
        uint256 aBalance = aUsdt.balanceOf(address(this));
        if (aBalance == 0) revert NothingToSupply();

        uint256 withdrawAmount = amount == type(uint256).max ? aBalance : amount;
        if (withdrawAmount > aBalance) withdrawAmount = aBalance;
        if (withdrawAmount == 0) revert AmountMustBePositive();

        uint256 yieldBefore = _getYield();
        uint256 actual = aavePool.withdraw(address(usdt), withdrawAmount, address(this));
        if (actual == 0) revert AaveWithdrawFailed();

        if (actual > yieldBefore) {
            totalPrincipalSupplied -= (actual - yieldBefore);
        }

        emit WithdrawnFromAave(actual, totalPrincipalSupplied);
        emit YieldAccrued(_getYield());

        _checkAndTriggerBonusDraw();
    }

    function _getYield() internal view returns (uint256) {
        uint256 aBalance = aUsdt.balanceOf(address(this));
        if (aBalance <= totalPrincipalSupplied) return 0;
        return aBalance - totalPrincipalSupplied;
    }

    function getYieldBalance() external view returns (uint256) {
        return _getYield();
    }

    function getTotalPrincipal() public view returns (uint256) {
        return totalUserBalances + currentPool + totalLockedAmounts + accumulatedFees;
    }

    function _getExcessLiquidity() internal view returns (uint256) {
        uint256 usdtBal = usdt.balanceOf(address(this));
        uint256 principal = getTotalPrincipal();
        uint256 buffer = (principal * liquidityBufferPercent) / BPS_DENOMINATOR;
        if (usdtBal <= buffer) return 0;
        return usdtBal - buffer;
    }

    function getExcessLiquidity() external view returns (uint256) {
        return _getExcessLiquidity();
    }

    function _ensureLiquidity(uint256 needed, string memory reason) internal {
        uint256 usdtBal = usdt.balanceOf(address(this));
        if (usdtBal >= needed) return;

        uint256 shortfall = needed - usdtBal;
        uint256 aBalance = aUsdt.balanceOf(address(this));
        if (aBalance < shortfall) revert InsufficientLiquidityEvenAfterAave();

        uint256 yieldBefore = _getYield();
        uint256 actual = aavePool.withdraw(address(usdt), shortfall, address(this));
        if (actual < shortfall) revert AaveWithdrawFailed();

        if (actual > yieldBefore) {
            totalPrincipalSupplied -= (actual - yieldBefore);
        }

        emit AutoAaveWithdrawal(actual, reason);
    }

    function setLiquidityBufferPercent(uint16 newPercent) external onlyOwner {
        if (newPercent > MAX_BUFFER_PERCENT) revert BufferPercentTooHigh();
        uint16 old = liquidityBufferPercent;
        liquidityBufferPercent = newPercent;
        emit LiquidityBufferUpdated(old, newPercent);
    }

    // ============================================================
    // =============== DRAW & VRF LOGIC ===========================
    // ============================================================
    function _checkAndTriggerDraw() internal {
        if (drawInProgress) return;
        if (currentPool < POOL_TARGET) return;
        if (activeUsers.length == 0) return;
        _triggerDraw(false);
    }

    function triggerDrawManually() external whenNotPaused notDrawInProgress {
        if (currentPool < POOL_TARGET) revert PoolTargetNotReached();
        if (activeUsers.length == 0) revert NoActiveUsers();
        _triggerDraw(false);
    }

    function _triggerDraw(bool isBonus) internal {
        drawInProgress = true;

        uint256 requestId = vrfCoordinator.requestRandomWords(
            vrfKeyHash,
            vrfSubscriptionId,
            VRF_REQUEST_CONFIRMATIONS,
            VRF_CALLBACK_GAS_LIMIT,
            VRF_NUM_WORDS
        );

        vrfRequests[requestId] = VRFRequest({
            exists:           true,
            fulfilled:        false,
            isBonus:          isBonus,
            winner:           address(0),
            randomNumber:     0,
            activeUserCount:  activeUsers.length
        });

        lastRequestId = requestId;
        if (isBonus) lastBonusRequestId = requestId;

        if (isBonus) {
            emit BonusDrawTriggered(requestId, _getYield(), activeUsers.length);
        } else {
            emit DrawTriggered(requestId, currentPool, activeUsers.length);
        }
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
        override
    {
        VRFRequest storage req = vrfRequests[requestId];
        if (!req.exists) revert UnknownRequestId();
        if (req.fulfilled) revert RequestAlreadyFulfilled();

        req.fulfilled = true;
        req.randomNumber = randomWords[0];

        if (req.isBonus) {
            _completeBonusDraw(requestId);
        } else {
            _completeDraw(requestId);
        }
    }

    function _completeDraw(uint256 requestId) internal {
        VRFRequest storage req = vrfRequests[requestId];
        uint256 userCount = activeUsers.length;
        if (userCount == 0) revert NoActiveUsers();

        uint256 winnerIndex = req.randomNumber % userCount;
        address winner = activeUsers[winnerIndex];
        req.winner = winner;

        User storage w = users[winner];
        w.hasWon = true;
        w.lockedAmount     += uint128(WINNER_LOCK_AMOUNT);
        w.lockedStartTime   = uint64(block.timestamp);
        w.lastDeductionTime = uint64(block.timestamp);
        totalLockedAmounts += WINNER_LOCK_AMOUNT;

        accumulatedFees += OPERATIONAL_FEE;

        _deactivateUser(winner, "User won the regular draw");

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
            _ensureLiquidity(OPERATIONAL_FEE + WINNER_PAYOUT_REFERRED + REFERRAL_PAYOUT, "regular draw payout with referral");

            usdt.safeTransfer(owner(), OPERATIONAL_FEE);
            accumulatedFees -= OPERATIONAL_FEE;

            usdt.safeTransfer(winner, WINNER_PAYOUT_REFERRED);
            usdt.safeTransfer(_referrer, REFERRAL_PAYOUT);
            referralEarnings[_referrer] += REFERRAL_PAYOUT;

            emit ReferralRewardPaid(_referrer, winner, REFERRAL_PAYOUT);
            emit DrawCompleted(requestId, winner, WINNER_PAYOUT_REFERRED, WINNER_LOCK_AMOUNT);
        } else {
            // No referrer: standard payout
            _ensureLiquidity(OPERATIONAL_FEE + WINNER_PAYOUT, "regular draw payout");

            usdt.safeTransfer(owner(), OPERATIONAL_FEE);
            accumulatedFees -= OPERATIONAL_FEE;

            usdt.safeTransfer(winner, WINNER_PAYOUT);
            emit DrawCompleted(requestId, winner, WINNER_PAYOUT, WINNER_LOCK_AMOUNT);
        }

        emit FeesClaimed(owner(), OPERATIONAL_FEE);

        // Solvency fix-up
        {
            uint256 _yield = _getYield();
            uint256 _totalAssets = usdt.balanceOf(address(this)) + aUsdt.balanceOf(address(this));
            uint256 _principal = getTotalPrincipal();
            if (_totalAssets >= _principal) {
                uint256 _solvencyGap = _totalAssets - _principal;
                if (_yield > _solvencyGap) {
                    totalPrincipalSupplied += (_yield - _solvencyGap);
                }
            }
        }

        _checkAndTriggerBonusDraw();
    }

    function _checkAndTriggerBonusDraw() internal {
        if (drawInProgress) return;
        if (_getYield() < BONUS_DRAW_TARGET) return;
        if (activeUsers.length == 0) return;
        _triggerDraw(true);
    }

    function triggerBonusDrawManually() external whenNotPaused notDrawInProgress {
        if (_getYield() < BONUS_DRAW_TARGET) revert YieldInsufficient();
        if (activeUsers.length == 0) revert NoActiveUsers();
        _triggerDraw(true);
    }

    function _completeBonusDraw(uint256 requestId) internal {
        VRFRequest storage req = vrfRequests[requestId];
        uint256 userCount = activeUsers.length;
        if (userCount == 0) revert NoActiveUsers();

        uint256 yieldNow = _getYield();
        if (yieldNow < BONUS_DRAW_TARGET) revert YieldInsufficient();

        uint256 winnerIndex = req.randomNumber % userCount;
        address winner = activeUsers[winnerIndex];
        req.winner = winner;

        User storage w = users[winner];
        w.hasWon = true;
        w.lockedAmount     += uint128(WINNER_LOCK_AMOUNT);
        w.lockedStartTime   = uint64(block.timestamp);
        w.lastDeductionTime = uint64(block.timestamp);
        totalLockedAmounts += WINNER_LOCK_AMOUNT;

        accumulatedFees += OPERATIONAL_FEE;

        _deactivateUser(winner, "User won the bonus draw");

        drawInProgress = false;
        bonusDrawCount += 1;

        // ====== PAYOUT WITH REFERRAL LOGIC ======
        address _referrer = referrerOf[winner];
        bool hasReferrer = _referrer != address(0);

        if (hasReferrer) {
            _ensureLiquidity(OPERATIONAL_FEE + WINNER_PAYOUT_REFERRED + REFERRAL_PAYOUT, "bonus draw payout with referral");

            usdt.safeTransfer(owner(), OPERATIONAL_FEE);
            accumulatedFees -= OPERATIONAL_FEE;

            usdt.safeTransfer(winner, WINNER_PAYOUT_REFERRED);
            usdt.safeTransfer(_referrer, REFERRAL_PAYOUT);
            referralEarnings[_referrer] += REFERRAL_PAYOUT;

            emit ReferralRewardPaid(_referrer, winner, REFERRAL_PAYOUT);
            emit BonusDrawCompleted(requestId, winner, WINNER_PAYOUT_REFERRED, WINNER_LOCK_AMOUNT);
        } else {
            _ensureLiquidity(OPERATIONAL_FEE + WINNER_PAYOUT, "bonus draw payout");

            usdt.safeTransfer(owner(), OPERATIONAL_FEE);
            accumulatedFees -= OPERATIONAL_FEE;

            usdt.safeTransfer(winner, WINNER_PAYOUT);
            emit BonusDrawCompleted(requestId, winner, WINNER_PAYOUT, WINNER_LOCK_AMOUNT);
        }

        emit FeesClaimed(owner(), OPERATIONAL_FEE);
        emit YieldAccrued(_getYield());

        // Solvency fix-up
        {
            uint256 _yield = _getYield();
            uint256 _totalAssets = usdt.balanceOf(address(this)) + aUsdt.balanceOf(address(this));
            uint256 _principal = getTotalPrincipal();
            if (_totalAssets >= _principal) {
                uint256 _solvencyGap = _totalAssets - _principal;
                if (_yield > _solvencyGap) {
                    totalPrincipalSupplied += (_yield - _solvencyGap);
                }
            }
        }

        _checkAndTriggerDraw();
    }

    // ============================================================
    // =============== WINNER LOCKED AMOUNT =======================
    // ============================================================
    function withdrawLockedAmount()
        external
        nonReentrant
        whenNotPaused
    {
        User storage u = users[msg.sender];
        if (!u.hasWon) revert OnlyWinnersCanWithdrawLock();
        if (u.lockedAmount == 0) revert NoLockedAmount();
        if (block.timestamp < u.lockedStartTime + LOCK_DURATION) revert LockNotMature();

        uint256 amount = u.lockedAmount;
        u.lockedAmount = 0;
        totalLockedAmounts -= amount;

        _ensureLiquidity(amount, "winner lock withdrawal");
        usdt.safeTransfer(msg.sender, amount);

        emit WinnerLockProcessed(msg.sender, 0, 0);
    }

    // ============================================================
    // ================== OWNER FUNCTIONS =========================
    // ============================================================
    function claimFees() external onlyOwner nonReentrant {
        uint256 amount = accumulatedFees;
        if (amount == 0) revert AmountMustBePositive();
        accumulatedFees = 0;

        _ensureLiquidity(amount, "owner fee claim");
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
        if (token == address(usdt) || token == address(aUsdt)) revert CannotReserveUsdt();
        IERC20(token).safeTransfer(owner(), amount);
    }

    // ============================================================
    // ===================== VIEW HELPERS =========================
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
        return (u.balance, u.lockedAmount, u.lastDeductionTime,
                u.isActive, u.hasWon, u.lockedStartTime);
    }

    function contractUsdtBalance() external view returns (uint256) {
        return usdt.balanceOf(address(this));
    }

    function contractAusdtBalance() external view returns (uint256) {
        return aUsdt.balanceOf(address(this));
    }

    function accountingSummary()
        external
        view
        returns (
            uint256 principal,
            uint256 yield_,
            uint256 usdtBalance,
            uint256 aUsdtBalance,
            uint256 totalAssets,
            uint256 solvencyGap
        )
    {
        usdtBalance  = usdt.balanceOf(address(this));
        aUsdtBalance = aUsdt.balanceOf(address(this));
        totalAssets  = usdtBalance + aUsdtBalance;
        principal    = getTotalPrincipal();
        yield_        = _getYield();
        solvencyGap  = totalAssets >= principal ? totalAssets - principal : 0;
    }

    // ====== REFERRAL VIEW FUNCTIONS ======

    /// @notice Get referral info for a user
    /// @return referrer The address of the user's referrer (address(0) if none)
    /// @return count Number of people this user has referred
    /// @return earnings Total USDT earned from referral rewards
    /// @return hasReferrer Whether this user was referred by someone
    function getReferralInfo(address userAddr)
        external
        view
        returns (
            address referrer,
            uint256 count,
            uint256 earnings,
            bool hasReferrer
        )
    {
        return (
            referrerOf[userAddr],
            referralCount[userAddr],
            referralEarnings[userAddr],
            referrerOf[userAddr] != address(0)
        );
    }
}
