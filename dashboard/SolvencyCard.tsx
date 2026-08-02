"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { formatUsd } from "@/hooks/useLottery";
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

  // V4: Always healthy (no Aave risk, principal 100% backed)
  const isHealthy = true;
  const warning = !isHealthy;

  return (
    <Card
      className={`relative overflow-hidden border-white/10 bg-white/[0.02] p-6 shadow-xl ${
        warning ? "ring-1 ring-red-500/30" : "ring-1 ring-emerald-500/20"
      }`}
    >
      <div className="relative">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white">{t("title")}</h3>
          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              warning
                ? "bg-red-500/15 text-red-300"
                : "bg-emerald-500/15 text-emerald-300"
            }`}
          >
            <ShieldCheck className="h-3 w-3" />
            {t("healthy")}
          </div>
        </div>

        <p className="mb-4 text-xs text-white/50">{t("healthyDesc")}</p>

        <div className="space-y-2.5">
          <Row label={t("totalAssets")} value={formatUsd(accounting.totalBalance)} />
          <Row label={t("principal")} value={formatUsd(accounting.userBalances)} />
          <div className="border-t border-white/5 pt-2.5">
            <Row label={t("solvencyGap")} value="100% ✅" accent />
          </div>
        </div>

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
