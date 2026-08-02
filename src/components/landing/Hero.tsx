"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { useDashboardData, formatUsd, formatUsdCompact } from "@/hooks/useLottery";

export function Hero() {
  const t = useTranslations("hero");
  const data = useDashboardData();

  // Real values from contract
  const livePoolValue = data.currentPool > 0n ? formatUsd(data.currentPool) : "$0";
  const activeUsersValue = Number(data.activeUserCount).toLocaleString();
    const yieldValue = "$0";

  const scrollToHowItWorks = () => {
    const el = document.getElementById("how-it-works");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pb-28 lg:pt-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-300 sm:text-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {t("badge")}
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
          >
            {t("titleLine1")}{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              {t("titleLine2")}
            </span>{" "}
            {t("titleLine3")}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-base text-white/60 sm:text-lg md:text-xl"
          >
            {t("subtitle")}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button
              asChild
              size="lg"
              className="h-12 gap-2 rounded-full bg-emerald-500 px-8 text-base font-semibold text-black shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/50 sm:h-14 sm:px-10"
            >
              <Link href="/dashboard">
                {t("ctaPrimary")}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </Button>
            <Button
              onClick={scrollToHowItWorks}
              size="lg"
              variant="ghost"
              className="h-12 gap-2 rounded-full border border-white/20 px-8 text-base font-medium text-white/80 transition-all hover:bg-white/5 hover:text-white sm:h-14 sm:px-10"
            >
              {t("ctaSecondary")}
            </Button>
          </motion.div>

          {/* Min deposit note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 text-xs text-white/40 sm:text-sm"
          >
            {t("minDepositNote")}
          </motion.p>
        </div>

        {/* Live Stats Card - REAL DATA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mx-auto mt-16 max-w-4xl"
        >
          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:grid-cols-3 sm:p-8">
            <LiveStat
              icon={<TrendingUp className="h-5 w-5 text-emerald-400" />}
              label={t("livePoolLabel")}
              value={livePoolValue}
              sub={t("livePoolTarget")}
              accent
            />
            <LiveStat
              icon={<Users className="h-5 w-5 text-blue-400" />}
              label={t("activeUsersLabel")}
              value={activeUsersValue}
            />
            <LiveStat
              icon={<ShieldCheck className="h-5 w-5 text-purple-400" />}
              label={t("yieldLabel")}
              value={yieldValue}
            />
          </div>

          {/* Trust line */}
          <p className="mt-6 text-center text-xs text-white/40">
            {t("trustLine")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function LiveStat({
  icon,
  label,
  value,
  sub,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-4">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
          accent
            ? "bg-emerald-500/15 ring-1 ring-emerald-500/30"
            : "bg-white/5 ring-1 ring-white/10"
        }`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs font-medium uppercase tracking-wider text-white/40">
          {label}
        </div>
        <div
          className={`mt-0.5 text-xl font-bold tracking-tight sm:text-2xl ${
            accent ? "text-emerald-400" : "text-white"
          }`}
        >
          {value}
        </div>
        {sub && (
          <div className="mt-0.5 text-[10px] text-white/30 sm:text-xs">
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}
