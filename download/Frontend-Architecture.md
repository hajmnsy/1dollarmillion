# Frontend Architecture Document — HybridRoSCA Lottery V2

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · wagmi v2 · viem · TanStack Query · RainbowKit · Framer Motion · shadcn/ui

**Contract:** `HybridRoscaLotteryV2.sol` (V2.1, `MIN_DEPOSIT = 1 USDT`)

**Audience:** This document is the single source of truth for frontend engineers building the dApp. It covers pages, components, contract bindings, UX strategy, and engineering conventions.

---

## 0. Design Principles

The entire UI is built around five non-negotiable principles. Every component decision in this document traces back to one of these:

1. **Trust-First Design** — This product holds user funds. Every screen must reinforce "your money is here, it's safe, and the math is verifiable." We use real-time on-chain numbers, link every claim to Etherscan, and never fake stats.
2. **Radical Transparency** — Pool size, yield, solvency gap, VRF request IDs, and Aave position are all surfaced on a dedicated dashboard. Users can audit the contract state in <3 clicks.
3. **Gas-Aware UX** — Every transaction shows estimated gas in USD before the user signs. We nudge (not force) users toward gas-efficient deposit sizes.
4. **Mobile-First, Wallet-First** — 70%+ of crypto users are on mobile. The UI is touch-optimized, supports WalletConnect deep-linking, and never blocks on a desktop-only flow.
5. **Optimistic & Real-Time** — Writes update the UI instantly (optimistic), then reconcile with the confirmed receipt. Pool/yield counters tick up in real time via polling + event subscriptions.

---

## 1. Information Architecture (Page Tree)

```
/                            → Landing Page (marketing + live pool counter)
/dashboard                   → Authenticated user dashboard
/dashboard/position          → My position (balance, status, lock)
/dashboard/activity          → My transaction history
/transparency                → Public transparency dashboard
/how-it-works                → Educational explainer
/winners                     → Past winners hall of fame
/faq                         → FAQ + risk disclosure
/admin                       → Owner-only panel (fees, pause, Aave ops)
```

**Routing model:**
- `/`, `/how-it-works`, `/winners`, `/faq`, `/transparency` → Server-Component pages with ISR (revalidate every 30s). These are SEO-critical and load fast even without a wallet.
- `/dashboard/*` → Client Components. Require wallet connection. Redirect to `/` if not connected.
- `/admin` → Client Component gated by `owner()` check.

---

## 2. Landing Page (`/`) — Conversion Engine

The landing page has one job: convert visitors into depositors. It must build trust in 5 seconds and offer a clear CTA in 10.

### 2.1 Page Structure (top → bottom)

| Section | Purpose | Key Elements |
|---|---|---|
| **Sticky Header** | Navigation + wallet | Logo · Nav links · "Connect Wallet" button (RainbowKit) |
| **Hero** | Hook + live proof | Headline: *"Deposit USDT. Win $1M. Never lose your money."* · Animated live pool counter ($X / $1,000,000) · Active users count · CTA: "Deposit & Enter" |
| **Trust Bar** | Credibility signals | Logos: Chainlink VRF · Aave V3 · OpenZeppelin · USDT · "Audited by [TBD]" badge · "Etherscan Verified" badge |
| **How It Works** | 3-step explainer | 1. Deposit USDT → 2. 1 USDT/day keeps you active → 3. Pool hits $1M → random winner · Each step has an icon + 1-line copy |
| **Live Stats** | Real-time proof | Pool progress bar · Yield generated (24h delta) · Total disbursed to winners · Draws completed |
| **Winner Showcase** | Social proof | Last 3 winners (truncated address + payout amount + Etherscan link) · "View all →" |
| **Yield Engine Explainer** | Differentiator | "Your idle USDT earns yield on Aave. Yield funds Bonus Draws on top of regular draws." · Mini diagram |
| **FAQ Preview** | Objection handling | 4 most common questions accordion-style · "More →" link |
| **Final CTA** | Conversion | Big deposit button · "Start with as little as 1 USDT" |
| **Footer** | Trust + legal | Links: Whitepaper · Audit · Contract on Etherscan · Terms · Risk Disclosure · Social |

### 2.2 Hero Section Detail

