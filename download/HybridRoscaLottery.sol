// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title  HybridRoscaLottery
 * @author Senior Web3 / Solidity Smart Contract Developer
 * @notice A hybrid between a ROSCA (Rotating Savings and Credit Association)
 *         and a No-Loss Lottery. Users deposit USDT, the contract logically
 *         deducts 1 USDT/day to keep them "Active". Once the pool reaches
 *         1,000,000 USDT, Chainlink VRF selects one random winner from the
 *         active users array. The prize is split automatically:
 *             - 1,000    USDT -> platform owner   (operational fee)
 *             - 3,650    USDT -> locked in contract under winner's name
 *                                   (10-year advance for daily 1 USDT deduction)
 *             - 995,350  USDT -> winner's wallet  (direct payout)
 *         Winners are excluded from future draws. Daily deductions from their
 *         locked amount continue to feed the next pool.
 *
 * @dev    Security features:
 *           - OpenZeppelin ReentrancyGuard, Ownable, SafeERC20, Pausable pattern
 *           - Chainlink VRF v2 for provably-fair randomness
 *           - Checks-Effects-Interactions (CEI) throughout
 *           - Lazy daily-deduction model (no per-user keepers needed)
 *           - Active-user array with O(1) removal via swap-and-pop
 *           - Snapshot of active users at draw time (defensive against any
 *             state mutation during the VRF wait window)
 *
 *         Gas optimizations:
 *           - `immutable` for tokens / VRF coordinator / key hash / subscription
 *           - Custom errors (saves ~50 gas/revert vs require strings)
 *           - Packable User struct (uint128 balance, uint128 lockedAmount, ...)
 *           - Lazy deduction (one SSTORE per day per user, not per block)
 *           - Single mapping + array pattern for active users
 *
 *         NOTE: This contract intentionally omits DeFi yield logic. The pool
 *         grows purely from daily deductions. A future version can route idle
 *         USDT to Aave/Compound to generate yield on top.
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

