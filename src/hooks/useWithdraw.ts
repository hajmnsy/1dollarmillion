"use client";

import { useState, useCallback } from "react";
import { useAccount, useWriteContract } from "wagmi";
import {
  LOTTERY_CONTRACT_ADDRESS,
  lotteryAbi,
  MIN_DEPOSIT,
  TARGET_CHAIN_ID,
} from "@/lib/contract/config";

// Approximate gas cost in USD for a single withdraw transaction
export const EST_WITHDRAW_GAS_USD = 2.5;

export type WithdrawStep = "idle" | "withdrawing" | "done" | "error";

interface UseWithdrawReturn {
  step: WithdrawStep;
  errorMessage: string;
  withdrawTxHash: `0x${string}` | undefined;
  canWithdraw: boolean;

  withdraw: () => Promise<void>;
  reset: () => void;
}

/**
 * useWithdraw — single-step withdraw flow (no ERC20 approval needed because
 * the contract credits/debits the user's internal balance; only when the
 * contract sends USDT to the user is there an external transfer).
 *
 * Calls `lottery.withdraw(amount)` directly. The hook awaits the tx receipt
 * via `writeContractAsync`, avoiding the setState-in-effect anti-pattern.
 */
export function useWithdraw(amount: bigint): UseWithdrawReturn {
  const { address } = useAccount();
  const withdrawWrite = useWriteContract();

  const [step, setStep] = useState<WithdrawStep>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [withdrawTxHash, setWithdrawTxHash] = useState<
    `0x${string}` | undefined
  >();

  // Amount must be > 0 (no minimum since withdraw is a user right)
  const canWithdraw = amount > 0n;

  const withdraw = useCallback(async () => {
    if (!address) return;
    setStep("withdrawing");
    setErrorMessage("");

    try {
      const hash = await withdrawWrite.writeContractAsync({
        address: LOTTERY_CONTRACT_ADDRESS,
        abi: lotteryAbi,
        functionName: "withdraw",
        args: [amount],
        chainId: TARGET_CHAIN_ID,
      });
      setWithdrawTxHash(hash);
      setStep("done");
    } catch (e: any) {
      setStep("error");
      setErrorMessage(e?.shortMessage || e?.message || "Withdrawal failed");
    }
  }, [address, amount, withdrawWrite]);

  const reset = useCallback(() => {
    setStep("idle");
    setErrorMessage("");
    setWithdrawTxHash(undefined);
  }, []);

  return {
    step,
    errorMessage,
    withdrawTxHash,
    canWithdraw,
    withdraw,
    reset,
  };
}
