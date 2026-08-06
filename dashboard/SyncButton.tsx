"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import {
  LOTTERY_CONTRACT_ADDRESS,
  lotteryAbi,
  TARGET_CHAIN_ID,
  DAILY_DEDUCTION,
} from "@/lib/contract/config";

/**
 * SyncButton — applies pending $1/day deductions on-chain.
 *
 * The contract uses "lazy deduction" — deductions are calculated but
 * not applied until someone calls syncUserState(). This button lets
 * users sync their own state to update the prize pool and their balance.
 */
export function SyncButton() {
  const { address } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const [status, setStatus] = useState<"idle" | "syncing" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Read user info to check if sync is needed
  const { data: userInfo } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: lotteryAbi,
    functionName: "getUserInfo",
    args: [address!],
    chainId: TARGET_CHAIN_ID,
    query: {
      enabled: !!address,
      refetchInterval: 10_000,
      select: (data) => {
        const t = data as readonly any[];
        return {
          balance: t[0] ?? 0n,
          lastDeductionTime: t[2] ?? 0n,
        };
      },
    },
  });

  // Calculate pending days
  const now = Math.floor(Date.now() / 1000);
  const lastTime = userInfo?.lastDeductionTime ? Number(userInfo.lastDeductionTime) : 0;
  const elapsedSeconds = lastTime > 0 ? now - lastTime : 0;
  const pendingDays = Math.floor(elapsedSeconds / 86400);
  const pendingDeduction = pendingDays * Number(DAILY_DEDUCTION) / 1e6;
  const needsSync = pendingDays > 0 && (userInfo?.balance ?? 0n) > 0n;

  const handleSync = async () => {
    if (!address) return;
    setStatus("syncing");
    setErrorMsg(null);

    try {
      const hash = await writeContractAsync({
        address: LOTTERY_CONTRACT_ADDRESS,
        abi: lotteryAbi,
        functionName: "syncUserState",
        args: [address],
        chainId: TARGET_CHAIN_ID,
      });

      console.log("Sync transaction:", hash);
      setStatus("done");
      setTimeout(() => setStatus("idle"), 5000);
    } catch (e: any) {
      console.error("Sync failed:", e);
      setErrorMsg(e?.shortMessage || e?.message || "Sync failed");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  if (!needsSync && status === "idle") {
    return (
      <div className="flex items-center gap-2 text-xs text-white/40">
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        <span>State is synced</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        onClick={handleSync}
        disabled={isPending || status === "syncing"}
        size="sm"
        className="h-8 gap-1.5 rounded-lg bg-amber-500 px-3 text-xs font-bold text-black hover:bg-amber-400 disabled:opacity-60"
      >
        {status === "syncing" || isPending ? (
          <>
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            Syncing...
          </>
        ) : status === "done" ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5" />
            Synced!
          </>
        ) : status === "error" ? (
          <>
            <AlertCircle className="h-3.5 w-3.5" />
            Failed
          </>
        ) : (
          <>
            <RefreshCw className="h-3.5 w-3.5" />
            Sync State (${pendingDeduction.toFixed(0)} pending)
          </>
        )}
      </Button>
      {errorMsg && (
        <p className="text-[10px] text-red-400">{errorMsg}</p>
      )}
    </div>
  );
}
