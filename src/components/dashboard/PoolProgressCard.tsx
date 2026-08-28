"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "./ProgressBar";
import { formatUsd, formatUsdCompact } from "@/hooks/useLottery";
import { POOL_TARGET, POLYGONSCAN_CONTRACT_URL } from "@/lib/contract/config";
import { Users, Trophy, Calendar, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

import { Card3DTilt } from "@/components/ui/Card3DTilt";
import { LiquidVault3D } from "./LiquidVault3D";

interface PoolProgressCardProps {
  currentPool: bigint;
  poolProgress: number;
  activeUserCount: bigint;
  regularDrawCount: bigint;
  drawInProgress: boolean;
}

export function PoolProgressCard({
  currentPool,
  poolProgress,
  activeUserCount,
  regularDrawCount,
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
    <Card3DTilt glowColor="rgba(16, 185, 129, 0.25)">
      <Card className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-6 shadow-2xl backdrop-blur-xl">
        {/* Background glow */}
        <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-80 -translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl" />

        <div className="relative">
          {/* Header */}
          <div className="mb-5">
            <h3 className="text-lg font-bold text-white">{t("title")}</h3>
            <p className="mt-1 text-xs text-white/50">{t("subtitle")}</p>
          </div>

          {/* 3D Liquid Vault Component */}
          <LiquidVault3D
            progress={poolProgress}
            currentAmountFormatted={formatUsd(currentPool)}
            targetAmountFormatted={formatUsd(POOL_TARGET, 0)}
          />

          {/* Progress bar secondary details */}
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
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/5 pt-5">
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