The hero is the most important section. It must communicate three things in <3 seconds: what this is, that it's live, and that real money is at stake.

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   Deposit USDT. Win $1,000,000.                                  │
│   Never lose your principal.                                     │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐    │
│   │  LIVE POOL  $847,231 / $1,000,000   ████████░░  84.7%   │    │
│   │  Active users: 12,847 · Yield earned: $23,402           │    │
│   └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│   [ Deposit & Enter ]   [ How It Works ]                         │
│                                                                  │
│   Powered by Chainlink VRF · Aave V3 · OpenZeppelin              │
└──────────────────────────────────────────────────────────────────┘
```

**Animation rules:**
- Pool counter animates with `requestAnimationFrame`, easing toward the latest on-chain value.
- Yield counter ticks up by ~$0.005/sec (estimated based on current aUSDT APY × principal).
- All numbers come from the contract view functions; never hardcoded.

### 2.3 Conversion Optimization Checklist

- [ ] Hero CTA above the fold on mobile (320px viewport)
- [ ] Pool counter visible without scrolling
- [ ] "Connect Wallet" button persistent in sticky header
- [ ] Trust logos load lazily below the fold
- [ ] No carousel sliders (they kill conversion)
- [ ] CTA copy is action-oriented: "Deposit & Enter" (not "Learn More")
- [ ] Page weight <300KB initial JS for fast LCP

---

## 3. Dashboard (`/dashboard`) — User Control Center

### 3.1 Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  Header: Logo · Nav · Wallet (0x1234...5678 · 1,250 USDT)        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐  ┌──────────────────────────────────────┐  │
│  │  My Position    │  │  Live Pool Progress                  │  │
│  │  Balance: 28 USDT│  │  $847,231 / $1,000,000              │  │
│  │  Status: ACTIVE │  │  ████████████████░░░░  84.7%         │  │
│  │  Daily: 1 USDT  │  │  Est. draw: in ~4 days (15k users)   │  │
│  │  Lock: 0 USDT   │  │                                      │  │
│  │                 │  │  Bonus Pool (Yield): $23,402         │  │
│  │  [Deposit]      │  │  ████████░░░░░░░░░░░░  2.3%          │  │
│  │  [Withdraw]     │  │  Next bonus draw: ~3 years           │  │
│  └─────────────────┘  └──────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Recent Activity                          [View all →]     │  │
│  │  • Deposit +30 USDT    2h ago    0xabc...123              │  │
│  │  • Daily deduction -1 USDT  6h ago  (auto)                │  │
│  │  • Deposit +50 USDT    1d ago    0xdef...456              │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Your Odds of Winning                                     │  │
│  │  You are 1 of 12,847 active users                         │  │
│  │  Current odds: 1 in 12,847 (0.0078%)                     │  │
│  │  Deposits increase your lock-in duration, not your odds.  │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 My Position Card

This is the user's home base. It must answer four questions instantly:
1. **How much money do I have here?** → Balance
2. **Am I eligible to win?** → Status badge (ACTIVE / INACTIVE / WINNER)
3. **When does my money run out?** → "Days remaining at current rate"
4. **What can I do?** → Deposit / Withdraw buttons

**Status badge logic:**
- `isActive && !hasWon` → green "ACTIVE" with pulse animation
- `!isActive && balance == 0 && !hasWon` → red "INACTIVE — Deposit to re-enter"
- `hasWon` → gold "WINNER — Excluded from future draws" with confetti on first view
- `paused` → orange "CONTRACT PAUSED" overlay (no actions allowed)

### 3.3 Live Pool Progress Component

```tsx
<LivePoolProgress
  currentPool={847_231n * 10n**6n}
  poolTarget={1_000_000n * 10n**6n}
  activeUsers={12_847}
  bonusPoolYield={23_402n * 10n**6n}
  bonusTarget={1_000_000n * 10n**6n}
/>
```

**Behavior:**
- Progress bar fills with animated gradient (blue → green as it approaches 100%)
- "Est. draw: in ~4 days" — calculated from average daily pool growth (last 7-day moving average of `PoolUpdated` events)
- Bonus pool progress is a secondary, smaller bar in a different color (purple) to visually distinguish it from the regular pool
- When pool ≥ 99%, the bar pulses red and shows "DRAW IMMINENT — VRF request pending"

---

## 4. Deposit Modal — The Most Important Component

This is where money changes hands. Every pixel must reduce friction and build confidence.

### 4.1 Modal Anatomy

```
┌──────────────────────────────────────────────────────────────────┐
│  Deposit USDT                                          [ × ]     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Amount                                                          │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  30.00  USDT                                      [Max]    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Quick select:                                                   │
│  [ 1 ]  [ ⭐ 30 ]  [ 100 ]  [ 500 ]  [ 1,000 ]                  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  ⭐ RECOMMENDED                                            │  │
│  │  Deposit 30 USDT for ~1 month of active status.            │  │
│  │  Gas efficiency: 96% (vs 1 USDT deposit)                   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─ Cost Breakdown ────────────────────────────────────────┐    │
│  │  Deposit amount:        30.00 USDT                       │    │
│  │  Est. gas cost:         ~$3.20  (0.0012 ETH @ 15 gwei)   │    │
│  │  Gas-to-deposit ratio:  10.7%  (excellent)               │    │
│  │                                                          │    │
│  │  Days of active status:   30 days                        │    │
│  │  Cost per active day:     $0.11                          │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Your balance after deposit:  58.00 USDT                        │
│  Active until:  Oct 15, 2026 (30 days from today)               │
│                                                                  │
│  Pre-transaction checklist:                                      │
│  ✓ Wallet connected (0x1234...5678)                              │
│  ✓ USDT balance: 1,250.00 (sufficient)                           │
│  ✓ USDT allowance: 0 (will prompt approval first)               │
│                                                                  │
│  [ Approve USDT ]  →  [ Confirm Deposit ]                       │
│                                                                  │
│  By depositing, you agree to the Terms & Risk Disclosure.       │
└──────────────────────────────────────────────────────────────────┘
```

### 4.2 Two-Step Transaction Flow

USDT deposits require **two transactions**: (1) approve, (2) deposit. The modal handles this as a guided wizard:

```
Step 1: Approval
  - User clicks "Approve USDT"
  - Wallet pops up with approve() transaction
  - Modal shows: "Approving USDT... (Step 1 of 2)"
  - On success: button changes to "Confirm Deposit"

