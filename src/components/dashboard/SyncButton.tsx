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
 * SyncButton — lets users manually sync their state.
 * 
 * The auto-sync bot runs every hour to sync ALL users automatically.
 * This button is for users who want to sync immediately without waiting.
 */
export function SyncButton() {
  const { address } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const [status, setStatus] = useState<"idle" | "syncing" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  // Show "synced" status when no pending deductions
  if (!needsSync && status === "idle") {
    return (
      <div className="flex items-center gap-2 text-xs text-white/40">
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        <span>حالتك محدّثة</span>
      </div>
    );
  }

  // Show sync button when there are pending deductions
  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        onClick={handleSync}
        disabled={isPending || status === "syncing"}
        size="sm"
        className="h-8 gap-1.5 rounded-lg bg-amber-500/80 px-3 text-xs font-bold text-black hover:bg-amber-400 disabled:opacity-60"
      >
        {status === "syncing" || isPending ? (
          <>
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            جارٍ المزامنة...
          </>
        ) : status === "done" ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5" />
            تمت المزامنة!
          </>
        ) : status === "error" ? (
          <>
            <AlertCircle className="h-3.5 w-3.5" />
            فشل
          </>
        ) : (
          <>
            <RefreshCw className="h-3.5 w-3.5" />
            مزامنة (${pendingDeduction.toFixed(0)} معلّق)
          </>
        )}
      </Button>
      {errorMsg && (
        <p className="text-[10px] text-red-400">{errorMsg}</p>
      )}
    </div>
  );
}
