"use client";

import { http, createConfig, cookieStorage, createStorage } from "wagmi";
import { mainnet, polygon, arbitrum, optimism, base, bsc } from "wagmi/chains";
import { walletConnect, injected, coinbaseWallet } from "wagmi/connectors";

// WalletConnect Cloud Project ID — get one for FREE at https://cloud.walletconnect.com
// This is the only "key" required, and it costs nothing — supports MetaMask, Trust,
// Coinbase, Rainbow, OKX, and 300+ other wallets out of the box.
export const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || "DEMO_PROJECT_ID_REPLACE_ME";

// Chains supported by the platform.
// The 1DollarMillion contract is deployed on Ethereum mainnet (and L2s in future).
export const supportedChains = [mainnet, polygon, arbitrum, optimism, base, bsc] as const;

// Wagmi v2 config — uses cookie storage so SSR works correctly with Next.js.
export const wagmiConfig = createConfig({
  chains: supportedChains,
  connectors: [
    walletConnect({ projectId, showQrModal: false }),
    injected({ shimDisconnect: true }),
    coinbaseWallet({ appName: "1DollarMillion" }),
  ],
  storage: createStorage({ storage: cookieStorage }),
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

// Chain metadata used by Web3Modal to display network info
export const chainImages: Record<number, string> = {};

export const wagmiConfigMetadata = {
  name: "1DollarMillion",
  description: "Deposit USDT. Win $1,000,000. Never lose your principal.",
  url: "https://hybridrosca.xyz",
  icons: ["https://avatars.githubusercontent.com/u/179552466"],
};