Step 2: Deposit
  - User clicks "Confirm Deposit"
  - Wallet pops up with deposit() transaction
  - Modal shows: "Depositing... (Step 2 of 2)"
  - On success: confetti animation + "Deposit successful!" + "View on Etherscan →"
  - UI optimistically updates balance before block confirmation
```

**Edge cases:**
- If user already has sufficient allowance → skip Step 1, go straight to Step 2
- If approval succeeds but deposit fails → show "Retry deposit" with explanation
- If user closes modal mid-flow → state persists, can resume on reopen

### 4.3 Smart Amount Defaults

The amount field auto-populates based on user history:
- New user → defaults to 30 USDT (recommended)
- Returning user with balance → defaults to their average previous deposit
- User whose balance is depleting → defaults to "top up to 30 days" amount

---

## 5. Transparency Dashboard (`/transparency`) — Trust Engine

This is the page that wins over skeptics. It's a public, no-login-required view of every on-chain metric that proves solvency and fairness.

### 5.1 Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  TRANSPARENCY DASHBOARD                                           │
│  Last updated: 2 seconds ago · Auto-refreshes every 15s          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─ SOLVENCY CHECK ───────────────────────────────────────────┐  │
│  │  ✓ SOLVENT                                                 │  │
│  │  Total assets:    $2,847,231                               │  │
│  │  Total principal: $2,823,829                               │  │
│  │  Solvency gap:    $23,402  (= yield, healthy)              │  │
│  │  [View on Etherscan →]                                     │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─ POOL STATUS ────────────┐  ┌─ YIELD STATUS ───────────────┐  │
│  │ Regular Pool             │  │ Aave Position                │  │
│  │ $847,231 / $1M   84.7%   │  │ aUSDT balance: $2,000,128    │  │
│  │ Est. draw: ~4 days       │  │ Principal supplied: $1,976,726│  │
│  │ Active users: 12,847     │  │ Yield: $23,402               │  │
│  │ [View pool history →]    │  │ Current APY: 4.32%           │  │
│  └──────────────────────────┘  │ [View on Aave →]             │  │
│                                └──────────────────────────────┘  │
│                                                                  │
│  ┌─ DRAW COUNTDOWN ───────────────────────────────────────────┐  │
│  │  Regular Draw:    Pool at 84.7% — ~4 days to trigger       │  │
│  │  Bonus Draw:      Yield at 2.3% — ~3 years to trigger      │  │
│  │  Current VRF request: #12345 — FULFILLED (winner paid)     │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─ RECENT DRAWS ─────────────────────────────────────────────┐  │
│  │  Draw #5  Regular  2026-06-28  Winner: 0xabc...123         │  │
│  │  Payout: $995,350 · Lock: $3,650 · Fee: $1,000             │  │
│  │  VRF Request: 0x12345...  [Verify on Chainlink →]          │  │
│  │  Tx: 0xdef...456  [View on Etherscan →]                    │  │
│  │  ─────────────────────────────────────────────────────     │  │
│  │  Draw #4  Bonus    2026-06-15  Winner: 0x789...012         │  │
│  │  Payout: $995,350 · Lock: $3,650 · Fee: $1,000             │  │
│  │  VRF Request: 0x12340...  [Verify on Chainlink →]          │  │
│  │  Tx: 0xabc...789  [View on Etherscan →]                    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─ WINNER LOCK TRACKING ─────────────────────────────────────┐  │
│  │  Total locked: $18,250  (5 winners × $3,650)               │  │
│  │  Lock #1: 0xabc...123 — 365 days dripped · 3,285 remaining │  │
│  │  Lock #2: 0xdef...456 — 180 days dripped · 3,470 remaining │  │
│  │  ...                                                       │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─ CONTRACT STATE ───────────────────────────────────────────┐  │
│  │  Address: 0xHybrid...V2  [Etherscan →] [Source →]          │  │
│  │  Owner:   0xOwner...123  [Etherscan →]                     │  │
│  │  Paused:  No                                              │  │
│  │  Draw in progress: No                                     │  │
│  │  Liquidity buffer: 5%                                     │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### 5.2 Solvency Check Component

This is the crown jewel of the transparency page. It calls `accountingSummary()` once and verifies:

```
totalAssets = usdtBalance + aUsdtBalance
principal   = totalUserBalances + currentPool + totalLockedAmounts + accumulatedFees
yield       = aUsdtBalance - totalPrincipalSupplied
solvencyGap = totalAssets - principal

