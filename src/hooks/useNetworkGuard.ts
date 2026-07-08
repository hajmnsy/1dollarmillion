"use client";

import { useAccount, useSwitchChain } from "wagmi";
import { sepolia } from "wagmi/chains";
import { TARGET_CHAIN_ID } from "@/lib/contract/config";

/**
 * useNetworkGuard — detects when the user's wallet is connected to a chain
 * other than our target (Sepolia), and provides a `switchChain` action.
 *
 * Returns:
 *   - isWrongChain: true if the user is connected but on the wrong chain
 *   - isCorrectChain: true if the user is connected AND on Sepolia
 *   - connectedChainId: the chain ID the wallet is currently on (or undefined)
 *   - targetChainId: our target (Sepolia = 11155111)
 *   - targetChainName: "Sepolia"
 *   - switchChain: function that prompts the wallet to switch networks
 *   - isSwitching: true while the switch request is pending
 */
export function useNetworkGuard() {
  const { chainId, isConnected } = useAccount();
  const { switchChainAsync, isPending } = useSwitchChain();

  const isCorrectChain = isConnected && chainId === TARGET_CHAIN_ID;
  const isWrongChain = isConnected && chainId !== TARGET_CHAIN_ID;

  const switchChain = async () => {
    try {
      await switchChainAsync({ chainId: TARGET_CHAIN_ID });
    } catch (e) {
      console.error("Failed to switch chain:", e);
    }
  };

  return {
    isWrongChain,
    isCorrectChain,
    connectedChainId: chainId,
    targetChainId: TARGET_CHAIN_ID,
    targetChainName: "Sepolia",
    switchChain,
    isSwitching: isPending,
  };
}
