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

// Approximate gas cost in USD (assume $3 average for an ERC20 approve + deposit on L1)
// Used by the gas efficiency badge calculation in the UI.
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
  // State
  step: DepositStep;
  errorStep: DepositStepError;
  errorMessage: string;
  approveTxHash: `0x${string}` | undefined;
  depositTxHash: `0x${string}` | undefined;
  needsApproval: boolean;
  canDeposit: boolean;

  // Actions
  approve: () => Promise<void>;
  deposit: () => Promise<void>;
  reset: () => void;
}

/**
 * useDeposit — orchestrates the 2-step ERC20 approve + contract deposit flow.
 *
 * Step 1: approve USDT (skip if allowance is already sufficient)
 * Step 2: call lottery.deposit(amount)
 *
 * The hook does NOT use `useWaitForTransactionReceipt` — instead it awaits the
 * `writeContractAsync` promise, which resolves once the tx is included in a
 * block. This avoids React's "setState in effect" anti-pattern and keeps
 * state transitions in the same call site that initiated them.
 */
export function useDeposit(amount: bigint): UseDepositReturn {
  const { address } = useAccount();
  const { data: allowance, refetch: refetchAllowance } = useUserUsdtAllowance();

  // Write hooks for both transactions
  const approveWrite = useWriteContract();
  const depositWrite = useWriteContract();

  // Track step state
  const [step, setStep] = useState<DepositStep>("idle");
  const [errorStep, setErrorStep] = useState<DepositStepError>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [approveTxHash, setApproveTxHash] = useState<
    `0x${string}` | undefined
  >();
  const [depositTxHash, setDepositTxHash] = useState<
    `0x${string}` | undefined
  >();

  // Whether approval is needed (allowance < amount)
  const needsApproval = !allowance || allowance < amount;

  // Whether user can deposit (amount meets minimum)
  const canDeposit = amount >= MIN_DEPOSIT;

  // === Approve action ===
  // writeContractAsync resolves once the tx is mined (waits for receipt
  // internally). No need for a separate useEffect to track the receipt.
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
      // Refresh allowance so the UI updates immediately
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
      // Read referrer from localStorage (stored by ReferralCard on landing)
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

  // === Reset to idle ===
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

/**
 * Compute the gas efficiency tier based on deposit amount.
 * Gas cost is roughly fixed at $3 per tx, regardless of deposit size.
 *
 * @param amountUsd Deposit amount in USD
 * @returns Tier + ratio percentage
 */
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
