"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Wallet, Calendar, Trophy, Gift } from "lucide-react";

export function HowItWorks() {
  const t = useTranslations("howItWorks");

  const steps = [
    {
      icon: <Wallet className="h-6 w-6" />,
      title: t("step1Title"),
      description: t("step1Description"),
      number: "01",
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: t("step2Title"),
      description: t("step2Description"),
      number: "02",
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      title: t("step3Title"),
      description: t("step3Description"),
      number: "03",
    },
  ];

  return (
    <section className="relative py-20 sm:py-28" id="how-it-works">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-base text-white/60 sm:text-lg">
            {t("subtitle")}
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all hover:border-emerald-500/30 hover:bg-white/[0.04] sm:p-8"
            >
              {/* Number watermark */}
              <span className="pointer-events-none absolute -top-4 -right-2 text-7xl font-bold text-white/[0.04] transition-colors group-hover:text-emerald-500/10">
                {step.number}
              </span>

              {/* Icon */}
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                {step.icon}
              </div>

              <h3 className="mb-3 text-xl font-bold text-white">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-white/60">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bonus draw callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent p-6 sm:p-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/30">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-purple-500/20 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-purple-300">
                {t("bonusBadge")}
              </div>
              <h3 className="mb-2 text-xl font-bold text-white sm:text-2xl">
                {t("bonusTitle")}
              </h3>
              <p className="text-sm leading-relaxed text-white/60 sm:text-base">
                {t("bonusDescription")}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
