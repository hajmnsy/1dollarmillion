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
import { Wallet, Loader2, LogOut, ChevronDown } from "lucide-react";

// Inline SVG icons for wallets (no external image dependencies)
const MetaMaskIcon = () => (
  <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none">
    <circle cx="16" cy="16" r="16" fill="#F6851B" />
    <path d="M21.5 8.5l-3 2.5L16 9l-2.5 2L10.5 8.5 9 22l5-3.5L16 21l2-2.5 5 3.5-1.5-13z" fill="#fff" />
  </svg>
);

const WalletConnectIcon = () => (
  <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none">
    <circle cx="16" cy="16" r="16" fill="#3B99FC" />
    <path d="M10 12.5c3.3-3.3 8.7-3.3 12 0l.4.4c.2.2.2.5 0 .7l-1.4 1.4c-.1.1-.3.1-.4 0l-.5-.5c-2.3-2.3-6.1-2.3-8.4 0l-.6.5c-.1.1-.3.1-.4 0l-1.4-1.4c-.2-.2-.2-.5 0-.7l.5-.4z" fill="#fff" />
    <path d="M22 16.3l1.2 1.2c.2.2.2.5 0 .7l-2.6 2.6c-.1.1-.3.1-.4 0l-1.9-1.9c-.1-.1-.2-.1-.3 0l-1.9 1.9c-.1.1-.3.1-.4 0l-2.6-2.6c-.2-.2-.2-.5 0-.7l1.2-1.2c2-2 5.2-2 7.1 0z" fill="#fff" />
  </svg>
);

const CoinbaseIcon = () => (
  <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none">
    <circle cx="16" cy="16" r="16" fill="#0052FF" />
    <path d="M16 7c-5 0-9 4-9 9s4 9 9 9c4.5 0 8.3-3.3 8.9-7.7h-4.5c-.5 2-2.3 3.5-4.4 3.5-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5c2.1 0 3.9 1.5 4.4 3.5h4.5C24.3 11.3 20.5 7 16 7z" fill="#fff" />
  </svg>
);

const BrowserIcon = () => (
  <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none">
    <circle cx="16" cy="16" r="16" fill="#627EEA" />
    <path d="M16 6v7.2l6 2.7L16 6z" fill="#fff" fillOpacity=".6" />
    <path d="M16 6L10 15.9l6-2.7V6z" fill="#fff" />
    <path d="M16 21.3v4.7l6-8.1-6 3.4z" fill="#fff" fillOpacity=".6" />
    <path d="M16 26v-4.7l-6-3.4 6 8.1z" fill="#fff" />
    <path d="M16 20.1l6-3.4-6-2.7v6.1z" fill="#fff" fillOpacity=".2" />
    <path d="M10 16.7l6 3.4v-6.1l-6 2.7z" fill="#fff" fillOpacity=".6" />
  </svg>
);

const walletIcons: Record<string, React.ReactNode> = {
  "metaMask": <MetaMaskIcon />,
  "walletConnect": <WalletConnectIcon />,
  "coinbaseWallet": <CoinbaseIcon />,
  "injected": <BrowserIcon />,
};

const walletLabels: Record<string, { en: string; desc: string }> = {
  "metaMask": { en: "MetaMask", desc: "Connect with MetaMask wallet" },
  "walletConnect": { en: "WalletConnect", desc: "Scan with 300+ wallets" },
  "coinbaseWallet": { en: "Coinbase Wallet", desc: "Connect with Coinbase Wallet" },
  "injected": { en: "Browser Wallet", desc: "Any injected EIP-1193 wallet" },
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
                  Connected
                </div>
                <div className="mt-1 font-mono text-xs text-white/80">
                  {address}
                </div>
                <div className="mt-1 text-xs text-emerald-400">
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
              Choose your preferred wallet to enter the lottery pool.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 grid grid-cols-1 gap-2">
            {connectors.map((connector) => {
              const icon = walletIcons[connector.id] || <BrowserIcon />;
              const label =
                walletLabels[connector.id]?.en || connector.name;

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
                      {label}
                    </div>
                    <div className="text-xs text-white/40">
                      {walletLabels[connector.id]?.desc ||
                        "Connect your wallet"}
                    </div>
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
            By connecting, you agree to the Terms of Service and Risk
            Disclosure.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
