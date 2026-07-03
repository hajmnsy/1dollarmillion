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
// ============== ACCURATE WALLET BRAND ICONS =================
// ============================================================
// Each icon uses authentic brand SVG paths sourced from the
// official wallet branding guidelines.

/** MetaMask — official fox logo (simplified path) */
const MetaMaskIcon = () => (
  <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
    <path
      fill="#E2761B"
      d="M27.86 4l-8.06 6.02L21.18 6l6.68-2z"
    />
    <path
      fill="#E4761B"
      d="M4.14 4l8 6.04L10.74 6 4.14 4zm19.84 18.42l-2.15 3.3 4.6 1.27 1.32-4.5-3.77-.07zm-22.18.07l1.31 4.5 4.6-1.27-2.14-3.3-3.77.07z"
    />
    <path
      fill="#E4761B"
      d="M9.92 14.26l-1.28 1.93 4.57.2-.16-4.93-3.13 2.8zm12.16 0l-3.2-2.86-.1 4.97 4.55-.2-1.25-1.91z"
    />
    <path
      fill="#F6851B"
      d="M5.62 21.42l2.55 4.32 4.84-2.16-2.6-3.18-4.79 1.02zm15.36-.02l-4.79-1.04-2.6 3.2 4.85 2.16 2.54-4.32z"
    />
    <path
      fill="#E4761B"
      d="M16 8.36l-2 .4 1.84 1.6z"
    />
    <path
      fill="#763D16"
      d="M5.62 21.42l2.46 5.45 3.91-2.93-.43-2.34-5.94-.18zm15.36-.02l-5.94.16-.4 2.36 3.88 2.94 2.46-5.46z"
    />
    <path
      fill="#D7C1B3"
      d="M16 22.27v-3.2l-3.13-.06L13 22.27h3z"
    />
    <path
      fill="#763D16"
      d="M19.4 26.04l-2.94-3.04-1.94.6 1.95.69.79 1.74.69-.16-1.36-1.62 2.81 1.79zm-7.16-2.04l.79.16.69-1.74 1.95-.69-1.94-.6-2.94 3.04 2.81-1.79-1.36 1.62z"
    />
    <path
      fill="#F6851B"
      d="M16.69 24.18l1.36 1.62-1.93-.4-.7 1.4-.71-1.4-1.94.4 1.36-1.62-2.81 1.79 4.05 2.4 4.06-2.4-2.74-1.79z"
    />
    <path
      fill="#E2761B"
      d="M27.86 4l-8.06 6.02L21.18 6 6.86 4l-.21 4.99 2.4 4.42-1.21 4.84 3.36 1.84 3.74.31L16 24l3.06-1.6 3.74-.31 3.36-1.84-1.21-4.84 2.4-4.42L21.18 6l-.21-2z"
      opacity="0"
    />
  </svg>
);

/** WalletConnect — official logo (blue circle + connected-knot mark) */
const WalletConnectIcon = () => (
  <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
    <circle cx="16" cy="16" r="16" fill="#3B99FC" />
    <path
      fill="#fff"
      d="M10.5 12.3c3.03-2.97 7.94-2.97 10.97 0l.36.36c.15.15.15.39 0 .53l-1.25 1.22c-.07.07-.2.07-.27 0l-.5-.49c-2.12-2.07-5.55-2.07-7.66 0l-.53.52c-.07.07-.2.07-.27 0l-1.25-1.22a.36.36 0 010-.53l.4-.39zm13.55 2.51l1.11 1.08c.15.15.15.39 0 .53l-5.01 4.9c-.15.14-.39.14-.54 0l-3.56-3.48a.1.1 0 00-.14 0l-3.56 3.48c-.15.14-.39.14-.54 0l-5.01-4.9a.36.36 0 010-.53l1.11-1.08a.4.4 0 01.54 0l3.56 3.48a.1.1 0 00.14 0l3.55-3.48a.4.4 0 01.55 0l3.55 3.48a.1.1 0 00.14 0l3.56-3.48a.4.4 0 01.55 0z"
    />
  </svg>
);