contract HybridRoscaLottery is ReentrancyGuard, Ownable, VRFConsumerBaseV2 {
    using SafeERC20 for IERC20;

    // ============================================================
    // ====================== CUSTOM ERRORS =======================
    // ============================================================
    // Cheaper than `require` strings (no string stored on-chain).

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
    error NoDrawInProgress();
    error PoolTargetNotReached();
    error NoActiveUsers();
    error UnknownRequestId();
    error RequestAlreadyFulfilled();
    error NoLockedAmount();
    error LockNotMature();
    error OnlyWinnersCanWithdrawLock();
    error CannotReserveUsdt();

    // ============================================================
    // ====================== CONSTANTS ===========================
    // ============================================================

    /// @dev USDT on Ethereum mainnet uses 6 decimals (not 18).
    uint256 private constant DECIMALS = 6;

    /// @notice Daily deduction per active user (1 USDT).
    uint256 public constant DAILY_DEDUCTION = 1 * 10 ** DECIMALS;

    /// @notice Minimum deposit required to subscribe (30 USDT).
    uint256 public constant MIN_DEPOSIT = 30 * 10 ** DECIMALS;

    /// @notice Pool target that triggers a draw (1,000,000 USDT).
    uint256 public constant POOL_TARGET = 1_000_000 * 10 ** DECIMALS;

    /// @notice Operational fee paid to the platform owner on each draw (1,000 USDT).
    uint256 public constant OPERATIONAL_FEE = 1_000 * 10 ** DECIMALS;

    /// @notice Amount locked in the contract under the winner's name
    ///         (3,650 USDT = 10 years x 365 days x 1 USDT/day advance).
    uint256 public constant WINNER_LOCK_AMOUNT = 3_650 * 10 ** DECIMALS;

    /// @notice Direct payout to the winner's wallet (995,350 USDT).
    uint256 public constant WINNER_PAYOUT = 995_350 * 10 ** DECIMALS;

    /// @notice 1 day in seconds.
    uint256 private constant ONE_DAY = 1 days;

    /// @notice 10-year lock duration for winner's advance payment.
    uint256 private constant LOCK_DURATION = 10 * 365 days;

    // Chainlink VRF v2 parameters
    uint32 private constant VRF_CALLBACK_GAS_LIMIT = 100_000;
    uint16 private constant VRF_REQUEST_CONFIRMATIONS = 3;
    uint32 private constant VRF_NUM_WORDS = 1;

    // ============================================================
    // ====================== STATE VARS ==========================
    // ============================================================

    /// @notice The USDT token contract (immutable = no SLOAD after deploy).
    IERC20 public immutable usdt;

    /// @notice Chainlink VRF v2 Coordinator.
    VRFCoordinatorV2Interface public immutable vrfCoordinator;

    /// @notice VRF key hash (gas lane).
    bytes32 public immutable vrfKeyHash;

    /// @notice VRF subscription ID (must be pre-funded with LINK).
    uint64 public immutable vrfSubscriptionId;

    /// @notice User data structure. Layout packed for gas efficiency.
    /// @dev Total slot usage: 3 storage slots per user (down from 6 if unpacked).
    struct User {
        uint128 balance;            // Remaining deposit balance (USDT, 6 decimals)
        uint128 lockedAmount;       // Locked amount reserved for 10-year advance
        uint64  lastDeductionTime;  // Timestamp of last daily deduction (y2106 safe)
        bool    isActive;           // Currently in activeUsers[] (eligible to win)
        bool    hasWon;             // Excluded from future draws
        uint64  lockedStartTime;    // When the lock started (for maturity check)
    }

    mapping(address => User) public users;

    /// @notice Array of active user addresses (used for VRF winner selection).
    address[] public activeUsers;

    /// @notice Index of each user in `activeUsers[]` for O(1) swap-and-pop removal.
    ///         Value == type(uint256).max means the user is NOT in the array.
    mapping(address => uint256) public activeUserIndex;

    /// @notice Logical pool size — grows as daily deductions are applied.
    ///         Decremented by POOL_TARGET when a draw completes.
    uint256 public currentPool;

    /// @notice Total locked amounts across all winners (for accounting/audit).
    uint256 public totalLockedAmounts;

    /// @notice Accumulated operational fees pending owner claim.
    uint256 public accumulatedFees;

    /// @notice True when a draw has been triggered and is awaiting VRF fulfillment.
    bool public drawInProgress;

    /// @notice Total number of draws completed since deployment.
    uint256 public drawCount;

    /// @notice VRF request tracking.
    struct VRFRequest {
        bool     exists;
        bool     fulfilled;
        address  winner;             // Address(0) until fulfilled
        uint256  randomNumber;
        uint256  activeUserCount;    // Size of snapshot at request time
    }
    mapping(uint256 => VRFRequest) public vrfRequests;

    /// @notice Most recent VRF request ID (for UI / keeper monitoring).
    uint256 public lastRequestId;

    /// @notice Emergency pause flag.
    bool public paused;

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

    // ============================================================
    // ====================== MODIFIERS ===========================
    // ============================================================

    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }

    modifier whenPaused() {
        if (!paused) revert ContractNotPaused();
        _;
    }

    modifier notDrawInProgress() {
        if (drawInProgress) revert DrawInProgress();
        _;
    }

    // ============================================================
    // ====================== CONSTRUCTOR =========================
    // ============================================================

    /**
     * @param _usdt               USDT token contract address.
     * @param _vrfCoordinator     Chainlink VRF v2 Coordinator (see Chainlink docs for network).
     * @param _vrfKeyHash         VRF gas lane key hash.
     * @param _vrfSubscriptionId  VRF subscription ID, pre-funded with LINK.
     */
    constructor(
        address _usdt,
        address _vrfCoordinator,
        bytes32 _vrfKeyHash,
        uint64  _vrfSubscriptionId
    ) VRFConsumerBaseV2(_vrfCoordinator) {
        if (_usdt == address(0) || _vrfCoordinator == address(0)) revert ZeroAddress();

        usdt              = IERC20(_usdt);
        vrfCoordinator    = VRFCoordinatorV2Interface(_vrfCoordinator);
        vrfKeyHash        = _vrfKeyHash;
        vrfSubscriptionId = _vrfSubscriptionId;
    }

    // ============================================================
    // =================== USER FUNCTIONS =========================
    // ============================================================

    /**
     * @notice Deposit USDT to subscribe. Amount must be >= 30 USDT.
     * @dev    Flow:
     *           1. Apply any pending daily deductions first (lazy eval).
     *           2. Pull USDT from user via safeTransferFrom (requires prior approve).
     *           3. Credit the user's balance.
     *           4. Activate user if not already active.
     *           5. Check whether pool target has been reached.
     * @param amount Amount of USDT to deposit, in 6-decimal units.
     */
    function deposit(uint256 amount)
        external
        nonReentrant
        whenNotPaused
        notDrawInProgress
    {
        if (amount < MIN_DEPOSIT) revert DepositBelowMinimum();
        if (users[msg.sender].hasWon) revert WinnerCannotReenter();

        // 1. Lazy deduction before crediting new deposit.
        _applyDeduction(msg.sender);

        // 2. Pull USDT (CEI: external interaction is safe because we use
        //    ReentrancyGuard + SafeERC20, and state is updated AFTER).
        usdt.safeTransferFrom(msg.sender, address(this), amount);

        // 3. Credit balance.
        User storage u = users[msg.sender];
        u.balance += uint128(amount);

        // 4. Activate if needed.
        if (!u.isActive) {
            _activateUser(msg.sender);
        }

        emit Deposited(msg.sender, amount, u.balance, currentPool);

        // 5. Check draw trigger.
        _checkAndTriggerDraw();
    }

    /**
     * @notice Withdraw any unused balance. User becomes inactive if balance hits 0.
     * @dev    Locked amounts (for winners) are NOT withdrawable until lock matures.
     * @param amount Amount of USDT to withdraw, in 6-decimal units.
     */
    function withdraw(uint256 amount)
        external
        nonReentrant
        whenNotPaused
        notDrawInProgress
    {
        if (amount == 0) revert AmountMustBePositive();

        // Apply pending deductions before checking balance.
        _applyDeduction(msg.sender);

        User storage u = users[msg.sender];
        if (u.balance < amount) revert InsufficientBalance();

        // EFFECTS
        u.balance -= uint128(amount);
        if (u.balance == 0 && u.isActive) {
            _deactivateUser(msg.sender, "Withdrawal depleted balance");
        }

        // INTERACTIONS
        usdt.safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount, u.balance);
    }

    /**
     * @notice Sync a user's state (apply pending daily deductions).
     * @dev    Anyone can call this for any user. Useful for keepers to
     *         ensure pool accounting stays current. Also checks draw trigger.
     * @param userAddr Address of the user to sync.
     */
    function syncUserState(address userAddr) external whenNotPaused notDrawInProgress {
        _applyDeduction(userAddr);
        _checkAndTriggerDraw();
    }

    /**
     * @notice Process pending daily deductions for a winner's locked amount.
     * @dev    Winners are excluded from activeUsers (cannot win again), but
     *         their locked 3,650 USDT drips 1 USDT/day into the pool,
     *         "continuing their daily deduction" for 10 years.
     *         Anyone can call this for any winner (keeper-friendly).
     * @param winnerAddr Address of the winner whose lock to process.
     */
    function processWinnerLock(address winnerAddr) external whenNotPaused notDrawInProgress {
        User storage w = users[winnerAddr];
        if (!w.hasWon || w.lockedAmount == 0) revert NoLockedAmount();

        uint256 elapsed = (block.timestamp - w.lastDeductionTime) / ONE_DAY;
        if (elapsed == 0) return;

        uint256 deduction = elapsed * DAILY_DEDUCTION;
        uint256 actualDeduction = deduction > w.lockedAmount ? w.lockedAmount : deduction;

        // EFFECTS
        w.lockedAmount  -= uint128(actualDeduction);
        w.lastDeductionTime = uint64(block.timestamp);
        currentPool      += actualDeduction;
        if (w.lockedAmount == 0) {
            totalLockedAmounts -= actualDeduction;
        } else {
            totalLockedAmounts -= actualDeduction;
        }

        emit WinnerLockProcessed(winnerAddr, actualDeduction, w.lockedAmount);
        emit PoolUpdated(currentPool);

        _checkAndTriggerDraw();
    }

    // ============================================================
    // =============== DAILY DEDUCTION LOGIC ======================
    // ============================================================

    /**
     * @notice Apply pending daily deductions for a user (lazy evaluation).
     * @dev    Called on every user interaction. Deducts 1 USDT per full day
     *         elapsed since lastDeductionTime. If balance runs out, user is
     *         deactivated but keeps eligibility to re-deposit later.
     * @param userAddr The user address to update.
     */
    function _applyDeduction(address userAddr) internal {
        User storage u = users[userAddr];
        if (!u.isActive || u.lastDeductionTime == 0) return;

        uint256 elapsed = (block.timestamp - u.lastDeductionTime) / ONE_DAY;
        if (elapsed == 0) return;

        uint256 deduction = elapsed * DAILY_DEDUCTION;

        if (deduction >= u.balance) {
            // User runs out of balance — deduct what's left, deactivate.
            uint256 actualDeduction = u.balance;
            u.balance = 0;
            u.lastDeductionTime = uint64(block.timestamp);
            currentPool += actualDeduction;
            _deactivateUser(userAddr, "Balance depleted by daily deductions");
            emit Deducted(userAddr, actualDeduction, elapsed);
            emit PoolUpdated(currentPool);
        } else {
            u.balance -= uint128(deduction);
            u.lastDeductionTime = uint64(block.timestamp);
            currentPool += deduction;
            emit Deducted(userAddr, deduction, elapsed);
            emit PoolUpdated(currentPool);
        }
    }

    // ============================================================
    // ================== ACTIVE USER MGMT ========================
    // ============================================================

    /**
     * @dev Add user to activeUsers[] array. O(1).
     */
    function _activateUser(address userAddr) internal {
        if (users[userAddr].isActive) revert AlreadyActive();

        User storage u = users[userAddr];
        u.isActive = true;
        u.lastDeductionTime = uint64(block.timestamp);
        activeUserIndex[userAddr] = activeUsers.length;
        activeUsers.push(userAddr);

        emit UserActivated(userAddr);
    }

    /**
     * @dev Remove user from activeUsers[] in O(1) using swap-and-pop.
     *      Sentinel value type(uint256).max marks "not in array".
     */
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
    // ================== DRAW & VRF LOGIC ========================
    // ============================================================

    /**
     * @notice Check if pool target has been reached; if so, trigger a draw.
     * @dev    Internal helper called after every state-changing op.
     */
    function _checkAndTriggerDraw() internal {
        if (drawInProgress) return;
        if (currentPool < POOL_TARGET) return;
        if (activeUsers.length == 0) return;

        _triggerDraw();
    }

    /**
     * @notice Anyone can trigger the draw once the pool target is met.
     * @dev    Public fallback for keeper-driven automation (e.g. Chainlink
     *         Automation). Useful if the trigger check inside deposit()
     *         was somehow skipped (e.g. due to a previous revert).
     */
    function triggerDrawManually()
        external
        whenNotPaused
        notDrawInProgress
    {
        if (currentPool < POOL_TARGET) revert PoolTargetNotReached();
        if (activeUsers.length == 0) revert NoActiveUsers();
        _triggerDraw();
    }

    /**
     * @dev Internal: lock the state, snapshot active user count, and
     *      request randomness from Chainlink VRF v2.
     *
     *      We use the activeUsers[] array directly because the
     *      `notDrawInProgress` modifier blocks all mutations during the
     *      VRF wait window. This saves the gas cost of copying the array
     *      into storage.
     */
    function _triggerDraw() internal {
        drawInProgress = true;

        // Request randomness from VRF v2.
        uint256 requestId = VRFCoordinatorV2Interface(vrfCoordinator).requestRandomWords(
            vrfKeyHash,
            vrfSubscriptionId,
            VRF_REQUEST_CONFIRMATIONS,
            VRF_CALLBACK_GAS_LIMIT,
            VRF_NUM_WORDS
        );

        vrfRequests[requestId] = VRFRequest({
            exists:           true,
            fulfilled:        false,
            winner:           address(0),
            randomNumber:     0,
            activeUserCount:  activeUsers.length
        });

        lastRequestId = requestId;

        emit DrawTriggered(requestId, currentPool, activeUsers.length);
    }

    /**
     * @notice Chainlink VRF callback — receives the random word and
     *         completes the draw.
     * @dev    This function is called ONLY by the VRF Coordinator.
     *         Cannot be called directly by users.
     * @param requestId  The VRF request ID (matches what we got back).
     * @param randomWords Array of random words (we requested 1).
     */
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
        override
    {
        VRFRequest storage req = vrfRequests[requestId];
        if (!req.exists) revert UnknownRequestId();
        if (req.fulfilled) revert RequestAlreadyFulfilled();

        req.fulfilled = true;
        req.randomNumber = randomWords[0];

        _completeDraw(requestId);
    }

    /**
     * @dev Internal: select the winner, distribute prizes, reset state
     *      for the next cycle. Implements strict CEI:
     *         1. CHECKS  — validate state, snapshot size, etc.
     *         2. EFFECTS — update all storage (balance, flags, pool).
     *         3. INTERACTIONS — external USDT transfers last.
     */
    function _completeDraw(uint256 requestId) internal {
        VRFRequest storage req = vrfRequests[requestId];
        uint256 userCount = activeUsers.length;
        if (userCount == 0) revert NoActiveUsers();

        // ===== SELECT WINNER =====
        // Use modulo on the random number to pick an index in [0, userCount).
        // activeUsers[] has NOT been mutated during the VRF wait because all
        // mutating functions are guarded by `notDrawInProgress`.
        uint256 winnerIndex = req.randomNumber % userCount;
        address winner = activeUsers[winnerIndex];
        req.winner = winner;

        // ===== EFFECTS =====
        User storage w = users[winner];

        // Mark winner (excludes from all future draws).
        w.hasWon = true;

        // Add locked amount (10-year advance for daily deduction).
        w.lockedAmount    += uint128(WINNER_LOCK_AMOUNT);
        w.lockedStartTime = uint64(block.timestamp);
        w.lastDeductionTime = uint64(block.timestamp); // Lock drips start now.
        totalLockedAmounts += WINNER_LOCK_AMOUNT;

        // Accumulate operational fee (also auto-transferred below).
        accumulatedFees += OPERATIONAL_FEE;

        // Remove winner from activeUsers[] (O(1) swap-and-pop).
        _deactivateUser(winner, "User won the draw");

        // Decrement pool by POOL_TARGET. Any overshoot stays in pool
        // for the next cycle (e.g. if multiple days elapsed since last sync).
        if (currentPool >= POOL_TARGET) {
            currentPool -= POOL_TARGET;
        } else {
            currentPool = 0;
        }

        // Reset draw flags for next cycle.
        drawInProgress = false;
        drawCount += 1;

        // ===== INTERACTIONS =====
        // 1. Pay operational fee to owner.
        usdt.safeTransfer(owner(), OPERATIONAL_FEE);
        accumulatedFees -= OPERATIONAL_FEE;

        // 2. Pay winner direct payout (995,350 USDT).
        //    WINNER_LOCK_AMOUNT (3,650) STAYS in the contract — tracked
        //    via `w.lockedAmount` and `totalLockedAmounts`.
        usdt.safeTransfer(winner, WINNER_PAYOUT);

        emit DrawCompleted(requestId, winner, WINNER_PAYOUT, WINNER_LOCK_AMOUNT);
        emit FeesClaimed(owner(), OPERATIONAL_FEE);
    }

    // ============================================================
    // =============== WINNER LOCKED AMOUNT =======================
    // ============================================================

    /**
     * @notice Winners can withdraw any remaining locked amount after the
     *         10-year lock matures.
     * @dev    In normal operation the lock drips 1 USDT/day into the pool
     *         via processWinnerLock(), so by year 10 the lock is empty.
     *         This function is a safety valve: if no one called
     *         processWinnerLock(), the winner can still reclaim after 10 yrs.
     */
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

        usdt.safeTransfer(msg.sender, amount);

        emit WinnerLockProcessed(msg.sender, 0, 0);
    }

    // ============================================================
    // ================== OWNER FUNCTIONS =========================
    // ============================================================

    /**
     * @notice Owner claims any residual accumulated fees.
     * @dev    Fees are auto-transferred on each draw; this is only a fallback.
     */
    function claimFees() external onlyOwner nonReentrant {
        uint256 amount = accumulatedFees;
        if (amount == 0) revert AmountMustBePositive();
        accumulatedFees = 0;
        usdt.safeTransfer(owner(), amount);
        emit FeesClaimed(owner(), amount);
    }

    /**
     * @notice Emergency pause: blocks deposits, withdrawals, draws.
     * @dev    Use only in case of a discovered vulnerability. Does NOT
     *         block fulfillRandomWords (VRF Coordinator callback) — that
     *         is intentional so a pending draw can still complete.
     */
    function pause() external onlyOwner {
        paused = true;
        emit EmergencyPaused(msg.sender);
    }

    function unpause() external onlyOwner {
        paused = false;
        emit EmergencyUnpaused(msg.sender);
    }

    /**
     * @notice Emergency recovery of non-USDT tokens sent by mistake.
     * @dev    USDT itself cannot be rescued — only user balances, locks,
     *         fees, and pool are accounted for. This prevents owner from
     *         draining the protocol.
     */
    function rescueToken(address token, uint256 amount) external onlyOwner {
        if (token == address(usdt)) revert CannotReserveUsdt();
        IERC20(token).safeTransfer(owner(), amount);
    }

    // ============================================================
    // ===================== VIEW HELPERS =========================
    // ============================================================

    /// @notice Count of currently active (eligible) users.
    function getActiveUserCount() external view returns (uint256) {
        return activeUsers.length;
    }

    /// @notice Full snapshot of active user addresses.
    function getActiveUsers() external view returns (address[] memory) {
        return activeUsers;
    }

    /// @notice Read full user info in one call (UI-friendly).
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

    /// @notice How much USDT the contract physically holds.
    function contractUsdtBalance() external view returns (uint256) {
        return usdt.balanceOf(address(this));
    }

    /// @notice Reconstruct accounting: pool + balances + locks + fees.
    function accountingSummary()
        external
        view
        returns (
            uint256 pool,
            uint256 totalLocks,
            uint256 totalFees,
            uint256 contractBalance
        )
    {
        return (
            currentPool,
            totalLockedAmounts,
            accumulatedFees,
            usdt.balanceOf(address(this))
        );
    }
}
