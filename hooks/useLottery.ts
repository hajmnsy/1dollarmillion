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
const FAST = 5_000;
const NORMAL = 10_000;
const SLOW = 30_000;

// === Helpers ========================================================

export function toDisplay(bigint: bigint, decimals = 2): number {
  return Number(bigint) / Number(TOKEN_DECIMALS_BI);
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
  balance: bigint,
  lastDeductionTime: bigint,
  now: number = Math.floor(Date.now() / 1000)
): number {
  if (balance <= 0n) return 0;

  const elapsedSeconds = BigInt(Math.max(0, now - Number(lastDeductionTime)));
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

// === Contract Read Hooks ============================================

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
 * This represents the actual money users have deposited.
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
    isError: regular.isError || bonus.isError,
  };
}

// === Aggregated Dashboard Hook ======================================

export function useDashboardData() {
  const { address, isConnected } = useAccount();
  const pool = useCurrentPool();
  const totalBalances = useTotalUserBalances();
  const yield_ = useYieldBalance();
  const activeUsers = useActiveUserCount();
  const accounting = useAccountingSummary();
  const userInfo = useUserInfo();
  const drawInProgress = useDrawInProgress();
  const isPaused = useIsPaused();
  const drawCounts = useDrawCounts();

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

  // Total pool = currentPool (deducted) + totalUserBalances (deposits not yet deducted)
  // This shows the actual total money users have deposited
  const totalPoolAmount = (totalBalances.data ?? 0n) + (pool.data ?? 0n);

  const poolProgress = totalPoolAmount
    ? computeProgress(totalPoolAmount, POOL_TARGET)
    : 0;
  const yieldProgress = yield_.data
    ? computeProgress(yield_.data, BONUS_DRAW_TARGET)
    : 0;

  const daysRemaining = userInfo.data
    ? computeDaysRemaining(
        userInfo.data.balance,
        userInfo.data.lastDeductionTime
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
    // Pool — shows total deposited amount
    currentPool: totalPoolAmount,
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
    // Draw counts
    drawCounts,
    // Meta
    isLoading,
    hasError,
  };
}
