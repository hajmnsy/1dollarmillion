"use client";

import { useState, useCallback } from "react";
import { useAccount, useWriteContract } from "wagmi";
import {
  LOTTERY_CONTRACT_ADDRESS,
  USDT_CONTRACT_ADDRESS,
  lotteryAbi,
  usdtAbi,
  TOKEN_DECIMALS_BI,
  MIN_DEPOSIT,
  TARGET_CHAIN_ID,
} from "@/lib/contract/config";
import { useUserUsdtAllowance } from "@/hooks/useLottery";

export const EST_GAS_COST_USD = 3;

export type DepositStep =
  | "idle"
  | "approving"
  | "approved"
  | "depositing"
  | "done"
  | "error";

export type DepositStepError = "approve" | "deposit" | null;

interface UseDepositReturn {
  step: DepositStep;
  errorStep: DepositStepError;
  errorMessage: string;
  approveTxHash: `0x${string}` | undefined;
  depositTxHash: `0x${string}` | undefined;
  needsApproval: boolean;
  canDeposit: boolean;
  approve: () => Promise<void>;
  deposit: () => Promise<void>;
  reset: () => void;
}

export function useDeposit(amount: bigint): UseDepositReturn {
  const { address } = useAccount();
  const { data: allowance, refetch: refetchAllowance } = useUserUsdtAllowance();

  const approveWrite = useWriteContract();
  const depositWrite = useWriteContract();

  const [step, setStep] = useState<DepositStep>("idle");
  const [errorStep, setErrorStep] = useState<DepositStepError>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [approveTxHash, setApproveTxHash] = useState<
    `0x${string}` | undefined
  >();
  const [depositTxHash, setDepositTxHash] = useState<
    `0x${string}` | undefined
  >();

  const needsApproval = !allowance || allowance < amount;
  const canDeposit = amount >= MIN_DEPOSIT;

  // === Approve action ===
  const approve = useCallback(async () => {
    if (!address) return;
    setStep("approving");
    setErrorStep(null);
    setErrorMessage("");

    try {
      const hash = await approveWrite.writeContractAsync({
        address: USDT_CONTRACT_ADDRESS,
        abi: usdtAbi,
        functionName: "approve",
        args: [LOTTERY_CONTRACT_ADDRESS, amount],
        chainId: TARGET_CHAIN_ID,
      });
      setApproveTxHash(hash);
      setStep("approved");
      refetchAllowance();
    } catch (e: any) {
      setStep("error");
      setErrorStep("approve");
      setErrorMessage(e?.shortMessage || e?.message || "Approval failed");
    }
  }, [address, amount, approveWrite, refetchAllowance]);

  // === Deposit action ===
  const deposit = useCallback(async () => {
    if (!address) return;
    setStep("depositing");
    setErrorStep(null);
    setErrorMessage("");

    try {
      // V3 contract: deposit(uint256 amount, address referrer)
      let referrer: `0x${string}` = "0x0000000000000000000000000000000000000000" as `0x${string}`;
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("1dm_referrer");
        if (stored && stored.startsWith("0x") && stored.length === 42) {
          referrer = stored as `0x${string}`;
        }
      }

      const hash = await depositWrite.writeContractAsync({
        address: LOTTERY_CONTRACT_ADDRESS,
        abi: lotteryAbi,
        functionName: "deposit",
        args: [amount, referrer],
        chainId: TARGET_CHAIN_ID,
      });
      setDepositTxHash(hash);
      setStep("done");
    } catch (e: any) {
      setStep("error");
      setErrorStep("deposit");
      setErrorMessage(e?.shortMessage || e?.message || "Deposit failed");
    }
  }, [address, amount, depositWrite]);

  const reset = useCallback(() => {
    setStep("idle");
    setErrorStep(null);
    setErrorMessage("");
    setApproveTxHash(undefined);
    setDepositTxHash(undefined);
  }, []);

  return {
    step,
    errorStep,
    errorMessage,
    approveTxHash,
    depositTxHash,
    needsApproval,
    canDeposit,
    approve,
    deposit,
    reset,
  };
}

// ============================================================
// =============== Gas Efficiency Computation ================
// ============================================================

export type GasEfficiency = "poor" | "fair" | "good" | "optimal";

export function computeGasEfficiency(amountUsd: number): {
  tier: GasEfficiency;
  ratioPercent: number;
} {
  if (amountUsd <= 0) return { tier: "poor", ratioPercent: 100 };
  const ratio = (EST_GAS_COST_USD / amountUsd) * 100;
  let tier: GasEfficiency;
  if (amountUsd < 10) tier = "poor";
  else if (amountUsd < 30) tier = "fair";
  else if (amountUsd < 100) tier = "good";
  else tier = "optimal";
  return { tier, ratioPercent: ratio };
}
