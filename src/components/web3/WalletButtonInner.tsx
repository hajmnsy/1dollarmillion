"use client";

import { useState } from "react";
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
import { Wallet, Loader2, LogOut, ChevronDown, ShieldCheck } from "lucide-react";

// ============================================================
// =========== OFFICIAL WALLET BRAND LOGOS ====================
// ============================================================
// Using GitHub org avatars (avatars.githubusercontent.com) which have
// proper CORS headers (`access-control-allow-origin: *`) and 99.9%
// uptime. GitHub raw content URLs are blocked by CSP in browsers.

const METAMASK_LOGO_URL =
  "https://avatars.githubusercontent.com/u/15782395?s=128&v=4";

const TRUST_WALLET_LOGO_URL =
  "https://avatars.githubusercontent.com/u/4633202?s=128&v=4";

const COINBASE_LOGO_URL =
  "https://avatars.githubusercontent.com/u/18060234?s=200&v=4";

const WALLETCONNECT_LOGO_URL =
  "https://avatars.githubusercontent.com/u/117445869?s=128&v=4";

// ============================================================
// ====== INLINE SVG FALLBACKS (guaranteed to render) =========
// ============================================================

function MetaMaskFallback() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-label="MetaMask">
      <circle cx="16" cy="16" r="16" fill="#F6851B" />
      <path
        d="M21.5 8.5l-3 2.5L16 9l-2.5 2L10.5 8.5 9 22l5-3.5L16 21l2-2.5 5 3.5-1.5-13z"
        fill="#fff"
      />
    </svg>
  );
}

function TrustWalletFallback() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-label="Trust Wallet">
      <circle cx="16" cy="16" r="16" fill="#0C8CE9" />
      <path
        d="M16 6L9 9v6c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V9l-7-3z"
        fill="#fff"
      />
    </svg>
  );
}

function CoinbaseFallback() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-label="Coinbase">
      <circle cx="16" cy="16" r="16" fill="#0052FF" />
      <circle
        cx="16"
        cy="16"
        r="6"
        fill="none"
        stroke="#fff"
        strokeWidth="2.5"
      />
      <rect x="14.75" y="6" width="2.5" height="6" fill="#fff" />
    </svg>
  );
}

function WalletConnectFallback() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-label="WalletConnect">
      <circle cx="16" cy="16" r="16" fill="#3B99FC" />
      <path
        d="M10.5 12.3c3.03-2.97 7.94-2.97 10.97 0l.36.36c.15.15.15.39 0 .53l-1.25 1.22c-.07.07-.2.07-.27 0l-.5-.49c-2.12-2.07-5.55-2.07-7.66 0l-.53.52c-.07.07-.2.07-.27 0l-1.25-1.22a.36.36 0 010-.53l.4-.39z"
        fill="#fff"
      />
      <path
        d="M23.05 14.8l1.11 1.08c.15.15.15.39 0 .53l-5.01 4.9c-.15.14-.39.14-.54 0l-3.56-3.48a.1.1 0 00-.14 0l-3.56 3.48c-.15.14-.39.14-.54 0l-5.01-4.9a.36.36 0 010-.53l1.11-1.08a.4.4 0 01.54 0l3.56 3.48a.1.1 0 00.14 0l3.55-3.48a.4.4 0 01.55 0l3.55 3.48a.1.1 0 00.14 0l3.56-3.48a.4.4 0 01.55 0z"
        fill="#fff"
      />
    </svg>
  );
}

// ============================================================
// ====== WALLET IMAGE (img with SVG fallback) ================
// ============================================================

function WalletImage({
  src,
  fallback,
  alt,
}: {
  src: string;
  fallback: React.ReactNode;
  alt: string;
}) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={src}
      alt={alt}
      width={32}
      height={32}
      className="rounded-full object-contain"
      onError={() => setErrored(true)}
    />
  );
}

// ============================================================
// ====== HARDCODED WALLET OPTIONS (always 4 visible) =========
// ============================================================

interface WalletOption {
  key: string;
  label: string;
  desc: string;
  logoUrl: string;
  fallback: React.ReactNode;
  badge: string | null;
  findConnector: (connectors: any[]) => any | undefined;
}