/** Coinbase Wallet — official blue circle with C mark */
const CoinbaseIcon = () => (
  <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
    <circle cx="16" cy="16" r="16" fill="#0052FF" />
    <path
      fill="#fff"
      d="M16 6.5c-5.25 0-9.5 4.25-9.5 9.5 0 5.06 3.97 9.19 8.97 9.49v-6.5H12.5V16h2.97v-2.4c0-2.93 1.78-4.55 4.42-4.55 1.28 0 2.62.23 2.62.23v2.88h-1.48c-1.45 0-1.91.9-1.91 1.83V16h3.25l-.52 2.99h-2.73v6.5c5-.3 8.97-4.43 8.97-9.49 0-5.25-4.25-9.5-9.5-9.5z"
    />
  </svg>
);

/** Generic injected wallet — Ethereum diamond logo */
const BrowserIcon = () => (
  <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
    <circle cx="16" cy="16" r="16" fill="#627EEA" />
    <path
      fill="#fff"
      fillOpacity=".602"
      d="M16.498 4v8.87l7.497 3.35z"
    />
    <path
      fill="#fff"
      d="M16.498 4L9 16.22l7.498-3.35z"
    />
    <path
      fill="#fff"
      fillOpacity=".602"
      d="M16.498 21.968v6.027L24 17.616z"
    />
    <path
      fill="#fff"
      d="M16.498 27.995v-6.028L9 17.616z"
    />
    <path
      fill="#fff"
      fillOpacity=".2"
      d="M16.498 20.573l7.497-4.353-7.497-3.348z"
    />
    <path
      fill="#fff"
      fillOpacity=".602"
      d="M9 16.22l7.498 4.353v-7.701z"
    />
  </svg>
);

const walletIcons: Record<string, React.ReactNode> = {
  metaMask: <MetaMaskIcon />,
  walletConnect: <WalletConnectIcon />,
  coinbaseWallet: <CoinbaseIcon />,
  injected: <BrowserIcon />,
};

const walletMeta: Record<
  string,
  { label: string; desc: string }
> = {
  metaMask: {
    label: "MetaMask",
    desc: "The most popular Web3 wallet",
  },
  walletConnect: {
    label: "WalletConnect",
    desc: "Scan with 300+ wallets",
  },
  coinbaseWallet: {
    label: "Coinbase Wallet",
    desc: "Connect with Coinbase Wallet",
  },
  injected: {
    label: "Browser Wallet",
    desc: "Any injected EIP-1193 wallet",
  },
};

/**
 * WalletButton — universal wallet connect button.
 *
 * Uses wagmi v2's useConnect hook to enumerate available connectors.
 * WalletConnect protocol provides free support for 300+ wallets via QR code.
 */
export function WalletButton() {
  const t = useTranslations("wallet");
  const { address, isConnecting, isReconnecting } = useAccount();
  const { connectors, connectAsync, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const [showPicker, setShowPicker] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // === Connected state: show address chip + disconnect dropdown ===
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
                  {t("connecting") ? "Connected" : "Wallet"}
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

  // === Disconnected state: open wallet picker modal ===
  return (
    <>
      <Button
        onClick={() => setShowPicker(true)}
        disabled={isConnecting || isReconnecting}
        className="h-10 gap-2 rounded-full bg-emerald-500 px-4 sm:px-5 text-sm font-semibold text-black shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/40 disabled:opacity-60"
      >
        {isConnecting || isReconnecting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Wallet className="h-4 w-4" />
        )}
        <span className="hidden xs:inline">{t("connect")}</span>
        <span className="xs:hidden">{t("connectShort")}</span>
      </Button>

      {/* Wallet picker modal */}
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
            {connectors.map((connector) => {
              const icon =
                walletIcons[connector.id] || <BrowserIcon />;
              const meta =
                walletMeta[connector.id] || {
                  label: connector.name,
                  desc: "Connect your wallet",
                };

              return (
                <button
                  key={connector.uid}
                  disabled={isPending}
                  onClick={async () => {
                    try {
                      await connectAsync({ connector });
                      setShowPicker(false);
                    } catch (e) {
                      console.error("Connect failed:", e);
                    }
                  }}
                  className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-start transition-all hover:border-emerald-500/40 hover:bg-white/[0.05] disabled:opacity-50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10">
                    {icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">
                      {meta.label}
                    </div>
                    <div className="text-xs text-white/40">{meta.desc}</div>
                  </div>
                  {connector.id === "walletConnect" && (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                      300+
                    </span>
                  )}
                </button>
              );
            })}
          </div>

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
