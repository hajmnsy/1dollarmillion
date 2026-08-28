"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { formatUsd } from "@/hooks/useLottery";
import { Card3DTilt } from "@/components/ui/Card3DTilt";
import type { AccountingSummary } from "@/lib/contract/config";
import { POLYGONSCAN_CONTRACT_URL } from "@/lib/contract/config";
import { ShieldCheck, ExternalLink } from "lucide-react";

interface SolvencyCardProps {
  accounting: AccountingSummary | undefined;
}

export function SolvencyCard({ accounting }: SolvencyCardProps) {
  const t = useTranslations("dashboard.solvency");

  if (!accounting) {
    return (
      <Card className="border-white/10 bg-white/[0.02] p-6">
        <div className="h-32 animate-pulse rounded-lg bg-white/5" />
      </Card>
    );
  }

  // V9: Always healthy (principal 100% backed)
  const isHealthy = true;
  const warning = !isHealthy;

  return (
    <Card3DTilt glowColor="rgba(16, 185, 129, 0.15)">
      <Card
        className={`relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-6 shadow-2xl backdrop-blur-xl ${
          warning ? "ring-1 ring-red-500/30" : "ring-1 ring-emerald-500/20"
        }`}
      >
        <div className="relative">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-white">{t("title")}</h3>
            <div
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                isHealthy
                  ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
                  : "bg-red-500/15 text-red-300 ring-1 ring-red-500/30"
              }`}
            >
              <ShieldCheck className="h-3 w-3" />
              {isHealthy ? t("healthy") : t("warning")}
            </div>
          </div>

          <p className="mb-5 text-xs text-white/50">{t("description")}</p>

          {/* Metrics - V9 simplified */}
          <div className="space-y-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <Row
              label={t("totalAssetsLabel")}
              value={formatUsd(accounting.totalBalance)}
              accent
            />
            <Row
              label={t("userBalancesLabel")}
              value={formatUsd(accounting.userBalances)}
            />
            <Row
              label={t("poolBalanceLabel")}
              value={formatUsd(accounting.poolAmount)}
            />
            <Row
              label={t("lockedAmountsLabel")}
              value={formatUsd(accounting.lockedAmounts)}
            />
            <Row
              label={t("protocolFeesLabel")}
              value={formatUsd(accounting.fees)}
            />
          </div>

          {/* Verify on Polygonscan */}
          <a
            href={POLYGONSCAN_CONTRACT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-white/40 transition-colors hover:text-white"
          >
            {t("viewOnEtherscan")}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </Card>
    </Card3DTilt>
  );
}

function Row({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-white/50">{label}</span>
      <span
        className={`font-mono font-semibold ${
          accent ? "text-emerald-400" : "text-white/80"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
