"use client";

import { useMemo } from "react";
import { useAccount } from "wagmi";
import { TOKEN_DECIMALS_BI } from "@/lib/contract/config";

// ============================================================
// ============== Activity Event Types ========================
// ============================================================

export type ActivityType =
  | "deposit"
  | "withdraw"
  | "deduction"
  | "win"
  | "lockDrip"
  | "sync";

export type DrawType = "regular" | "bonus";

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  amount: bigint;       // raw units (6 decimals). For wins, this is the payout.
  timestamp: number;    // unix seconds
  txHash?: `0x${string}`;
  drawType?: DrawType;  // only for "win" events
  confirmed: boolean;
}

// ============================================================
// ============== Mock Data Generator =========================
// ============================================================

/**
 * Generate a realistic mock activity feed for the connected user.
 * Used while the contract address is still a placeholder — once we deploy
 * to mainnet, this will be replaced with `useWatchContractEvent` reads.
 *
 * Generates ~12 events spanning the last ~5 days, with a realistic
 * distribution: deposits, daily deductions, one withdrawal, occasional
 * syncs. Timestamps are computed relative to `now`.
 */
function generateMockActivity(userAddress: string | undefined): ActivityEvent[] {
  const now = Math.floor(Date.now() / 1000);
  const HOUR = 3600;
  const DAY = 24 * HOUR;

  const events: ActivityEvent[] = [
    // Recent deposit (2 hours ago)
    {
      id: "evt-1",
      type: "deposit",
      amount: 30n * TOKEN_DECIMALS_BI,
      timestamp: now - 2 * HOUR,
      txHash: "0xabc1230000000000000000000000000000000000000000000000000000000001",
      confirmed: true,
    },
    // Daily deduction (6 hours ago)
    {
      id: "evt-2",
      type: "deduction",
      amount: 1n * TOKEN_DECIMALS_BI,
      timestamp: now - 6 * HOUR,
      confirmed: true,
    },
    // Sync state (yesterday)
    {
      id: "evt-3",
      type: "sync",
      amount: 0n,
      timestamp: now - 1 * DAY - 2 * HOUR,
      confirmed: true,
    },
    // Daily deduction (yesterday)
    {
      id: "evt-4",
      type: "deduction",
      amount: 1n * TOKEN_DECIMALS_BI,
      timestamp: now - 1 * DAY - 5 * HOUR,
      confirmed: true,
    },
    // Small withdrawal (2 days ago)
    {
      id: "evt-5",
      type: "withdraw",
      amount: 5n * TOKEN_DECIMALS_BI,
      timestamp: now - 2 * DAY - 3 * HOUR,
      txHash: "0xabc1230000000000000000000000000000000000000000000000000000000002",
      confirmed: true,
    },
    // Daily deduction (2 days ago)
    {
      id: "evt-6",
      type: "deduction",
      amount: 1n * TOKEN_DECIMALS_BI,
      timestamp: now - 2 * DAY - 8 * HOUR,
      confirmed: true,
    },
    // Deposit (3 days ago)
    {
      id: "evt-7",
      type: "deposit",
      amount: 50n * TOKEN_DECIMALS_BI,
      timestamp: now - 3 * DAY - 1 * HOUR,
      txHash: "0xabc1230000000000000000000000000000000000000000000000000000000003",
      confirmed: true,
    },
    // Daily deduction (3 days ago)
    {
      id: "evt-8",
      type: "deduction",
      amount: 1n * TOKEN_DECIMALS_BI,
      timestamp: now - 3 * DAY - 6 * HOUR,
      confirmed: true,
    },
    // Daily deduction (4 days ago)
    {
      id: "evt-9",
      type: "deduction",
      amount: 1n * TOKEN_DECIMALS_BI,
      timestamp: now - 4 * DAY - 4 * HOUR,
      confirmed: true,
    },
    // Initial deposit (5 days ago)
    {
      id: "evt-10",
      type: "deposit",
      amount: 100n * TOKEN_DECIMALS_BI,
      timestamp: now - 5 * DAY - 2 * HOUR,
      txHash: "0xabc1230000000000000000000000000000000000000000000000000000000004",
      confirmed: true,
    },
  ];

  // If user is connected, include their address in the event IDs (so different
  // users see consistent — but unique — feeds in dev)
  if (userAddress) {
    return events.map((e) => ({
      ...e,
      id: `${userAddress.slice(0, 8)}-${e.id}`,
    }));
  }

  return events;
}

// ============================================================
// ============== Format Helper ===============================
// ============================================================

/**
 * Format a relative timestamp using translation keys.
 * Returns the i18n key + variables for next-intl's t() function.
 */
export function getRelativeTimeKey(
  timestamp: number,
  now: number = Math.floor(Date.now() / 1000)
): { key: string; vars: Record<string, number> } {
  const diff = Math.max(0, now - timestamp);
  if (diff < 60) return { key: "justNow", vars: {} };
  if (diff < 3600) {
    return { key: "minutesAgo", vars: { minutes: Math.floor(diff / 60) } };
  }
  if (diff < 86400) {
    return { key: "hoursAgo", vars: { hours: Math.floor(diff / 3600) } };
  }
  if (diff < 2 * 86400) {
    return { key: "yesterday", vars: {} };
  }
  return { key: "daysAgo", vars: { days: Math.floor(diff / 86400) } };
}

// ============================================================
// ============== Main Hook ===================================
// ============================================================

/**
 * useActivityFeed — returns the user's recent activity events.
 *
 * Currently uses mock data. When the contract is deployed, replace the
 * `useMemo` body with a `useWatchContractEvent` subscription on the
 * Deposited / Withdrawn / Deducted events, plus an initial `getLogs` fetch
 * for historical events.
 */
export function useActivityFeed(): {
  events: ActivityEvent[];
  isLoading: boolean;
} {
  const { address } = useAccount();

  // Generate mock data once per wallet connection
  const events = useMemo(() => generateMockActivity(address), [address]);

  return {
    events,
    isLoading: false,
  };
}
