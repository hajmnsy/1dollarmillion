"use client";

import { type ReactNode, useMemo } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import {
  mainnet,
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

// WalletConnect Cloud Project ID — get one for FREE at https://cloud.walletconnect.com
// This is the only "key" required, and it costs nothing — supports MetaMask, Trust,
// Coinbase, Rainbow, OKX, and 300+ other wallets out of the box.
export const projectId =
  process.env.NEXT_PUBLIC_WC_PROJECT_ID || "DEMO_PROJECT_ID_REPLACE_ME";

const chains = [mainnet, polygon, arbitrum, optimism, base, bsc] as const;

// SSR-safe storage: falls back to a no-op in-memory store when window is undefined
const ssrSafeStorage = {
  getItem: (key: string) => {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, value);
    } catch {}
  },
  removeItem: (key: string) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch {}
  },
};

/**
 * Wagmi v2 config — SSR-safe with localStorage persistence.
 * Connectors:
 *   - metaMask:        direct MetaMask injection (most users)
 *   - injected:        generic EIP-1193 fallback for any browser wallet
 *   - coinbaseWallet:  Coinbase browser extension + Coinbase Wallet mobile
 *   - walletConnect:   universal WalletConnect protocol — opens a QR modal
 *                       that supports 300+ wallets (Trust, Rainbow, OKX, etc.)
 */
const wagmiConfig = createConfig({
  chains,
  connectors: [
    metaMask({ dappMetadata: { name: "HybridRoSCA Lottery" } }),
    injected({ shimDisconnect: true }),
    coinbaseWallet({ appName: "HybridRoSCA Lottery", headlessMode: false }),
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: "HybridRoSCA Lottery",
        description: "Deposit USDT. Win $1,000,000. Never lose your principal.",
        url: "https://hybridrosca.xyz",
        icons: ["https://avatars.githubusercontent.com/u/179552466"],
      },
    }),
  ],
  // Use SSR-safe storage instead of cookieStorage (which triggers indexedDB issues
  // in WalletConnect's internal storage layer on Node SSR)
  ssr: true,
  multiInjectedProviderDiscovery: true,
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
    [bsc.id]: http(),
  },
});

/**
 * Web3ModalProvider — wraps the entire app with Wagmi + TanStack Query.
 *
 * Wallet UI is rendered by our custom WalletButton component using wagmi's
 * useConnect / useAccount hooks. The WalletConnect modal is opened
 * automatically by wagmi's walletConnect connector (showQrModal: true).
 *
 * Zero cost to the platform — WalletConnect Cloud is free up to massive volume.
 */
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
