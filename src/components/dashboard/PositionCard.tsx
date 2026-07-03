"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Wallet,
  Calendar,
  Lock,
  TrendingDown,
  Plus,
  Trophy,
  AlertCircle,
  Clock,
} from "lucide-react";
import { formatUsd } from "@/hooks/useLottery";
import type { UserInfo } from "@/lib/contract/config";

interface PositionCardProps {
  userInfo: UserInfo;
  daysRemaining: number;
  userStatus: "active" | "inactive" | "winner" | "paused";
  drawInProgress: boolean;
  onDeposit: () => void;
  onWithdraw: () => void;
}

export function PositionCard({
  userInfo,
  daysRemaining,
  userStatus,
  drawInProgress,
  onDeposit,
  onWithdraw,
}: PositionCardProps) {
  const t = useTranslations("dashboard.position");

  // Format last sync time
  const lastSyncLabel = (() => {
    if (!userInfo.lastDeductionTime || userInfo.lastDeductionTime === 0n) {
      return t("lastDeductionNever");
    }
    const now = Math.floor(Date.now() / 1000);
    const elapsed = now - Number(userInfo.lastDeductionTime);
    if (elapsed < 60) return t("justNow");
    if (elapsed < 3600) return t("minutesAgo", { minutes: Math.floor(elapsed / 60) });
    if (elapsed < 86400) return t("hoursAgo", { hours: Math.floor(elapsed / 3600) });
    return t("daysAgo", { days: Math.floor(elapsed / 86400) });
  })();

  const statusConfig = {
    active: {
      label: t("active"),
      className: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
      dotClass: "bg-emerald-400 animate-ping",
    },
    inactive: {
      label: t("inactive"),
      className: "bg-red-500/15 text-red-300 ring-red-500/30",
      dotClass: "bg-red-400",
    },
    winner: {
      label: t("winner"),
      className: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
      dotClass: "bg-amber-400 animate-ping",
    },
    paused: {
      label: t("paused"),
      className: "bg-orange-500/15 text-orange-300 ring-orange-500/30",
      dotClass: "bg-orange-400",
    },
  } as const;

  const status = statusConfig[userStatus];
  const isWinner = userStatus === "winner";
  const isInactive = userStatus === "inactive";
  const actionsDisabled = drawInProgress || userStatus === "paused";

  return (
    <Card className="relative overflow-hidden border-white/10 bg-white/[0.02] p-6 shadow-xl">
      {/* Background glow */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-white">{t("title")}</h3>
          <div
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${status.className}`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${status.dotClass}`}
              />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
            </span>
            {status.label}
          </div>
        </div>

        {/* Winner banner */}
        {isWinner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent p-4"
          >
            <Trophy className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            <div>
              <div className="text-sm font-semibold text-amber-200">
                {t("winnerBadge")}
              </div>
              <div className="mt-0.5 text-xs text-white/60">
                {t("winnerLockNote")}
              </div>
            </div>
          </motion.div>
        )}

        {/* Inactive banner */}
        {isInactive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/5 p-4"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
            <div className="text-sm text-white/70">{t("inactiveNote")}</div>
          </motion.div>
        )}

        {/* Draw in progress banner */}
        {drawInProgress && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-300">
            <Clock className="h-4 w-4 animate-pulse" />
            {t("drawInProgress")}
          </div>
        )}

        {/* Balance (primary stat) */}
        <div className="mb-6">
          <div className="mb-1.5 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/50">
            <Wallet className="h-3.5 w-3.5" />
            {t("balance")}
          </div>
          <div className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {formatUsd(userInfo.balance)}
          </div>
        </div>

        {/* Secondary stats grid */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          {/* Days remaining */}
          <div>
            <div className="mb-1.5 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/50">
              <Calendar className="h-3.5 w-3.5" />
              {t("daysRemaining")}
            </div>
            <div className="text-xl font-bold text-white">
              {daysRemaining}
              <span className="ms-1 text-sm font-normal text-white/40">
                {t("daysRemainingDesc").replace("At $1/day deduction rate", "")}
              </span>
            </div>
          </div>

          {/* Locked amount */}
          <div>
            <div className="mb-1.5 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/50">
              <Lock className="h-3.5 w-3.5" />
              {t("lockedAmount")}
            </div>
            <div className="text-xl font-bold text-white">
              {formatUsd(userInfo.lockedAmount)}
            </div>
          </div>
        </div>

        {/* Last sync */}
        <div className="mb-5 flex items-center justify-between border-t border-white/5 pt-4 text-xs text-white/50">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-3.5 w-3.5" />
            <span>{t("lastDeduction")}</span>
          </div>
          <span className="text-white/70">{lastSyncLabel}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={onDeposit}
            disabled={actionsDisabled || isWinner}
            className="group h-11 flex-1 gap-2 rounded-xl bg-emerald-500 text-sm font-semibold text-black shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
            {t("depositMore")}
          </Button>
          <Button
            onClick={onWithdraw}
            disabled={actionsDisabled || userInfo.balance === 0n}
            variant="outline"
            className="h-11 flex-1 gap-2 rounded-xl border-white/15 bg-white/5 text-sm font-medium text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("withdraw")}
          </Button>
        </div>
      </div>
    </Card>
  );
}
