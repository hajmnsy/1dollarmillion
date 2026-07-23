"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount, useWatchContractEvent, useReadContract } from "wagmi";
import {
  LOTTERY_CONTRACT_ADDRESS,
  USDT_CONTRACT_ADDRESS,
  lotteryAbi,
  usdtAbi,
  TOKEN_DECIMALS_BI,
} from "@/lib/contract/config";

// ============================================================
// ============== Activity Event Types ========================
// ============================================================

export type ActivityType =
  | "deposit"
  | "withdraw"
  | "deduction"
  | "win"
  | "sync";

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  amount: bigint;
  timestamp: number;
  txHash?: `0x${string}`;
  confirmed: boolean;
}

// ============================================================
// ====== Real Activity Feed using contract events ============
// ============================================================

/**
 * Fetch real deposit/withdraw activity for the connected user.
 *
 * Strategy:
 * 1. Use wagmi's useWatchContractEvent to listen for Deposited events
 * 2. Use wagmi's useReadContract to get the user's last deposit info
 * 3. Fall back to showing the user's current balance as a "deposit" entry
 *    if no events are captured yet (since events require WebSocket)
 */
export function useActivityFeed() {
  const { address } = useAccount();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const eventsRef = useRef<ActivityEvent[]>([]);

  // Read user info to get their balance and last deduction time
  const userInfo = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: lotteryAbi,
    functionName: "getUserInfo",
    args: [address!],
    query: {
      enabled: !!address,
      refetchInterval: 10_000,
    },
  });

  // Watch for Deposited events on the lottery contract
  useWatchContractEvent({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: lotteryAbi,
    eventName: "Deposited",
    onLogs: (logs) => {
      if (!address) return;
      const newEvents: ActivityEvent[] = [];

      for (const log of logs) {
        // Only show events for the connected user
        const depositor = (log.args as any)?.user;
        if (depositor && depositor.toLowerCase() !== address.toLowerCase()) continue;

        const amount = (log.args as any)?.amount ?? 0n;
        newEvents.push({
          id: log.transactionHash + String(log.logIndex),
          type: "deposit",
          amount: amount as bigint,
          timestamp: Math.floor(Date.now() / 1000),
          txHash: log.transactionHash,
          confirmed: true,
        });
      }

      if (newEvents.length > 0) {
        eventsRef.current = [...newEvents, ...eventsRef.current];
        setEvents(eventsRef.current.slice(0, 20));
      }
    },
  });

  // Watch for Withdrawn events
  useWatchContractEvent({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: lotteryAbi,
    eventName: "Withdrawn",
    onLogs: (logs) => {
      if (!address) return;
      const newEvents: ActivityEvent[] = [];

      for (const log of logs) {
        const withdrawer = (log.args as any)?.user;
        if (withdrawer && withdrawer.toLowerCase() !== address.toLowerCase()) continue;

        const amount = (log.args as any)?.amount ?? 0n;
        newEvents.push({
          id: log.transactionHash + String(log.logIndex),
          type: "withdraw",
          amount: amount as bigint,
          timestamp: Math.floor(Date.now() / 1000),
          txHash: log.transactionHash,
          confirmed: true,
        });
      }

      if (newEvents.length > 0) {
        eventsRef.current = [...newEvents, ...eventsRef.current];
        setEvents(eventsRef.current.slice(0, 20));
      }
    },
  });

  // Generate a "deposit" entry from user balance if no events yet
  // This ensures the activity feed shows something for users who deposited
  // before opening the dashboard
  useEffect(() => {
    if (!address || !userInfo.data) {
      setIsLoading(false);
      return;
    }

    const balance = userInfo.data[0] as bigint; // balance
    const lastDeductionTime = userInfo.data[2] as bigint; // lastDeductionTime

    // If user has a balance and no events yet, create a synthetic deposit entry
    if (balance > 0n && eventsRef.current.length === 0) {
      const depositAmount = balance;
      const timestamp = Number(lastDeductionTime) || Math.floor(Date.now() / 1000);

      const syntheticEvent: ActivityEvent = {
        id: `balance-${address}-${timestamp}`,
        type: "deposit",
        amount: depositAmount,
        timestamp: timestamp,
        confirmed: true,
      };

      eventsRef.current = [syntheticEvent];
      setEvents([syntheticEvent]);
    }

    setIsLoading(false);
  }, [address, userInfo.data]);

  return {
    events,
    isLoading,
    error: null as string | null,
    isEmpty: !isLoading && events.length === 0,
  };
}

// ============================================================
// ============= Helper: Relative Time =======================
// ============================================================

export function getRelativeTimeKey(timestamp: number): {
  key: string;
  params?: Record<string, number>;
} {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 60) return { key: "justNow" };
  if (diff < 3600) return { key: "minutesAgo", params: { minutes: Math.floor(diff / 60) } };
  if (diff < 86400) return { key: "hoursAgo", params: { hours: Math.floor(diff / 3600) } };
  return { key: "daysAgo", params: { days: Math.floor(diff / 86400) } };
}
