"use client";

import { type ReactNode, useMemo } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import {
  mainnet,
  sepolia,
  polygon,
  arbitrum,
  optimism,
  base,
  bsc,
} from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  walletConnect,
  injected,
  coinbaseWallet,
  metaMask,
} from "wagmi/connectors";

export const projectId =
  process.env.NEXT_PUBLIC_WC_PROJECT_ID || "DEMO_PROJECT_ID_REPLACE_ME";

const chains = [polygon, mainnet, sepolia, arbitrum, optimism, base, bsc] as const;

const wagmiConfig = createConfig({
  chains,
  connectors: [
    metaMask({ dappMetadata: { name: "1DollarMillion" } }),
    injected({ shimDisconnect: true }),
    coinbaseWallet({ appName: "1DollarMillion", headlessMode: false }),
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: "1DollarMillion",
        description: "Deposit USDT. Win $1,000,000. Never lose your principal.",
        url: "https://1dollarmillion.com",
        icons: ["https://avatars.githubusercontent.com/u/179552466"],
      },
    }),
  ],
  ssr: true,
  multiInjectedProviderDiscovery: true,
  transports: {
    [polygon.id]: http("https://polygon-bor-rpc.publicnode.com"),
    [sepolia.id]: http("https://ethereum-sepolia-rpc.publicnode.com"),
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
    [bsc.id]: http(),
  },
});

if (typeof window === "undefined" && typeof globalThis !== "undefined") {
  try {
    (globalThis as any).indexedDB =
      (globalThis as any).indexedDB ||
      {
        open: () => ({ onupgradeneeded: null, onsuccess: null, onerror: null, result: {} }),
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      };
  } catch {}
}

export function Web3ModalProvider({ children }: { children: ReactNode }) {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 30_000,
            retry: 2,
          },
        },
      }),
    []
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
