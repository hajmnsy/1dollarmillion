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

// Gas efficiency constant is defined below (after the GasEfficiency type)
// See EST_GAS_COST_USD in the Gas Efficiency Computation section.

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
//
// POLYGON MAINNET GAS COSTS (updated 2026-07-20)
// ----------------------------------------------
// Polygon gas costs are ~300x cheaper than Ethereum Mainnet:
//   - ERC20 approve:  ~$0.005 (was $1.50 on ETH)
//   - deposit():      ~$0.010 (was $3.00 on ETH)
//   - Total 2-step:   ~$0.015 (was $4.50 on ETH)
//
// This means even $1 deposits are now gas-efficient!
// ============================================================

export type GasEfficiency = "poor" | "fair" | "good" | "optimal";

/**
 * Total gas cost for a full deposit flow (approve + deposit) on Polygon.
 * Conservative estimate; actual cost is often lower.
 */
export const EST_GAS_COST_USD = 0.015; // $0.015 = 1.5 cents

/**
 * Compute the gas efficiency tier based on deposit amount.
 *
 * On Polygon, gas is so cheap that the efficiency tiers are very forgiving:
 *   - $1+  → optimal (gas is <1.5% of deposit)
 *   - $0.10+ → good
 *   - $0.01+ → fair
 *   - <$0.01 → poor (but still works)
 *
 * @param amountUsd Deposit amount in USD
 * @returns Tier + ratio percentage (gas cost as % of deposit)
 */
export function computeGasEfficiency(amountUsd: number): {
  tier: GasEfficiency;
  ratioPercent: number;
} {
  if (amountUsd <= 0) return { tier: "poor", ratioPercent: 100 };
  const ratio = (EST_GAS_COST_USD / amountUsd) * 100;
  let tier: GasEfficiency;
  // Polygon: very cheap gas, so tiers are calibrated to deposit size
  if (amountUsd >= 1) tier = "optimal";      // $1+ → gas is ≤1.5%
  else if (amountUsd >= 0.5) tier = "good";   // $0.50+ → gas is ≤3%
  else if (amountUsd >= 0.1) tier = "fair";   // $0.10+ → gas is ≤15%
  else tier = "poor";                          // <$0.10 → gas is >15%
  return { tier, ratioPercent: ratio };
}
