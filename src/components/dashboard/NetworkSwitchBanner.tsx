"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { useNetworkGuard } from "@/hooks/useNetworkGuard";
import { motion } from "framer-motion";

// Map common chain IDs to friendly names for the error message
const chainNames: Record<number, string> = {
  1: "Ethereum Mainnet",
  11155111: "Sepolia",
  137: "Polygon",
  42161: "Arbitrum",
  10: "Optimism",
  8453: "Base",
  56: "BSC",
};

/**
 * NetworkSwitchBanner — shows a red "Wrong Network" banner with a button
 * to switch to Sepolia. Used inside the Deposit and Withdraw modals when
 * the user's wallet is connected to a chain other than Sepolia.
 *
 * When the banner is visible, the parent modal should disable its action
 * buttons (Approve/Deposit/Withdraw) since the tx would fail anyway.
 */
export function NetworkSwitchBanner() {
  const t = useTranslations("dashboard.network");
  const { isWrongChain, connectedChainId, switchChain, isSwitching } =
    useNetworkGuard();

  if (!isWrongChain) return null;

  const connectedChainName = connectedChainId
    ? chainNames[connectedChainId] || `Chain ID ${connectedChainId}`
    : "Unknown";

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-5 overflow-hidden rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-500/15 to-red-500/10 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-amber-300">
            {t("wrongChainTitle")}
          </div>
          <div className="mt-1 text-xs leading-relaxed text-amber-200/80">
            {t("wrongChainDesc", { connectedChain: connectedChainName })}
          </div>
          <Button
            onClick={switchChain}
            disabled={isSwitching}
            className="mt-3 h-9 gap-2 rounded-lg bg-amber-500 px-4 text-xs font-semibold text-black shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 disabled:opacity-60"
          >
            {isSwitching ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {t("switching")}
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5" />
                {t("switchButton")}
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
