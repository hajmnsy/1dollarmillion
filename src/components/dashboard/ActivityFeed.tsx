"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Calendar,
  Trophy,
  Droplets,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatUsd } from "@/hooks/useLottery";
import {
  useActivityFeed,
  getRelativeTimeKey,
  type ActivityType,
  type ActivityEvent,
} from "@/hooks/useActivityFeed";

// ============================================================
// ============= Type → Icon + Color Mapping =================
// ============================================================

const typeConfig: Record<
  ActivityType,
  { icon: LucideIcon; bg: string; fg: string; ring: string; sign: "+" | "-" | "" }
> = {
  deposit: {
    icon: ArrowDownToLine,
    bg: "bg-emerald-500/15",
    fg: "text-emerald-400",
    ring: "ring-emerald-500/20",
    sign: "+",
  },
  withdraw: {
    icon: ArrowUpFromLine,
    bg: "bg-amber-500/15",
    fg: "text-amber-400",
    ring: "ring-amber-500/20",
    sign: "-",
  },
  deduction: {
    icon: Calendar,
    bg: "bg-white/5",
    fg: "text-white/60",
    ring: "ring-white/10",
    sign: "-",
  },
  win: {
    icon: Trophy,
    bg: "bg-purple-500/15",
    fg: "text-purple-400",
    ring: "ring-purple-500/20",
    sign: "+",
  },
  lockDrip: {
    icon: Droplets,
    bg: "bg-blue-500/15",
    fg: "text-blue-400",
    ring: "ring-blue-500/20",
    sign: "-",
  },
  sync: {
    icon: RefreshCw,
    bg: "bg-white/5",
    fg: "text-white/50",
    ring: "ring-white/10",
    sign: "",
  },
};

// ============================================================
// =================== Main Component ========================
// ============================================================

export function ActivityFeed() {
  const t = useTranslations("dashboard.activity");
  const { events, isLoading } = useActivityFeed();

  return (
    <Card className="relative overflow-hidden border-white/10 bg-white/[0.02] p-6 shadow-xl">
      {/* Background glow */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-emerald-500/5 blur-3xl" />

      <div className="relative">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white">{t("title")}</h3>
            <p className="mt-0.5 text-xs text-white/50">{t("subtitle")}</p>
          </div>
          {events.length > 0 && (
            <button
              type="button"
              className="text-xs font-medium text-emerald-400 transition-colors hover:text-emerald-300"
            >
              {t("viewAll")}
            </button>
          )}
        </div>

        {/* Loading skeleton */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-lg bg-white/[0.02]"
              />
            ))}
          </div>
        ) : events.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
              <Calendar className="h-5 w-5 text-white/30" />
            </div>
            <p className="text-xs text-white/40">{t("empty")}</p>
          </div>
        ) : (
          /* Events list */
          <div className="-mx-2 max-h-96 space-y-1 overflow-y-auto pr-1">
            {events.map((event, i) => (
              <ActivityRow
                key={event.id}
                event={event}
                index={i}
                t={t}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// ============================================================
// ===================== Event Row ============================
// ============================================================

function ActivityRow({
  event,
  index,
  t,
}: {
  event: ActivityEvent;
  index: number;
  t: (key: string, vars?: Record<string, any>) => string;
}) {
  const config = typeConfig[event.type];
  const Icon = config.icon;

  // Format amount with sign
  const amountUsd = formatUsd(event.amount);

  // Format description based on event type
  const description = (() => {
    switch (event.type) {
      case "deposit":
        return t("descriptions.deposit", { amount: amountUsd });
      case "withdraw":
        return t("descriptions.withdraw", { amount: amountUsd });
      case "deduction":
        return t("descriptions.deduction", { amount: amountUsd });
      case "win":
        return t("descriptions.win", {
          drawType: t(`drawTypes.${event.drawType || "regular"}`),
        });
      case "lockDrip":
        return t("descriptions.lockDrip", { amount: amountUsd });
      case "sync":
        return t("descriptions.sync");
      default:
        return "";
    }
  })();

  // Format relative time
  const timeKey = getRelativeTimeKey(event.timestamp);
  const timeLabel = t(`timestamps.${timeKey.key}`, timeKey.vars);

  // Type label
  const typeLabel = t(`types.${event.type}`);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.4) }}
      className="group flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-white/[0.02]"
    >
      {/* Icon */}
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.bg} ${config.fg} ring-1 ${config.ring}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Description */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-white/80">
            {typeLabel}
          </span>
          {!event.confirmed && (
            <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-300">
              {t("statuses.pending")}
            </span>
          )}
        </div>
        <div className="truncate text-xs text-white/50">{description}</div>
      </div>

      {/* Amount + time */}
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        {event.amount > 0n && (
          <span className={`text-xs font-mono font-semibold ${config.fg}`}>
            {config.sign}
            {amountUsd}
          </span>
        )}
        <span className="text-[10px] text-white/40">{timeLabel}</span>
      </div>
    </motion.div>
  );
}
