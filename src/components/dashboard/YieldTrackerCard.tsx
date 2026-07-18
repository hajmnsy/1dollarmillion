"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "./ProgressBar";
import { formatUsd } from "@/hooks/useLottery";
import { BONUS_DRAW_TARGET, AAVE_POOL_URL } from "@/lib/contract/config";
import { Sparkles, TrendingUp, Calendar, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface YieldTrackerCardProps {
  yieldBalance: bigint;
  yieldProgress: number;
}

export function YieldTrackerCard({
  yieldBalance,
  yieldProgress,
}: YieldTrackerCardProps) {
  const t = useTranslations("dashboard.yield");

  // Estimate years to bonus draw — assume ~4% APY on principal
  // yield growth rate ≈ principal × 0.04 / 365 per day
  // For demo we use a rough estimate based on current yield rate
  const remaining = BONUS_DRAW_TARGET > yieldBalance
    ? BONUS_DRAW_TARGET - yieldBalance
    : 0n;
  // Assume current yield rate is ~0.001% per day of total principal (~$2M)
  // → ~$20/day yield. So years = remaining / (20 * 365)
  const estYears =
    yieldBalance > 0n && remaining > 0n
      ? Math.max(0.5, Number(remaining) / Number(20n * 365n * 10n ** 6n))
      : 0;

  return (
    <Card className="relative overflow-hidden border-purple-500/20 bg-gradient-to-br from-purple-500/[0.04] via-white/[0.02] to-transparent p-6 shadow-xl">
      {/* Background glow */}
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-purple-500/15 blur-3xl" />

      <div className="relative">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-purple-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-purple-300 ring-1 ring-purple-500/20">
              <Sparkles className="h-3 w-3" />
              DeFi
            </div>
            <h3 className="text-lg font-bold text-white">{t("title")}</h3>
            <p className="mt-1 text-xs text-white/50">{t("subtitle")}</p>
          </div>
        </div>

        {/* Current vs target */}
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-white/40">
              {t("currentLabel")}
            </div>
            <motion.div
              key={yieldBalance.toString()}
              initial={{ opacity: 0.7, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-3xl font-bold tracking-tight text-purple-400 sm:text-4xl"
            >
              {formatUsd(yieldBalance)}
            </motion.div>
          </div>
          <div className="text-end">
            <div className="text-xs font-medium uppercase tracking-wider text-white/40">
              {t("targetLabel")}
            </div>
            <div className="text-2xl font-bold text-white/70">
              {formatUsd(BONUS_DRAW_TARGET, 0)}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <ProgressBar
          value={yieldProgress}
          color="purple"
          height={10}
          pulseNearComplete={false}
        />

        {/* Percentage + estimate */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="font-semibold text-purple-400">
            {yieldProgress.toFixed(2)}%
          </span>
          <span
            className={`font-medium ${
              yieldProgress >= 100 ? "text-emerald-300" : "text-white/50"
            }`}
          >
            <Calendar className="me-1 inline h-3 w-3" />
            {yieldProgress >= 100
              ? t("estimateReady")
              : t("estimateYears", { years: estYears.toFixed(1) })}
          </span>
        </div>

        {/* APY + Note */}
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/5 pt-5">
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-white/40">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              {t("apyLabel")}
            </div>
            <div className="text-base font-bold text-emerald-400">4.32%</div>
          </div>
          <div>
            <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-white/40">
              {t("estimateLabel")}
            </div>
            <div className="text-base font-bold text-white">
              {yieldProgress >= 100
                ? t("estimateReady")
                : `~${estYears.toFixed(1)}y`}
            </div>
          </div>
        </div>

        <p className="mt-4 rounded-lg bg-white/[0.02] p-3 text-xs leading-relaxed text-white/50">
          {t("yieldNote")}
        </p>

        {/* View on Aave */}
        <a
          href={AAVE_POOL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-white/40 transition-colors hover:text-white"
        >
          {t("viewOnAave")}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </Card>
  );
}
