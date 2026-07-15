"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useChainId } from "wagmi";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, ChevronDown, ShieldCheck } from "lucide-react";

export function WalletButton() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
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

  const walletConnectConnector = connectors.find(
    (c) => c.id.includes("walletConnect") || c.id.includes("walletconnect")
  );

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

  const handleConnect = async () => {
    setError(null);
    if (!walletConnectConnector) {
      setError("WalletConnect is not available. Check your project ID.");
      return;
    }
    setConnecting(true);
    try {
      await connectAsync({ connector: walletConnectConnector });
    } catch (e: any) {
      console.error("Connect failed:", e);
      if (e?.code === 4001 || e?.name === "UserRejectedRequestError") return;
      setError(e?.shortMessage || e?.message || "Failed to connect");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <>
      <Button onClick={handleConnect} disabled={connecting}
        className="h-10 gap-2 rounded-full bg-emerald-500 px-4 sm:px-5 text-sm font-semibold text-black shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/40 disabled:opacity-60">
        <Wallet className="h-4 w-4" />
        <span className="hidden xs:inline">{connecting ? "..." : t("connect")}</span>
        <span className="xs:hidden">{connecting ? "..." : t("connectShort")}</span>
      </Button>
      {error && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300 backdrop-blur">
          {error}
        </div>
      )}
    </>
  );
}

function DisconnectButton({ disconnect, chainId, address }: { disconnect: () => void; chainId: number; address: string; }) {
  const [show, setShow] = useState(false);
  return (
    <>
      <button onClick={() => setShow(!show)} className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border border-white/20 bg-[#111]" aria-label="Account menu" />
      {show && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShow(false)} />
          <div className="absolute end-0 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#111] shadow-2xl z-50 top-full">
            <div className="border-b border-white/5 px-4 py-3">
              <div className="text-xs font-medium uppercase tracking-wider text-white/40">Connected</div>
              <div className="mt-1 font-mono text-xs text-white/80">{address}</div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400">
                <ShieldCheck className="h-3 w-3" />Chain ID: {chainId}
              </div>
            </div>
            <button onClick={() => { disconnect(); setShow(false); }}
              className="flex w-full items-center gap-2 px-4 py-3 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white">
              <LogOut className="h-4 w-4" />Disconnect
            </button>
          </div>
        </>
      )}
    </>
  );
}
