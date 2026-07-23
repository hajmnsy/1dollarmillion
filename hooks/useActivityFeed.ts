"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { LOTTERY_CONTRACT_ADDRESS, TOKEN_DECIMALS_BI } from "@/lib/contract/config";

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

export function useActivityFeed() {
  const { address } = useAccount();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setEvents([]);
      return;
    }

    let cancelled = false;
    const fetchActivity = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const url = `https://api.polygonscan.com/api?module=account&action=tokentx&address=${address}&contractaddress=${LOTTERY_CONTRACT_ADDRESS}&page=1&offset=20&sort=desc`;
        const res = await fetch(url);
        const data = await res.json();

        if (cancelled) return;

        const newEvents: ActivityEvent[] = [];

        if (data.status === "1" && Array.isArray(data.result)) {
          for (const tx of data.result) {
            const isDeposit = tx.from.toLowerCase() === address.toLowerCase();
            const isWithdraw = tx.to.toLowerCase() === address.toLowerCase();

            if (isDeposit || isWithdraw) {
              newEvents.push({
                id: tx.hash + tx.logIndex,
                type: isDeposit ? "deposit" : "withdraw",
                amount: BigInt(tx.value),
                timestamp: parseInt(tx.timeStamp),
                txHash: tx.hash as `0x${string}`,
                confirmed: true,
              });
            }
          }
        }

        newEvents.sort((a, b) => b.timestamp - a.timestamp);

        if (!cancelled) {
          setEvents(newEvents.slice(0, 20));
        }
      } catch (e: any) {
        if (!cancelled) {
          console.error("Activity feed error:", e);
          setError(e?.message || "Failed to load activity");
          setEvents([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchActivity();
    const interval = setInterval(fetchActivity, 30_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [address]);

  return {
    events,
    isLoading,
    error,
    isEmpty: !isLoading && events.length === 0,
  };
}

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
