"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "./ProgressBar";
import { formatUsd, formatUsdCompact } from "@/hooks/useLottery";
import { POOL_TARGET } from "@/lib/contract/config";
import { Users, Trophy, Gift, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface PoolProgressCardProps {
  currentPool: bigint;
  poolProgress: number;
  activeUserCount: bigint;
  regularDrawCount: bigint;
  bonusDrawCount: bigint;
  drawInProgress: boolean;
}

export function PoolProgressCard({
  currentPool,
  poolProgress,
  activeUserCount,
  regularDrawCount,
  bonusDrawCount,
  drawInProgress,
}: PoolProgressCardProps) {
  const t = useTranslations("dashboard.pool");

  // Rough estimate of days to draw — assumes 1 USDT/day per active user
  // (this is the gross pool growth rate, ignoring Aave yield)
  const remaining = POOL_TARGET > currentPool ? POOL_TARGET - currentPool : 0n;
  const dailyGrowth = activeUserCount; // 1 USDT/day per user
  const estDays = dailyGrowth > 0n ? Number(remaining / dailyGrowth) : 0;

  const estimateLabel = drawInProgress
    ? t("estimatePending")
    : poolProgress >= 95
      ? t("estimateImminent")
      : t("estimateDays", { days: estDays });

  return (
    <Card className="relative overflow-hidden border-white/10 bg-white/[0.02] p-6 shadow-xl">
      {/* Background glow */}
      <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-80 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative">
        {/* Header */}
        <div className="mb-5">
          <h3 className="text-lg font-bold text-white">{t("title")}</h3>
          <p className="mt-1 text-xs text-white/50">{t("subtitle")}</p>
        </div>

        {/* Current vs target */}
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-white/40">
              {t("currentLabel")}
            </div>
            <motion.div
              key={currentPool.toString()}
              initial={{ opacity: 0.7, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-3xl font-bold tracking-tight text-emerald-400 sm:text-4xl"
            >
              {formatUsd(currentPool)}
            </motion.div>
          </div>
          <div className="text-end">
            <div className="text-xs font-medium uppercase tracking-wider text-white/40">
              {t("targetLabel")}
            </div>
            <div className="text-2xl font-bold text-white/70">
              {formatUsd(POOL_TARGET, 0)}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <ProgressBar
          value={poolProgress}
          color="emerald"
          height={12}
          pulseNearComplete
        />

        {/* Percentage + estimate */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="font-semibold text-emerald-400">
            {poolProgress.toFixed(1)}%
          </span>
          <span
            className={`font-medium ${
              drawInProgress || poolProgress >= 95
                ? "text-amber-300"
                : "text-white/50"
            }`}
          >
            <Calendar className="me-1 inline h-3 w-3" />
            {estimateLabel}
          </span>
        </div>

        {/* Stats row */}
        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/5 pt-5">
          <Stat
            icon={<Users className="h-4 w-4 text-blue-400" />}
            label={t("activeUsersLabel")}
            value={Number(activeUserCount).toLocaleString()}
          />
          <Stat
            icon={<Trophy className="h-4 w-4 text-emerald-400" />}
            label={t("drawsLabel")}
            value={Number(regularDrawCount).toString()}
          />
          <Stat
            icon={<Gift className="h-4 w-4 text-purple-400" />}
            label={t("bonusDrawsLabel")}
            value={Number(bonusDrawCount).toString()}
          />
        </div>
      </div>
    </Card>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="text-center">
      <div className="mb-1 flex items-center justify-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-white/40">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div className="text-base font-bold text-white">{value}</div>
    </div>
  );
}