Health check:
  ✓ SOLVENT  if solvencyGap >= 0
  ✗ INSOLVENT if solvencyGap < 0  (impossible by design, but display if it happens)

Healthy yield ratio:
  yield / principal >= 0  (always true)
  yield / principal < 0.5 (sanity check — if yield > 50% of principal, something is wrong)
```

If anything looks off, the page shows a red warning banner at the top: **"SOLVENCY CHECK FAILED — please contact the team immediately."** This is the user's safety signal.

### 5.3 Draw Countdown Logic

The "Next Draw Countdown" is **not a timer** — it's an **estimate** based on historical pool growth rate:

```ts
// Fetch last 7 days of PoolUpdated events
const poolEvents = await client.getLogs({
  address: contractAddress,
  event: parseAbiItem('event PoolUpdated(uint256 newPoolSize)'),
  fromBlock: 'safe',
  toBlock: -7n * 24n * 60n * 4n,  // ~7 days of blocks
})

// Compute daily growth rate
const dailyGrowthRate = computeDailyGrowthRate(poolEvents)

// Estimate time to reach POOL_TARGET
const remaining = POOL_TARGET - currentPool
const estimatedDays = remaining / dailyGrowthRate

// Display as "≈ 4 days" (never as an exact countdown — it would mislead)
```

**Why estimated, not exact?** Because the pool grows from user deductions, which are unpredictable. Showing an exact timer would imply false precision and erode trust when the estimate shifts.

### 5.4 VRF Verification Links

Every draw in the "Recent Draws" table links to:
1. **Chainlink VRF** — the request ID and random word, verifiable on `vrf.chain.link`
2. **Etherscan** — the `fulfillRandomWords` transaction
3. **Source code** — link to the verified contract on Etherscan

This lets any user independently verify the winner was selected fairly.

---

## 6. Smart Contract Interactions — Complete API Surface

This section enumerates every function the frontend will call. Organized by category for quick lookup.

### 6.1 Read Functions (no gas, cached via TanStack Query)

| Function | Used For | Polling Interval | UI Location |
|---|---|---|---|
| `users(address)` | User balance, status, lock | 10s | Dashboard |
| `getUserInfo(address)` | All user fields in one call | 10s | Dashboard |
| `getActiveUserCount()` | Live active users counter | 15s | Landing, Dashboard, Transparency |
| `getActiveUsers()` | List of all active addresses (paginated) | 60s | Transparency (optional) |
| `currentPool` | Pool progress | 5s | All pages |
| `totalLockedAmounts` | Winner lock tracking | 30s | Transparency |
| `accumulatedFees` | Pending owner fees | 30s | Admin |
| `totalUserBalances` | Principal component | 15s | Transparency |
| `totalPrincipalSupplied` | Aave principal | 15s | Transparency |
| `getYieldBalance()` | Live yield counter | 10s | All pages |
| `getTotalPrincipal()` | Solvency check | 15s | Transparency |
| `getExcessLiquidity()` | Aave supply opportunity | 30s | Admin |
| `contractUsdtBalance()` | Raw USDT on hand | 15s | Transparency |
| `contractAusdtBalance()` | aUSDT balance | 15s | Transparency |
| `accountingSummary()` | One-call solvency check | 15s | Transparency |
| `drawInProgress` | Lock state indicator | 5s | Dashboard (warning banner) |
| `regularDrawCount` | Total draws stat | 60s | Transparency |
| `bonusDrawCount` | Total bonus draws stat | 60s | Transparency |
| `lastRequestId` | Latest VRF request | 10s | Transparency |
| `lastBonusRequestId` | Latest bonus VRF request | 10s | Transparency |
| `vrfRequests(uint256)` | Draw details by request ID | on-demand | Transparency |
| `paused` | Emergency state | 5s | All pages (overlay) |
| `liquidityBufferPercent` | Config display | 60s | Admin |
| `MIN_DEPOSIT` | Input validation | on load | Deposit modal |
| `POOL_TARGET` | Progress bar max | on load | All pages |
| `BONUS_DRAW_TARGET` | Bonus progress max | on load | Transparency |
| `DAILY_DEDUCTION` | Cost projection | on load | Deposit modal |
| `WINNER_PAYOUT` | Distribution display | on load | Transparency, FAQ |
| `WINNER_LOCK_AMOUNT` | Distribution display | on load | Transparency, FAQ |
| `OPERATIONAL_FEE` | Distribution display | on load | Transparency, FAQ |

### 6.2 Write Functions (require gas, wallet signature)

| Function | Trigger | Pre-conditions | UI Flow |
|---|---|---|---|
| `deposit(uint256 amount)` | "Confirm Deposit" button | USDT allowance ≥ amount; amount ≥ 1 USDT; !hasWon; !paused; !drawInProgress | 2-step wizard: approve → deposit |
| `withdraw(uint256 amount)` | "Withdraw" button | amount > 0; amount ≤ balance; !paused; !drawInProgress | 1-step (no approval needed) |
| `syncUserState(address)` | "Sync my state" button (manual) | !paused; !drawInProgress | Optional button for power users |
| `processWinnerLock(address)` | Admin/Keeper button | Winner exists with lock | Admin panel only |
| `withdrawLockedAmount()` | Winner "Claim Lock" button | Caller is winner; lock matured (10yr) | Dashboard (winner view) |
| `triggerDrawManually()` | Admin "Force Draw" button | currentPool ≥ POOL_TARGET; !drawInProgress | Admin panel only |
| `triggerBonusDrawManually()` | Admin "Force Bonus Draw" button | yield ≥ BONUS_DRAW_TARGET; !drawInProgress | Admin panel only |
| `supplyToAave(uint256)` | Admin "Supply to Aave" button | Excess liquidity > 0; !drawInProgress | Admin panel only |
| `withdrawFromAave(uint256)` | Admin "Withdraw from Aave" button | aUSDT balance > 0; !drawInProgress | Admin panel only |
| `claimFees()` | Admin "Claim Fees" button | accumulatedFees > 0 | Admin panel only |
| `setLiquidityBufferPercent(uint16)` | Admin "Update Buffer" form | newPercent ≤ 50 | Admin panel only |
| `pause()` | Admin "Pause Contract" button | Owner only; !paused | Admin panel (danger zone) |
| `unpause()` | Admin "Unpause Contract" button | Owner only; paused | Admin panel |

### 6.3 External Calls (USDT token)

| Function | Purpose | UI Flow |
|---|---|---|
| `usdt.balanceOf(address)` | Check user's wallet balance (sufficient funds?) | Deposit modal checklist |
| `usdt.allowance(owner, spender)` | Check existing allowance (skip Step 1 if sufficient) | Deposit modal pre-check |
| `usdt.approve(spender, amount)` | Approve contract to spend USDT | Deposit modal Step 1 |

### 6.4 Event Subscriptions (real-time updates)

Use `watchEvent` from wagmi/viem to subscribe to contract events. This powers the real-time UI updates without polling.

| Event | Triggers UI Update |
|---|---|
| `Deposited(address, uint256, uint256, uint256)` | Refresh user balance, pool size |
| `Withdrawn(address, uint256, uint256)` | Refresh user balance, pool size |
| `UserActivated(address)` | Refresh user status badge |
| `UserDeactivated(address, string)` | Refresh user status badge |
| `Deducted(address, uint256, uint256)` | Refresh user balance, pool size |
| `PoolUpdated(uint256)` | Animate pool progress bar |
| `DrawTriggered(uint256, uint256, uint256)` | Show "Draw in progress" banner |
| `DrawCompleted(uint256, address, uint256, uint256)` | Confetti, winner announcement |
| `BonusDrawTriggered(uint256, uint256, uint256)` | Show "Bonus draw in progress" banner |
| `BonusDrawCompleted(uint256, address, uint256, uint256)` | Confetti, winner announcement |
| `SuppliedToAave(uint256, uint256)` | Refresh Aave position |
| `WithdrawnFromAave(uint256, uint256)` | Refresh Aave position |
| `YieldAccrued(uint256)` | Animate yield counter |
| `FeesClaimed(address, uint256)` | Refresh fee accumulator |
| `EmergencyPaused(address)` | Show pause overlay |
| `EmergencyUnpaused(address)` | Hide pause overlay |
| `AutoAaveWithdrawal(uint256, string)` | Toast notification (rare event) |

### 6.5 Suggested Hook Architecture (wagmi v2 + viem)

```ts
// hooks/useContractRead.ts — generic typed read hook
export function useContractRead<TFnName extends keyof typeof abi>(
  fnName: TFnName,
  args: any[],
  options?: { pollingInterval?: number; enabled?: boolean }
)

