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
  TARGET_CHAIN_ID,
  type UserInfo,
  type AccountingSummary,
} from "@/lib/contract/config";

// === Polling intervals (ms) ===
const FAST = 5_000;
const NORMAL = 10_000;
const SLOW = 30_000;

// === Helpers ===

export function toDisplay(bigint: bigint | undefined | null, decimals = 2): number {
  // Defensive: a missing/undefined bigint would otherwise produce NaN displays ("$NaN")
  if (!bigint) return 0;
  const num = Number(bigint);
  if (!Number.isFinite(num)) return 0;
  return num / Number(TOKEN_DECIMALS_BI);
}

export function formatUsd(bigint: bigint, decimals = 2): string {
  const num = toDisplay(bigint);
  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatUsdCompact(bigint: bigint): string {
  const num = toDisplay(bigint);
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
}

export function computeDaysRemaining(
  balance: bigint | undefined | null,
  lastDeductionTime: bigint | undefined | null,
  now: number = Math.floor(Date.now() / 1000)
): number {
  // Defensive: guard against undefined/null balance (avoids TypeError on `<= 0n`)
  if (!balance || balance <= 0n) return 0;

  // Defensive: guard against undefined/null/0n lastDeductionTime.
  // Without this, Number(undefined) === NaN, and BigInt(Math.max(0, NaN)) === BigInt(NaN),
  // which throws: "RangeError: The number NaN cannot be converted to a BigInt"
  if (!lastDeductionTime || lastDeductionTime === 0n) return 0;

  const lastTs = Number(lastDeductionTime);
  if (!Number.isFinite(lastTs)) return 0; // NaN or Infinity safety net

  const elapsedSeconds = BigInt(Math.max(0, now - lastTs));
  const elapsedDays = elapsedSeconds / 86400n;
  const pendingDeduction = elapsedDays * DAILY_DEDUCTION;

  const effectiveBalance =
    balance > pendingDeduction ? balance - pendingDeduction : 0n;
  if (effectiveBalance <= 0n) return 0;

  return Number(effectiveBalance / DAILY_DEDUCTION);
}

function computeProgress(current: bigint, target: bigint): number {
  if (target <= 0n) return 0;
  const pct = (Number(current) / Number(target)) * 100;
  return Math.min(100, Math.max(0, pct));
}

// === Contract Read Hooks ===

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
 * Fetch total user balances (sum of all deposits).
 */
export function useTotalUserBalances() {
  return useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: lotteryAbi,
    functionName: "totalUserBalances",
    chainId: TARGET_CHAIN_ID,
    query: {
      refetchInterval: NORMAL,
      select: (data) => data as bigint,
    },
  });
}

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

export function useAccountingSummary() {
  return useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: lotteryAbi,
    functionName: "accountingSummary",
    chainId: TARGET_CHAIN_ID,
    query: {
      refetchInterval: NORMAL,
      // viem returns a readonly tuple for multi-output view functions;
      // map it to a typed object so consumers can use `accounting.totalBalance`
      // instead of fragile array indexing (which previously caused the
      // "RangeError: The number NaN cannot be converted to a BigInt" crash
      // when undefined was passed to BigInt()).
      select: (data) => {
        const tuple = data as readonly [
          bigint, // totalBalance
          bigint, // userBalances
          bigint, // poolAmount
          bigint, // lockedAmounts
          bigint, // fees
        ];
        return {
          totalBalance: tuple[0] ?? 0n,
          userBalances: tuple[1] ?? 0n,
          poolAmount: tuple[2] ?? 0n,
          lockedAmounts: tuple[3] ?? 0n,
          fees: tuple[4] ?? 0n,
        } as AccountingSummary;
      },
    },
  });
}

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
      // viem returns a readonly tuple `[balance, lockedAmount, lastDeductionTime,
      // isActive, hasWon, lockedStartTime]` for multi-output view functions.
      // Map it to a typed UserInfo object so downstream code can safely use
      // `userInfo.balance` / `userInfo.lastDeductionTime` (previously these
      // were `undefined` because tuples have no named properties, which then
      // caused `BigInt(NaN)` -> "RangeError: The number NaN cannot be
      // converted to a BigInt" in computeDaysRemaining).
      select: (data) => {
        const tuple = data as readonly [
          bigint, // balance
          bigint, // lockedAmount
          bigint, // lastDeductionTime
          boolean, // isActive
          boolean, // hasWon
          bigint, // lockedStartTime
        ];
        return {
          balance: tuple[0] ?? 0n,
          lockedAmount: tuple[1] ?? 0n,
          lastDeductionTime: tuple[2] ?? 0n,
          isActive: tuple[3] ?? false,
          hasWon: tuple[4] ?? false,
          lockedStartTime: tuple[5] ?? 0n,
        } as UserInfo;
      },
    },
  });
}

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

export function useIsPaused() {
  return useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: lotteryAbi,
    functionName: "paused",
    chainId: TARGET_CHAIN_ID,
    query: {
      refetchInterval: SLOW,
      select: (data) => data as boolean,
    },
  });
}

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

  // V4: No bonus draws
  return {
    regular: regular.data ?? 0n,
    bonus: 0n, // Always 0 in V4
    isLoading: regular.isLoading,
    isError: regular.isError,
  };
}

// === Aggregated Dashboard Hook ===

export function useDashboardData() {
  const { address, isConnected } = useAccount();
  const pool = useCurrentPool();
  const totalBalances = useTotalUserBalances();
  const activeUsers = useActiveUserCount();
  const accounting = useAccountingSummary();
  const userInfo = useUserInfo();
  const drawInProgress = useDrawInProgress();
  const isPaused = useIsPaused();
  const drawCounts = useDrawCounts();

  const hasError =
    pool.isError ||
    activeUsers.isError ||
    accounting.isError ||
    drawInProgress.isError;

  const isLoading =
    !hasError &&
    (pool.isLoading ||
      activeUsers.isLoading ||
      accounting.isLoading ||
      drawInProgress.isLoading);

  // Prize Pool = only the accumulated deductions ($1/day)
  // User balances are NOT part of the prize (they can be withdrawn anytime)
  const prizePool = pool.data ?? 0n;

  const poolProgress = prizePool
    ? computeProgress(prizePool, POOL_TARGET)
    : 0;

  const daysRemaining = userInfo.data
    ? computeDaysRemaining(
        userInfo.data.balance ?? 0n,
        userInfo.data.lastDeductionTime ?? 0n
      )
    : 0;

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
    // Prize Pool — only accumulated deductions (not user deposits)
    currentPool: prizePool,
    poolProgress,
    // Active users
    activeUserCount: activeUsers.data ?? 0n,
    // Accounting (V4: no yield)
    accounting: accounting.data as AccountingSummary | undefined,
    // User position
    userInfo: userInfo.data,
    daysRemaining,
    userStatus,
    // Contract state
    drawInProgress: drawInProgress.data ?? false,
    isPaused: isPaused.data ?? false,
    // Draw counts
    drawCounts,
    // Meta
    isLoading,
    hasError,
  };
}
