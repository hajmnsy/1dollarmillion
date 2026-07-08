"use client";

import { useAccount, useReadContract } from "wagmi";
import {
  LOTTERY_CONTRACT_ADDRESS,
  USDT_CONTRACT_ADDRESS,
  lotteryAbi,
  usdtAbi,
  TOKEN_DECIMALS_BI,
  DAILY_DEDUCTION,
  POOL_TARGET,
  BONUS_DRAW_TARGET,
  TARGET_CHAIN_ID,
  type UserInfo,
  type AccountingSummary,
} from "@/lib/contract/config";

// === Polling intervals (ms) =========================================
// Higher-frequency for time-sensitive data; lower for slow-changing data.
const FAST = 5_000;   // pool, drawInProgress — animates constantly
const NORMAL = 10_000; // user position, yield
const SLOW = 30_000;  // counts, totals — change rarely

// === Helpers ========================================================

/**
 * Convert raw token units (6 decimals) to a display number.
 * 1_500_000 → 1.5
 */
export function toDisplay(bigint: bigint, decimals = 2): number {
  return Number(bigint) / Number(TOKEN_DECIMALS_BI);
}

/**
 * Format raw USDT units to a USD string with thousand separators.
 * 1_500_000 → "$1.50"
 * 1_500_000_000_000 → "$1,000,000.00"
 */
export function formatUsd(bigint: bigint, decimals = 2): string {
  const num = toDisplay(bigint);
  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Compact USD formatter for large numbers.
 * 1_000_000_000_000 → "$1.0M"
 * 23_402_000_000 → "$23.4K"
 */
export function formatUsdCompact(bigint: bigint): string {
  const num = toDisplay(bigint);
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
}

/**
 * Compute remaining active days for a user given their balance.
 * Uses the lazy-deduction model: 1 USDT/day, deduction applied on next interaction.
 */
export function computeDaysRemaining(
  balance: bigint,
  lastDeductionTime: bigint,
  now: number = Math.floor(Date.now() / 1000)
): number {
  if (balance <= 0n) return 0;

  // Compute pending deduction not yet applied
  const elapsedSeconds = BigInt(Math.max(0, now - Number(lastDeductionTime)));
  const elapsedDays = elapsedSeconds / 86400n;
  const pendingDeduction = elapsedDays * DAILY_DEDUCTION;

  const effectiveBalance =
    balance > pendingDeduction ? balance - pendingDeduction : 0n;
  if (effectiveBalance <= 0n) return 0;

  return Number(effectiveBalance / DAILY_DEDUCTION);
}

/**
 * Compute progress percentage (0-100) of `current` toward `target`.
 */
export function computeProgress(current: bigint, target: bigint): number {
  if (target === 0n) return 0;
  if (current >= target) return 100;
  return Number((current * 100n) / target);
}

// === Pool & Yield Hooks ============================================

/**
 * Fetch the live pool size (grows from daily deductions).
 * Polls every 5s — this number animates constantly.
 */
export function useCurrentPool() {
  return useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: lotteryAbi,
    functionName: "currentPool",
    chainId: TARGET_CHAIN_ID,
    query: {
      refetchInterval: FAST,
      select: (data) => data as bigint,
    },
  });
}

/**
 * Fetch the live yield balance (Aave interest earned).
 */
export function useYieldBalance() {
  return useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: lotteryAbi,
    functionName: "getYieldBalance",
    chainId: TARGET_CHAIN_ID,
    query: {
      refetchInterval: NORMAL,
      select: (data) => data as bigint,
    },
  });
}

/**
 * Fetch number of active (eligible) users in the pool.
 */
export function useActiveUserCount() {
  return useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: lotteryAbi,
    functionName: "getActiveUserCount",
    chainId: TARGET_CHAIN_ID,
    query: {
      refetchInterval: SLOW,
      select: (data) => data as bigint,
    },
  });
}

/**
 * Fetch the contract's accounting summary — one call instead of six.
 * Returns principal, yield, raw USDT balance, aUSDT balance, total assets,
 * and solvency gap. Used by the transparency dashboard.
 */
export function useAccountingSummary() {
  return useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: lotteryAbi,
    functionName: "accountingSummary",
    chainId: TARGET_CHAIN_ID,
    query: {
      refetchInterval: SLOW,
      select: (data) => {
        const d = data as readonly [
          bigint, bigint, bigint, bigint, bigint, bigint
        ];
        return {
          principal: d[0],
          yield_: d[1],
          usdtBalance: d[2],
          aUsdtBalance: d[3],
          totalAssets: d[4],
          solvencyGap: d[5],
        } as AccountingSummary;
      },
    },
  });
}

// === User-Specific Hooks ===========================================

/**
 * Fetch the connected user's full position from the contract.
 * Returns balance, lockedAmount, lastDeductionTime, isActive, hasWon,
 * lockedStartTime.
 */
export function useUserInfo() {
  const { address } = useAccount();

  return useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: lotteryAbi,
    functionName: "getUserInfo",
    args: [address!],
    chainId: TARGET_CHAIN_ID,
    query: {
      enabled: !!address,
      refetchInterval: NORMAL,
      select: (data) => {
        const d = data as readonly [
          bigint, bigint, bigint, boolean, boolean, bigint
        ];
        return {
          balance: d[0],
          lockedAmount: d[1],
          lastDeductionTime: d[2],
          isActive: d[3],
          hasWon: d[4],
          lockedStartTime: d[5],
        } as UserInfo;
      },
    },
  });
}

