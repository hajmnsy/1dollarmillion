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
// Using official brand asset URLs. Where the exact requested URL
// was 404, the closest working equivalent serving the same logo
// is used.

// MetaMask — official fox logo (brand-resources repo restructured;
// using the same SVG from Wikipedia's Wikimedia Commons mirror)
const METAMASK_LOGO_URL =
  "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg";

// Trust Wallet — official logo from trustwallet/assets repo
const TRUST_WALLET_LOGO_URL =
  "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png";

// Coinbase Wallet — official Coinbase GitHub org avatar
const COINBASE_LOGO_URL =
  "https://avatars.githubusercontent.com/u/18060234?s=200&v=4";

// WalletConnect — official icon from walletconnect-assets repo
// (fixed: removed trailing space in "Blue (Default)" path segment)
const WALLETCONNECT_LOGO_URL =
  "https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Icon/Blue%20(Default)/Icon.svg";

// Generic Ethereum logo for fallback injected wallets
const ETHEREUM_LOGO_URL =
  "https://upload.wikimedia.org/wikipedia/commons/6/6f/Ethereum-icon-purple.svg";

/**
 * Match a wagmi v2 connector to the correct brand logo URL + metadata.
 *
 * wagmi v2 connector IDs:
 *   - MetaMask connector → id: "com.metaMask"
 *   - Coinbase Wallet   → id: "coinbaseWallet"
 *   - WalletConnect      → id: "walletConnect"
 *   - Trust Wallet (injected) → detected via EIP-6963 name
 *   - Injected           → id: "injected"
 */
function getWalletAssets(connectorId: string, connectorName: string) {
  const id = connectorId.toLowerCase();
  const name = connectorName.toLowerCase();

  // Trust Wallet detection — Trust injects as an EIP-1193 provider, so
  // it shows up as "injected" but its name contains "trust"
  if (id.includes("trust") || name.includes("trust")) {
    return {
      logoUrl: TRUST_WALLET_LOGO_URL,
      label: "Trust Wallet",
      desc: "Connect with Trust Wallet",
      badge: null as string | null,
    };
  }

  if (id.includes("metamask") || name.includes("metamask")) {
    return {
      logoUrl: METAMASK_LOGO_URL,
      label: "MetaMask",
      desc: "The most popular Web3 wallet",
      badge: null as string | null,
    };
  }

  if (id.includes("walletconnect") || name.includes("walletconnect")) {
    return {
      logoUrl: WALLETCONNECT_LOGO_URL,
      label: "WalletConnect",
      desc: "Scan with 300+ wallets",
      badge: "300+",
    };
  }

  if (id.includes("coinbase") || name.includes("coinbase")) {
    return {
      logoUrl: COINBASE_LOGO_URL,
      label: "Coinbase Wallet",
      desc: "Connect with Coinbase Wallet",
      badge: null as string | null,
    };
  }

  // Default fallback for any other injected wallet
  return {
    logoUrl: ETHEREUM_LOGO_URL,
    label: connectorName || "Browser Wallet",
    desc: "Any injected EIP-1193 wallet",
    badge: null as string | null,
  };
}

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
              const assets = getWalletAssets(connector.id, connector.name);

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
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10 overflow-hidden">
                    {/* Using plain img with exact official brand URLs */}
                    <img
                      src={assets.logoUrl}
                      alt={assets.label}
                      width={32}
                      height={32}
                      className="rounded-full object-contain"
                      onError={(e) => {
                        // Fallback to Ethereum logo if CDN image fails to load
                        (e.target as HTMLImageElement).src = ETHEREUM_LOGO_URL;
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">
                      {assets.label}
                    </div>
                    <div className="text-xs text-white/40">{assets.desc}</div>
                  </div>
                  {assets.badge && (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                      {assets.badge}
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
