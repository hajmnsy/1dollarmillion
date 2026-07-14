"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useChainId } from "wagmi";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Wallet, LogOut, ChevronDown, ShieldCheck } from "lucide-react";

// ============================================================
// ====== PURE INLINE SVG WALLET LOGOS (no external URLs) =====
// ============================================================
// 100% reliable. No CSP issues, no broken links, no network
// dependencies. Professional brand marks as inline SVG.

function MetaMaskIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M27.86 4l-8.06 6.02L21.18 6 27.86 4z" fill="#E2761B"/>
      <path d="M4.14 4l8 6.04L10.74 6 4.14 4z" fill="#E4761B"/>
      <path d="M24.18 22.42l-2.15 3.3 4.6 1.27 1.32-4.5-3.77-.07zm-17.72.07l1.31 4.5 4.6-1.27-2.14-3.3-3.77.07z" fill="#E4761B"/>
      <path d="M9.92 14.26l-1.28 1.93 4.57.2-.16-4.93-3.13 2.8zm12.16 0l-3.2-2.86-.1 4.97 4.55-.2-1.25-1.91z" fill="#E4761B"/>
      <path d="M5.62 21.42l2.55 4.32 4.84-2.16-2.6-3.18-4.79 1.02zm15.36-.02l-4.79-1.04-2.6 3.2 4.85 2.16 2.54-4.32z" fill="#F6851B"/>
      <path d="M13.01 25.74l3-.02.79-4.35-4.57-.4.78 4.77z" fill="#763D16"/>
      <path d="M19.4 26.04l-2.94-3.04-1.94.6 1.95.69.79 1.74.69-.16-1.36-1.62 2.81 1.79zm-7.16-2.04l.79.16.69-1.74 1.95-.69-1.94-.6-2.94 3.04 2.81-1.79-1.36 1.62z" fill="#F6851B"/>
      <path d="M16.69 24.18l1.36 1.62-1.93-.4-.7 1.4-.71-1.4-1.94.4 1.36-1.62-2.81 1.79 4.05 2.4 4.06-2.4-2.74-1.79z" fill="#E2761B"/>
      <path d="M27.86 4l-8.06 6.02L21.18 6l6.68-2z" fill="#E2761B" opacity="0.8"/>
    </svg>
  );
}

function TrustWalletIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#0C8CE9"/>
      <path
        d="M16 7.5c-2.4 0-4.5 1.8-4.5 4.2 0 2.9 2.1 5.6 4.5 7.5 2.4-1.9 4.5-4.6 4.5-7.5 0-2.4-2.1-4.2-4.5-4.2z"
        fill="#fff"
      />
      <path
        d="M9.5 13c-1.4 0-2.5 1.1-2.5 2.5 0 3.2 3.4 6 6.5 7.3.7.3 1.6.5 2.5.5s1.8-.2 2.5-.5c3.1-1.3 6.5-4.1 6.5-7.3 0-1.4-1.1-2.5-2.5-2.5-1.1 0-2 .7-2.4 1.7.2.4.4.8.4 1.3 0 2.2-1.8 4-4 4.5-.6.1-1.2.1-1.8 0-2.2-.5-4-2.3-4-4.5 0-.5.1-.9.4-1.3C11.5 13.7 10.6 13 9.5 13z"
        fill="#fff"
      />
    </svg>
  );
}

function WalletConnectIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#3B99FC"/>
      <path d="M10.5 12.3c3.03-2.97 7.94-2.97 10.97 0l.36.36c.15.15.15.39 0 .53l-1.25 1.22c-.07.07-.2.07-.27 0l-.5-.49c-2.12-2.07-5.55-2.07-7.66 0l-.53.52c-.07.07-.2.07-.27 0l-1.25-1.22a.36.36 0 010-.53l.4-.39z" fill="#fff"/>
      <path d="M23.05 14.8l1.11 1.08c.15.15.15.39 0 .53l-5.01 4.9c-.15.14-.39.14-.54 0l-3.56-3.48a.1.1 0 00-.14 0l-3.56 3.48c-.15.14-.39.14-.54 0l-5.01-4.9a.36.36 0 010-.53l1.11-1.08a.4.4 0 01.54 0l3.56 3.48a.1.1 0 00.14 0l3.55-3.48a.4.4 0 01.55 0l3.55 3.48a.1.1 0 00.14 0l3.56-3.48a.4.4 0 01.55 0z" fill="#fff"/>
    </svg>
  );
}

function CoinbaseIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#0052FF"/>
      <path d="M16 6c-5.25 0-9.5 4.25-9.5 9.5 0 5.06 3.97 9.19 8.97 9.49v-6.5H12.5V16h2.97v-2.4c0-2.93 1.78-4.55 4.42-4.55 1.28 0 2.62.23 2.62.23v2.88h-1.48c-1.45 0-1.91.9-1.91 1.83V16h3.25l-.52 2.99h-2.73v6.5c5-.3 8.97-4.43 8.97-9.49 0-5.25-4.25-9.5-9.5-9.5z" fill="#fff"/>
    </svg>
  );
}

function PhantomIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#AB9FF2"/>
      <path
        d="M21.5 11.2c-.3-.5-.9-.7-1.4-.4l-7.4 4.3c-.3.2-.4.5-.4.8 0 .2.1.4.3.5l1.2.9c.2.1.4.2.6.2.2 0 .3-.1.5-.2l4.6-2.7-3.7 4c-.2.2-.3.5-.3.8v2.8c0 .3.4.5.6.3l1.4-1.4c.1-.1.3-.1.4 0l1.6 1.2c.3.2.7.1.8-.2l1.7-9.4c.1-.4 0-.7-.5-.9z"
        fill="#fff"
      />
    </svg>
  );
}