/**
 * Fetch the user's USDT wallet balance (for deposit modal checks).
 */
export function useUserUsdtBalance() {
  const { address } = useAccount();

  return useReadContract({
    address: USDT_CONTRACT_ADDRESS,
    abi: usdtAbi,
    functionName: "balanceOf",
    args: [address!],
    chainId: TARGET_CHAIN_ID,
    query: {
      enabled: !!address,
      refetchInterval: NORMAL,
      select: (data) => data as bigint,
    },
  });
}

/**
 * Fetch the user's USDT allowance to the lottery contract.
 * Used by the deposit modal to determine if an approve() is needed.
 */
export function useUserUsdtAllowance() {
  const { address } = useAccount();

  return useReadContract({
    address: USDT_CONTRACT_ADDRESS,
    abi: usdtAbi,
    functionName: "allowance",
    args: [address!, LOTTERY_CONTRACT_ADDRESS],
    chainId: TARGET_CHAIN_ID,
    query: {
      enabled: !!address,
      refetchInterval: NORMAL,
      select: (data) => data as bigint,
    },
  });
}

// === Contract State Hooks ===========================================

/**
 * Is a draw currently in progress (VRF pending)?
 * Disables deposit/withdraw buttons when true.
 */
export function useDrawInProgress() {
  return useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: lotteryAbi,
    functionName: "drawInProgress",
    chainId: TARGET_CHAIN_ID,
    query: {
      refetchInterval: FAST,
      select: (data) => data as boolean,
    },
  });
}

/**
 * Is the contract paused?
 */
export function useIsPaused() {
  return useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: lotteryAbi,
    functionName: "paused",
    chainId: TARGET_CHAIN_ID,
    query: {
      refetchInterval: FAST,
      select: (data) => data as boolean,
    },
  });
}

/**
 * Fetch historical draw counts.
 */
export function useDrawCounts() {
  const regular = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: lotteryAbi,
    functionName: "regularDrawCount",
    chainId: TARGET_CHAIN_ID,
    query: {
      refetchInterval: SLOW,
      select: (data) => data as bigint,
    },
  });

  const bonus = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: lotteryAbi,
    functionName: "bonusDrawCount",
    chainId: TARGET_CHAIN_ID,
    query: {
      refetchInterval: SLOW,
      select: (data) => data as bigint,
    },
  });

  return {
    regular: regular.data ?? 0n,
    bonus: bonus.data ?? 0n,
    isLoading: regular.isLoading || bonus.isLoading,
  };
}

// === Composite Hook (Dashboard-friendly) ============================

/**
 * useDashboardData — single hook that aggregates everything the dashboard
 * needs. Returns all live values + loading/error state in one call.
 * Internally uses TanStack Query's parallel fetching.
 */
export function useDashboardData() {
  const { address, isConnected } = useAccount();
  const pool = useCurrentPool();
  const yield_ = useYieldBalance();
  const activeUsers = useActiveUserCount();
  const accounting = useAccountingSummary();
  const userInfo = useUserInfo();
  const drawInProgress = useDrawInProgress();
  const isPaused = useIsPaused();
  const drawCounts = useDrawCounts();

  // Loading is only true if we're actually fetching AND haven't errored.
  // Once a read errors (e.g. wrong chain), we treat it as "loaded with default"
  // so the dashboard doesn't stay stuck on the spinner forever.
  const hasError =
    pool.isError ||
    yield_.isError ||
    activeUsers.isError ||
    accounting.isError ||
    drawInProgress.isError;

  const isLoading =
    !hasError &&
    (pool.isLoading ||
      yield_.isLoading ||
      activeUsers.isLoading ||
      accounting.isLoading ||
      drawInProgress.isLoading);

  // Derive convenience values
  const poolProgress = pool.data
    ? computeProgress(pool.data, POOL_TARGET)
    : 0;
  const yieldProgress = yield_.data
    ? computeProgress(yield_.data, BONUS_DRAW_TARGET)
    : 0;

  // Compute days remaining for the user (based on lazy deduction)
  const daysRemaining = userInfo.data
    ? computeDaysRemaining(
        userInfo.data.balance,
        userInfo.data.lastDeductionTime
      )
    : 0;

  // User status
  const userStatus: "active" | "inactive" | "winner" | "paused" = isPaused.data
    ? "paused"
    : userInfo.data?.hasWon
      ? "winner"
      : userInfo.data?.isActive
        ? "active"
        : "inactive";

  return {
    isConnected,
    address,
    // Pool
    currentPool: pool.data ?? 0n,
    poolProgress,
    // Yield
    yieldBalance: yield_.data ?? 0n,
    yieldProgress,
    // Active users
    activeUserCount: activeUsers.data ?? 0n,
    // Accounting
    accounting: accounting.data,
    // User position
    userInfo: userInfo.data,
    daysRemaining,
    userStatus,
    // Contract state
    drawInProgress: drawInProgress.data ?? false,
    isPaused: isPaused.data ?? false,
    drawCounts,
    // Aggregate loading
    isLoading,
  };
}