const WALLET_OPTIONS: WalletOption[] = [
  {
    key: "metamask",
    label: "MetaMask",
    desc: "The most popular Web3 wallet",
    logoUrl: METAMASK_LOGO_URL,
    fallback: <MetaMaskFallback />,
    badge: null,
    findConnector: (connectors) =>
      connectors.find(
        (c) => c.id.includes("metaMask") || c.id === "injected"
      ),
  },
  {
    key: "trust",
    label: "Trust Wallet",
    desc: "Connect with Trust Wallet",
    logoUrl: TRUST_WALLET_LOGO_URL,
    fallback: <TrustWalletFallback />,
    badge: null,
    findConnector: (connectors) =>
      connectors.find(
        (c) => c.id.includes("trust") || c.id === "injected"
      ),
  },
  {
    key: "walletconnect",
    label: "WalletConnect",
    desc: "Scan with 300+ wallets",
    logoUrl: WALLETCONNECT_LOGO_URL,
    fallback: <WalletConnectFallback />,
    badge: "300+",
    findConnector: (connectors) =>
      connectors.find(
        (c) =>
          c.id.includes("walletConnect") || c.id.includes("walletconnect")
      ),
  },
  {
    key: "coinbase",
    label: "Coinbase Wallet",
    desc: "Connect with Coinbase Wallet",
    logoUrl: COINBASE_LOGO_URL,
    fallback: <CoinbaseFallback />,
    badge: null,
    findConnector: (connectors) =>
      connectors.find(
        (c) => c.id.includes("coinbase") || c.id.includes("Coinbase")
      ),
  },
];

/**
 * WalletButtonInner — the actual wallet button with all wagmi hooks.
 *
 * This component is ONLY rendered on the client (via next/dynamic
 * with ssr:false in WalletButton.tsx), so it never causes hydration
 * mismatches.
 */
export function WalletButtonInner() {
  const t = useTranslations("wallet");
  const { address, isConnecting, isReconnecting } = useAccount();
  const { connectors, connectAsync, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const [showPicker, setShowPicker] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

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
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowAccountMenu(false)}
            />
            <div className="absolute end-0 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#111] shadow-2xl z-50">
              <div className="border-b border-white/5 px-4 py-3">
                <div className="text-xs font-medium uppercase tracking-wider text-white/40">
                  Connected
                </div>
                <div className="mt-1 font-mono text-xs text-white/80">
                  {address}
                </div>
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
        onClick={() => setShowPicker(true)}
        disabled={isConnecting || isReconnecting}
        className="h-10 gap-2 rounded-full bg-emerald-500 px-4 sm:px-5 text-sm font-semibold text-black shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/40 disabled:opacity-60"
      >
        {isConnecting || isReconnecting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="hidden xs:inline">{t("connecting")}</span>
            <span className="xs:hidden">{t("connectShort")}</span>
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4" />
            <span className="hidden xs:inline">{t("connect")}</span>
            <span className="xs:hidden">{t("connectShort")}</span>
          </>
        )}
      </Button>

      <Dialog open={showPicker} onOpenChange={setShowPicker}>
        <DialogContent className="border-white/10 bg-[#111] p-6 sm:max-w-md">
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
              const connector = option.findConnector([...(connectors || [])]);
              const isAvailable = !!connector;
              const isWalletConnect = option.key === "walletconnect";

              return (
                <button
                  key={option.key}
                  disabled={isPending || (isWalletConnect && !isAvailable)}
                  onClick={async () => {
                    setConnectionError(null);
                    if (!connector) {
                      setConnectionError(
                        `${option.label} is not available. Please install the extension or use WalletConnect.`
                      );
                      return;
                    }
                    try {
                      await connectAsync({ connector });
                      setShowPicker(false);
                    } catch (e: any) {
                      console.error(`Connect to ${option.label} failed:`, e);
                      setConnectionError(
                        e?.shortMessage ||
                          e?.message ||
                          `Failed to connect to ${option.label}`
                      );
                    }
                  }}
                  className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-start transition-all hover:border-emerald-500/40 hover:bg-white/[0.05] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10 overflow-hidden">
                    <WalletImage
                      src={option.logoUrl}
                      fallback={option.fallback}
                      alt={option.label}
                    />
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

          {connectionError && (
            <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-300">
              {connectionError}
            </div>
          )}

          <p className="mt-4 text-center text-xs text-white/40">
            {t("connectShort") === "ربط"
              ? "بإجراء الربط، فإنك توافق على شروط الخدمة وإفصاح المخاطر."
              : "By connecting, you agree to the Terms of Service and Risk Disclosure."}
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
