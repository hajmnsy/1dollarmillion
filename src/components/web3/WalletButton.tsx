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
import { Wallet, LogOut, ChevronDown, ShieldCheck, ExternalLink } from "lucide-react";

// ============================================================
// ====== WALLET BUTTON (smart auto-detect + fallback) ========
// ============================================================
// Strategy:
// 1. If a browser-injected wallet (MetaMask, Trust, Coinbase, Phantom)
//    is detected, connect directly to it (no QR code needed).
// 2. If no injected wallet is detected, open the official
//    WalletConnect modal which shows 300+ wallets with their
//    REAL brand logos.

export function WalletButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-32 h-10 bg-gray-800 rounded-md"></div>;

  return <WalletButtonClient />;
}

function WalletButtonClient() {
  const t = useTranslations("wallet");
  const { address } = useAccount();
  const { connectors, connectAsync } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Detect available connectors
  const injectedConnector = connectors.find(
    (c) => c.id === "injected" || c.id.includes("injected")
  );
  const metaMaskConnector = connectors.find((c) => c.id.includes("metaMask"));
  const coinbaseConnector = connectors.find(
    (c) => c.id.includes("coinbase") || c.id.includes("Coinbase")
  );
  const walletConnectConnector = connectors.find(
    (c) => c.id.includes("walletConnect") || c.id.includes("walletconnect")
  );

  // Check if any browser wallet is installed
  const hasInjected =
    typeof window !== "undefined" && !!(window as any).ethereum;

  // Preferred: use MetaMask connector if available, then injected, then WalletConnect
  const preferredConnector =
    metaMaskConnector ||
    injectedConnector ||
    coinbaseConnector ||
    walletConnectConnector;

  // === Connected state ===
  if (address) {
    const truncated = `${address.slice(0, 6)}...${address.slice(-4)}`;
    return (
      <div className="relative">
        <Button className="h-10 gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 text-sm font-medium text-emerald-300 transition-all hover:bg-emerald-500/20">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="font-mono">{truncated}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
        <DisconnectButton disconnect={disconnect} chainId={chainId} address={address} />
      </div>
    );
  }

  // === Disconnected state ===
  const handleConnect = async () => {
    setError(null);

    if (!preferredConnector) {
      // No connectors available — show install options
      setShowInstallModal(true);
      return;
    }

    setConnecting(true);
    try {
      // If browser wallet is installed, connect directly (fast, no QR)
      if (hasInjected && (metaMaskConnector || injectedConnector)) {
        const conn = metaMaskConnector || injectedConnector;
        await connectAsync({ connector: conn });
      } else if (walletConnectConnector) {
        // No injected wallet — open WalletConnect modal (300+ wallets with real logos)
        await connectAsync({ connector: walletConnectConnector });
      } else {
        // Fallback to whatever is available
        await connectAsync({ connector: preferredConnector });
      }
    } catch (e: any) {
      console.error("Connect failed:", e);
      // User closed the modal — not a real error
      if (
        e?.code === 4001 ||
        e?.name === "UserRejectedRequestError" ||
        e?.message?.includes("rejected")
      )
        return;
      setError(e?.shortMessage || e?.message || "Failed to connect");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleConnect}
        disabled={connecting}
        className="h-10 gap-2 rounded-full bg-emerald-500 px-4 sm:px-5 text-sm font-semibold text-black shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/40 disabled:opacity-60"
      >
        <Wallet className="h-4 w-4" />
        <span className="hidden xs:inline">
          {connecting ? "..." : t("connect")}
        </span>
        <span className="xs:hidden">
          {connecting ? "..." : t("connectShort")}
        </span>
      </Button>

      {error && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300 backdrop-blur">
          {error}
        </div>
      )}

      {/* Install wallet modal — shown when no wallet detected */}
      <Dialog open={showInstallModal} onOpenChange={setShowInstallModal}>
        <DialogContent className="border-white/10 bg-[#111] p-6 sm:max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              {t("connect")}
            </DialogTitle>
            <DialogDescription className="text-white/50">
              {t("connectShort") === "ربط"
                ? "ثبّت محفظة Web3 للاتصال بالمنصة."
                : "Install a Web3 wallet to connect to the platform."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 grid grid-cols-1 gap-2">
            <InstallLink
              label="MetaMask"
              desc="The most popular Web3 wallet"
              url="https://metamask.io/download/"
              color="#E2761B"
            />
            <InstallLink
              label="Trust Wallet"
              desc="Connect with Trust Wallet"
              url="https://trustwallet.com/download"
              color="#0C8CE9"
            />
            <InstallLink
              label="Coinbase Wallet"
              desc="Connect with Coinbase Wallet"
              url="https://www.coinbase.com/wallet/downloads"
              color="#0052FF"
            />
            <InstallLink
              label="Phantom"
              desc="Multi-chain wallet for Solana & EVM"
              url="https://phantom.app/download"
              color="#AB9FF2"
            />
            {walletConnectConnector && (
              <button
                onClick={async () => {
                  setShowInstallModal(false);
                  setConnecting(true);
                  try {
                    await connectAsync({ connector: walletConnectConnector });
                  } catch (e: any) {
                    if (e?.code !== 4001) {
                      setError(e?.shortMessage || e?.message || "Failed");
                    }
                  } finally {
                    setConnecting(false);
                  }
                }}
                className="group flex items-center gap-4 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.05] p-4 text-start transition-all hover:border-emerald-500/60 hover:bg-emerald-500/[0.1]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400 font-bold">
                  WC
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">
                    WalletConnect
                  </div>
                  <div className="text-xs text-white/40">
                    {t("connectShort") === "ربط"
                      ? "امسح QR بـ 300+ محفظة"
                      : "Scan with 300+ wallets"}
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                  300+
                </span>
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function InstallLink({
  label,
  desc,
  url,
  color,
}: {
  label: string;
  desc: string;
  url: string;
  color: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-start transition-all hover:border-emerald-500/40 hover:bg-white/[0.05]"
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: color + "20", color }}
      >
        {label[0]}
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-white">{label}</div>
        <div className="text-xs text-white/40">{desc}</div>
      </div>
      <ExternalLink className="h-4 w-4 text-white/30" />
    </a>
  );
}

function DisconnectButton({
  disconnect,
  chainId,
  address,
}: {
  disconnect: () => void;
  chainId: number;
  address: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <>
      <button
        onClick={() => setShow(!show)}
        className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border border-white/20 bg-[#111]"
        aria-label="Account menu"
      />
      {show && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShow(false)} />
          <div className="absolute end-0 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#111] shadow-2xl z-50 top-full">
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
                setShow(false);
              }}
              className="flex w-full items-center gap-2 px-4 py-3 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </button>
          </div>
        </>
      )}
    </>
  );
}