// hooks/useUserPosition.ts — domain-specific read
export function useUserPosition(address: Address | undefined) {
  return useContractRead('getUserInfo', [address], {
    pollingInterval: 10_000,
    enabled: !!address,
  })
}

// hooks/usePoolStats.ts — composite read
export function usePoolStats() {
  const pool = useContractRead('currentPool', [])
  const yield_ = useContractRead('getYieldBalance', [])
  const activeUsers = useContractRead('getActiveUserCount', [])
  // ...combine and return
}

// hooks/useDeposit.ts — write flow with approval handling
export function useDeposit() {
  // Returns: { approve, deposit, needsApproval, isPending, isSuccess, error }
}

// hooks/useContractEvents.ts — event subscriptions
export function usePoolUpdates() {
  // Watches PoolUpdated event, triggers TanStack Query invalidation
}
```

---

## 7. Gas Optimization UX — Nudge, Don't Force

### 7.1 The Math (Why This Matters)

| Deposit Amount | Est. Gas Cost | Gas-to-Deposit Ratio | Verdict |
|---|---|---|---|
| 1 USDT | ~$3.20 | 320% | Terrible — user loses 3.2× their deposit to gas |
| 5 USDT | ~$3.20 | 64% | Poor |
| 10 USDT | ~$3.20 | 32% | Fair |
| **30 USDT** | **~$3.20** | **10.7%** | **Excellent — recommended** |
| 100 USDT | ~$3.20 | 3.2% | Great |
| 500 USDT | ~$3.20 | 0.64% | Optimal |

The insight: **gas cost is roughly fixed per transaction (~$3-5), regardless of deposit size.** Depositing 1 USDT means losing 3× the deposit to gas. Depositing 30 USDT means gas is only 10% of the deposit.

### 7.2 UX Strategy — Five Layers of Nudge

We never block the 1 USDT deposit (the contract allows it). Instead, we layer five soft nudges:

#### Layer 1: Smart Default
The amount field pre-fills with **30 USDT**. Most users won't change it. This alone solves 80% of the problem.

#### Layer 2: Quick-Select Chips
```
[ 1 ]  [ ⭐ 30 ]  [ 100 ]  [ 500 ]  [ 1,000 ]
```
The 30 chip has a star icon and is visually emphasized. Users instinctively pick the highlighted option.

#### Layer 3: Live Gas Efficiency Badge
A color-coded badge next to the amount field updates in real time as the user types:

```
Amount: [ 1 ] USDT     [🔴 POOR — Gas is 320% of deposit]
Amount: [ 10 ] USDT    [🟡 FAIR — Gas is 32% of deposit]
Amount: [ 30 ] USDT    [🟢 EXCELLENT — Gas is 10.7% of deposit]
Amount: [ 100 ] USDT   [🟢 OPTIMAL — Gas is 3.2% of deposit]
```

**Implementation:**
```ts
const gasEfficiency = (estimatedGasCostUsd / depositAmountUsd) * 100

