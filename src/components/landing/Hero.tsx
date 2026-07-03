"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, TrendingUp, Users } from "lucide-react";

export function Hero() {
  const t = useTranslations("hero");

  // Smooth-scroll to the How It Works section on the same page
  const scrollToHowItWorks = () => {
    const el = document.getElementById("how-it-works");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[120px]" />
        <div className="absolute top-20 -right-40 h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-[100px]" />
        <div className="absolute top-40 -left-40 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-300"
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
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
          >
            <span className="block">{t("titleLine1")}</span>
            <span className="block bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-500 bg-clip-text text-transparent">
              {t("titleLine2")}
            </span>
            <span className="block text-white/90">{t("titleLine3")}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg md:text-xl"
          >
            {t("subtitle")}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
          >
            <Button
              asChild
              size="lg"
              className="group h-12 w-full rounded-full bg-emerald-500 px-8 text-base font-semibold text-black shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/50 sm:w-auto"
            >
              <Link href="/dashboard" className="inline-flex items-center gap-2">
                {t("ctaPrimary")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </Link>
            </Button>
            <Button
              onClick={scrollToHowItWorks}
              size="lg"
              variant="outline"
              className="h-12 w-full rounded-full border-white/20 bg-white/5 px-8 text-base font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white sm:w-auto"
            >
              {t("ctaSecondary")}
            </Button>
          </motion.div>

          {/* Min deposit note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-4 text-xs text-white/50"
          >
            {t("minDepositNote")}
          </motion.p>
        </div>

        {/* Live Stats Card */}
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
              value={t("livePoolValue")}
              sub={t("livePoolTarget")}
              accent
            />
            <LiveStat
              icon={<Users className="h-5 w-5 text-blue-400" />}
              label={t("activeUsersLabel")}
              value={t("activeUsersValue")}
            />
            <LiveStat
              icon={<ShieldCheck className="h-5 w-5 text-purple-400" />}
              label={t("yieldLabel")}
              value={t("yieldValue")}
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
    <div className="flex flex-col items-center text-center sm:items-start sm:text-start">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider text-white/50">
          {label}
        </span>
      </div>
      <div
        className={`text-2xl font-bold tracking-tight sm:text-3xl ${
          accent ? "text-emerald-400" : "text-white"
        }`}
      >
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-white/40">{sub}</div>}
    </div>
  );
}
