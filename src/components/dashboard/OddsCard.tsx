"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";

interface OddsCardProps {
  activeUserCount: bigint;
  userIsActive: boolean;
}

export function OddsCard({ activeUserCount, userIsActive }: OddsCardProps) {
  const t = useTranslations("dashboard.stats");

  const odds = userIsActive && activeUserCount > 0n
    ? Number(activeUserCount)
    : 0;
  const percent = odds > 0 ? (100 / odds) : 0;

  return (
    <Card className="relative overflow-hidden border-white/10 bg-white/[0.02] p-6 shadow-xl">
      <div className="relative">
        <h3 className="mb-4 text-sm font-bold text-white">
          {t("yourOdds")}
        </h3>

        {userIsActive ? (
          <>
            <div className="mb-1 text-3xl font-bold tracking-tight text-white">
              {t("yourOddsValue", { count: odds.toLocaleString() })}
            </div>
            <div className="mb-4 text-xs text-emerald-400">
              {t("yourOddsPercent", {
                percent: percent < 0.01 ? "<0.01" : percent.toFixed(3),
              })}
            </div>
          </>
        ) : (
          <div className="mb-4 text-2xl font-bold text-white/40">
            —
          </div>
        )}

        <div className="flex items-start gap-2 rounded-lg bg-white/[0.02] p-3 text-xs leading-relaxed text-white/50">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400" />
          <span>{t("yourOddsNote")}</span>
        </div>
      </div>
    </Card>
  );
}