const badge = gasEfficiency > 100 ? { color: 'red', label: 'POOR' }
  : gasEfficiency > 30 ? { color: 'yellow', label: 'FAIR' }
  : gasEfficiency > 10 ? { color: 'green', label: 'EXCELLENT' }
  : { color: 'green', label: 'OPTIMAL' }
```

#### Layer 4: "Why 30 USDT?" Tooltip / Expandable

Below the amount field, an expandable section explains the math:

> **Why we recommend 30 USDT**
>
> Every deposit costs ~$3 in gas (a fixed network fee). The amount you deposit doesn't change the gas cost.
>
> - Deposit 1 USDT → you pay $3 gas → effectively $4 for $1 of entry (320% overhead)
> - Deposit 30 USDT → you pay $3 gas → effectively $33 for $30 of entry (10% overhead)
> - Deposit 100 USDT → you pay $3 gas → effectively $103 for $100 of entry (3% overhead)
>
> 30 USDT gives you ~30 days of active status at the lowest practical gas overhead. Larger deposits are even more efficient but lock more capital.

#### Layer 5: Post-Deposit "Boost" Suggestion

If a user deposits less than 30 USDT, after the success screen, show a non-blocking toast:

> 💡 **Tip:** Next time, deposit 30+ USDT to reduce your gas overhead from 320% to 10%. [Got it]

This is informational, not pushy. Users who deposited 1 USDT intentionally (e.g., testing the contract) won't be bothered again.

### 7.3 Gas Estimation Implementation

```ts
async function estimateDepositGasCost(amount: bigint): Promise<{
  gasEstimate: bigint
  gasPrice: bigint
  totalCostEth: bigint
  totalCostUsd: number
}> {
  // 1. Estimate gas units
  const gasEstimate = await client.estimateContractGas({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'deposit',
    args: [amount],
    account: userAddress,
  })

  // 2. Get current gas price
  const gasPrice = await client.getGasPrice()

  // 3. Total cost in ETH
  const totalCostEth = gasEstimate * gasPrice

  // 4. Convert to USD (fetch ETH price from CoinGecko or Chainlink feed)
  const ethPriceUsd = await getEthPriceUsd()
  const totalCostUsd = Number(formatEther(totalCostEth)) * ethPriceUsd

  return { gasEstimate, gasPrice, totalCostEth, totalCostUsd }
}
```

**Caching:** The ETH price is fetched once per minute and cached in TanStack Query. Gas price is fetched on every modal open and refreshed every 30s while the modal is open.

### 7.4 When NOT to Nudge

- **Returning users with existing balance** — they know what they're doing; don't lecture them
- **Withdrawals** — gas is unavoidable; just show the cost, don't badge it
- **Owner/admin actions** — admin knows what they're doing

---

## 8. Component Architecture

### 8.1 Directory Structure

```
src/
├── app/
│   ├── layout.tsx                 # Root layout: providers
│   ├── page.tsx                   # Landing
│   ├── dashboard/
│   │   ├── page.tsx               # Dashboard home
│   │   ├── position/page.tsx
│   │   └── activity/page.tsx
│   ├── transparency/page.tsx
│   ├── how-it-works/page.tsx
│   ├── winners/page.tsx
│   ├── faq/page.tsx
│   └── admin/page.tsx
├── components/
│   ├── ui/                        # shadcn/ui primitives (Button, Card, Modal, etc.)
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── WalletButton.tsx
│   ├── landing/
│   │   ├── Hero.tsx
│   │   ├── LivePoolCounter.tsx
│   │   ├── TrustBar.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── WinnerShowcase.tsx
│   │   └── YieldEngineExplainer.tsx
│   ├── dashboard/
│   │   ├── MyPositionCard.tsx
│   │   ├── LivePoolProgress.tsx
│   │   ├── BonusPoolProgress.tsx
│   │   ├── ActivityFeed.tsx
│   │   ├── OddsOfWinning.tsx
│   │   └── StatusBadge.tsx
│   ├── deposit/
│   │   ├── DepositModal.tsx
│   │   ├── AmountInput.tsx
│   │   ├── QuickSelectChips.tsx
│   │   ├── GasEfficiencyBadge.tsx
│   │   ├── CostBreakdown.tsx
│   │   └── ApprovalWizard.tsx
│   ├── withdraw/
│   │   └── WithdrawModal.tsx
│   ├── transparency/
│   │   ├── SolvencyCheck.tsx
│   │   ├── PoolStatusCard.tsx
│   │   ├── YieldStatusCard.tsx
│   │   ├── DrawCountdown.tsx
│   │   ├── RecentDrawsTable.tsx
│   │   ├── WinnerLockTracking.tsx
│   │   └── ContractStateCard.tsx
│   └── admin/
│       ├── AdminPanel.tsx
│       ├── AaveOperations.tsx
│       ├── FeeManagement.tsx
│       └── DangerZone.tsx
├── hooks/
│   ├── useContractRead.ts
│   ├── useContractWrite.ts
│   ├── useUserPosition.ts
│   ├── usePoolStats.ts
│   ├── useYieldStats.ts
│   ├── useDeposit.ts
│   ├── useWithdraw.ts
│   ├── useContractEvents.ts
│   └── useGasEstimation.ts
├── lib/
│   ├── contract.ts                # ABI, address, chain config
│   ├── wagmi.ts                   # Wagmi config + chains
│   ├── query-client.ts            # TanStack Query config
│   ├── format.ts                  # BigInt → USD formatting
│   └── constants.ts
├── providers/
│   ├── WagmiProvider.tsx
│   ├── QueryProvider.tsx
│   └── ThemeProvider.tsx
└── types/
    └── contract.ts                # TypeScript types generated from ABI