// ============================================================
// ====== WALLET OPTION DEFINITIONS ===========================
// ============================================================

interface WalletOption {
  key: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
  badge: string | null;
  findConnector: (connectors: any[]) => any | undefined;
}

const WALLET_OPTIONS: WalletOption[] = [
  {
    key: "metamask",
    label: "MetaMask",
    desc: "The most popular Web3 wallet",
    icon: <MetaMaskIcon size={32} />,
    badge: null,
    findConnector: (c) => c.find((x) => x.id.includes("metaMask") || x.id === "injected"),
  },
  {
    key: "trust",
    label: "Trust Wallet",
    desc: "Connect with Trust Wallet",
    icon: <TrustWalletIcon size={32} />,
    badge: null,
    findConnector: (c) => c.find((x) => x.id.includes("trust") || x.id === "injected"),
  },
  {
    key: "walletconnect",
    label: "WalletConnect",
    desc: "Scan with 300+ wallets",
    icon: <WalletConnectIcon size={32} />,
    badge: "300+",
    findConnector: (c) => c.find((x) => x.id.includes("walletConnect") || x.id.includes("walletconnect")),
  },
  {
    key: "coinbase",
    label: "Coinbase Wallet",
    desc: "Connect with Coinbase Wallet",
    icon: <CoinbaseIcon size={32} />,
    badge: null,
    findConnector: (c) => c.find((x) => x.id.includes("coinbase") || x.id.includes("Coinbase")),
  },
  {
    key: "phantom",
    label: "Phantom",
    desc: "Multi-chain wallet for Solana & EVM",
    icon: <PhantomIcon size={32} />,
    badge: null,
    findConnector: (c) => c.find((x) => x.id.includes("phantom") || x.id.includes("Phantom")),
  },
];

// ============================================================
// =========== BULLETPROOF WalletButton =======================
// ============================================================

export function WalletButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-32 h-10 bg-gray-800 rounded-md"></div>;

  return <WalletButtonClient />;
}

// ============================================================
// =========== WalletButtonClient =============================
// ============================================================

function WalletButtonClient() {
  const t = useTranslations("wallet");
  const { address } = useAccount();
  const { connectors, connectAsync } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const [showPicker, setShowPicker] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // === Connected state ===
  if (address) {
    const truncated = `${address.slice(0, 6)}...${address.slice(-4)}`;
    return (
      <div className="relative">
        <Button
          onClick={() => setShowAccountMenu(!showAccountMenu)}
          className="h-10 gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 text-sm font-medium text-emerald-300 transition-all hover:bg-emerald-500/20"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="font-mono">{truncated}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>

        {showAccountMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowAccountMenu(false)} />
            <div className="absolute end-0 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#111] shadow-2xl z-50">
              <div className="border-b border-white/5 px-4 py-3">
                <div className="text-xs font-medium uppercase tracking-wider text-white/40">
                  Connected
                </div>
                <div className="mt-1 font-mono text-xs text-white/80">{address}</div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400">
                  <ShieldCheck className="h-3 w-3" />
                  Chain ID: {chainId}
                </div>
              </div>
              <button
                onClick={() => {
                  disconnect();
                  setShowAccountMenu(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-3 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                Disconnect
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // === Disconnected state ===
  return (
    <>
      <Button
        onClick={() => {
          setError(null);
          setShowPicker(true);
        }}
        className="h-10 gap-2 rounded-full bg-emerald-500 px-4 sm:px-5 text-sm font-semibold text-black shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/40"
      >
        <Wallet className="h-4 w-4" />
        <span className="hidden xs:inline">{t("connect")}</span>
        <span className="xs:hidden">{t("connectShort")}</span>
      </Button>

      <Dialog open={showPicker} onOpenChange={setShowPicker}>
        <DialogContent className="border-white/10 bg-[#111] p-6 sm:max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              {t("connect")}
            </DialogTitle>
            <DialogDescription className="text-white/50">
              {t("connectShort") === "ربط"
                ? "اختر محفظتك المفضّلة للدخول إلى الصندوق."
                : "Choose your preferred wallet to enter the lottery pool."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 grid grid-cols-1 gap-2">
            {WALLET_OPTIONS.map((option) => {
              const connector = option.findConnector(connectors || []);
              const isAvailable = !!connector;
              const isWalletConnect = option.key === "walletconnect";

              return (
                <button
                  key={option.key}
                  disabled={isWalletConnect && !isAvailable}
                  onClick={async () => {
                    setError(null);
                    if (!connector) {
                      setError(
                        `${option.label} is not available. Please install the extension or use WalletConnect.`
                      );
                      return;
                    }
                    try {
                      await connectAsync({ connector });
                      setShowPicker(false);
                    } catch (e: any) {
                      console.error(`Connect to ${option.label} failed:`, e);
                      setError(
                        e?.shortMessage ||
                          e?.message ||
                          `Failed to connect to ${option.label}`
                      );
                    }
                  }}
                  className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-start transition-all hover:border-emerald-500/40 hover:bg-white/[0.05] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10 overflow-hidden">
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">
                      {option.label}
                    </div>
                    <div className="text-xs text-white/40">
                      {isWalletConnect && !isAvailable
                        ? "Requires WalletConnect project ID"
                        : option.desc}
                    </div>
                  </div>
                  {option.badge && (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                      {option.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {error && (
            <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-300">
              {error}
            </div>
          )}

          <p className="mt-4 text-center text-xs text-white/40">
            {t("connectShort") === "ربطل"
              ? "بإجراء الربط، فإنك توافق على شروط الخدمة وإفصاح المخاطر."
              : "By connecting, you agree to the Terms of Service and Risk Disclosure."}
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