```

### 8.2 Provider Stack

```tsx
// app/layout.tsx
<WagmiProvider config={wagmiConfig}>
  <QueryClientProvider client={queryClient}>
    <RainbowKitProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </RainbowKitProvider>
  </QueryClientProvider>
</WagmiProvider>
```

### 8.3 State Management Strategy

- **Server/on-chain state** → TanStack Query (caching, refetching, invalidation)
- **Local UI state** → React `useState` / `useReducer` (modal open, form input)
- **Global UI state** → Zustand (wallet connection status, theme, toasts)
- **URL state** → Next.js `searchParams` (pagination, filters)

**No Redux.** The app doesn't need it. TanStack Query handles 95% of state; Zustand handles the rest.

---

## 9. Error Handling & Edge Cases

Every error path must have a user-friendly message and a clear recovery action.

| Scenario | Detection | UX Response |
|---|---|---|
| Wallet not connected | `useAccount()` returns `undefined` | Replace action buttons with "Connect Wallet" |
| Wrong network (not Ethereum mainnet) | `chainId !== 1` | Show modal: "Switch to Ethereum Mainnet" with auto-switch button |
| Insufficient USDT balance | `usdt.balanceOf(user) < amount` | Disable deposit button, show "Insufficient USDT" hint |
| Insufficient ETH for gas | `eth.getBalance(user) < gasCost` | Show warning before sign: "You need ~$X ETH for gas" |
| USDT allowance too low | `usdt.allowance(user, contract) < amount` | Trigger approval step (handled by wizard) |
| Contract paused | `paused == true` | Show full-page overlay: "Contract is paused. Withdrawals still allowed." (Note: paused also blocks withdrawals in V2 — clarify in copy) |
| Draw in progress | `drawInProgress == true` | Disable deposit/withdraw buttons, show "Draw in progress — try again in ~1 min" |
| User already won (can't re-enter) | `users[user].hasWon == true` | Disable deposit button, show "You've already won! You can't enter again." |
| Transaction reverted | `waitForTransactionReceipt` throws | Show toast: "Transaction failed — [reason]. Try again." |
| RPC timeout | Fetch fails | Auto-retry 3x, then show "Network issue — refresh page" |
| User rejects transaction in wallet | `UserRejectedRequestError` | Show toast: "Transaction cancelled" (no error styling) |

---

## 10. Performance Budget

| Metric | Target | Strategy |
|---|---|---|
| LCP (Landing) | <2.0s | Static generation, image optimization, font preloading |
| FID / INP | <100ms | Code splitting, deferred heavy components |
| Initial JS bundle | <300KB | Lazy-load dashboard/admin chunks |
| Time to interactive | <3.0s | Defer non-critical scripts |
| RPC calls per page load | <5 | TanStack Query caching, composite reads (`accountingSummary`) |

**Critical optimization:** Use `accountingSummary()` instead of 6 individual reads. One call replaces six.

---

## 11. Security Considerations

1. **No private keys in frontend** — obvious but worth stating. The frontend never handles private keys; wallet extensions do.
2. **Read-only fallback RPC** — if user's wallet RPC fails, fall back to a public RPC (Alchemy/Infura free tier) for reads. Writes still require the user's wallet.
3. **Contract address configuration** — loaded from environment variables, not hardcoded. Allows testnet/mainnet switching.
4. **ABI verification** — at build time, compare the frontend ABI against the deployed contract's verified ABI on Etherscan. Fail the build if they mismatch.
5. **Transaction simulation** — before prompting the user to sign, simulate the transaction via `eth_simulateV1` (or Tenderly) and show the expected outcome. This prevents phishing-style contract changes.
6. **Content Security Policy** — strict CSP, no inline scripts, no `unsafe-eval`.
7. **Wallet drainer protection** — integrate Wallet Guard or Blowfish to scan for malicious contract interactions before signing.

---

## 12. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Next.js + Tailwind + wagmi + RainbowKit setup
- [ ] Contract ABI integration, typed hooks
- [ ] Header, footer, routing skeleton
- [ ] Landing page (static sections only, no live data)

### Phase 2: Core User Flow (Week 3-4)
- [ ] Dashboard with live pool counter
- [ ] My Position card (read-only)
- [ ] Deposit modal with 2-step approval wizard
- [ ] Withdraw modal
- [ ] Wallet connection flow

### Phase 3: Transparency (Week 5)
- [ ] Transparency dashboard
- [ ] Solvency check component
- [ ] Recent draws table
- [ ] VRF verification links
- [ ] Winner showcase

### Phase 4: Polish & Gas UX (Week 6)
- [ ] Gas efficiency badge
- [ ] Cost breakdown component
- [ ] Quick-select chips
- [ ] Real-time event subscriptions
- [ ] Animations (Framer Motion)
- [ ] Mobile responsiveness audit

### Phase 5: Admin & Hardening (Week 7)
- [ ] Admin panel (owner-only)
- [ ] Aave operations UI
- [ ] Error handling audit
- [ ] Performance audit (Lighthouse >90)
- [ ] Security review

### Phase 6: Launch Prep (Week 8)
- [ ] Mainnet deployment of contract
- [ ] Frontend deployment (Vercel)
- [ ] Etherscan contract verification
- [ ] Analytics (PostHog / Plausible)
- [ ] Documentation handoff

---

## Appendix A: Key Constants for Frontend

```ts
export const CONTRACT_CONSTANTS = {
  MIN_DEPOSIT:       1_000_000n,        // 1 USDT (6 decimals)
  RECOMMENDED_DEPOSIT: 30_000_000n,     // 30 USDT (UX recommendation, not enforced)
  DAILY_DEDUCTION:   1_000_000n,        // 1 USDT/day
  POOL_TARGET:       1_000_000_000_000n, // 1,000,000 USDT
  BONUS_DRAW_TARGET: 1_000_000_000_000n, // 1,000,000 USDT
  OPERATIONAL_FEE:   1_000_000_000n,    // 1,000 USDT
  WINNER_LOCK_AMOUNT: 3_650_000_000n,   // 3,650 USDT
  WINNER_PAYOUT:     995_350_000_000n,  // 995,350 USDT
  LOCK_DURATION:     10n * 365n * 24n * 60n * 60n, // 10 years in seconds
  USDT_DECIMALS:     6,
} as const
```

## Appendix B: Distribution Verification

The frontend should always display this verification so users can confirm the math:

```
Pool Target:        1,000,000 USDT
  ├─ Winner payout:    995,350 USDT (99.535%)
  ├─ Winner lock:        3,650 USDT (0.365%)  — 10-year advance
  └─ Operational fee:    1,000 USDT (0.100%)
  Total:             1,000,000 USDT ✓
```

This appears on the FAQ page, the transparency page, and the deposit modal (collapsed by default).

---

**End of Document.** Ready to start building React components — recommend beginning with Phase 1 (foundation) and the `useContractRead` / `useUserPosition` hooks, which unblock everything else.
