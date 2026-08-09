"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Users, Gift, TrendingUp, Share2, Check, Award } from "lucide-react";
import { Link } from "@/i18n/navigation";

export function ReferralSection() {
  const t = useTranslations("referral");

  const benefits = [
    {
      icon: <Gift className="h-6 w-6 text-emerald-400" />,
      title: t("benefit1Title"),
      desc: t("benefit1Desc"),
      value: t("benefit1Value"),
    },
    {
      icon: <Users className="h-6 w-6 text-blue-400" />,
      title: t("benefit2Title"),
      desc: t("benefit2Desc"),
      value: t("benefit2Value"),
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-purple-400" />,
      title: t("benefit3Title"),
      desc: t("benefit3Desc"),
      value: t("benefit3Value"),
    },
  ];

  const steps = [
    { num: "1", title: t("step1Title"), desc: t("step1Desc") },
    { num: "2", title: t("step2Title"), desc: t("step2Desc") },
    { num: "3", title: t("step3Title"), desc: t("step3Desc") },
  ];

  return (
    <section className="relative py-20 sm:py-28" id="referral">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-0 h-[400px] w-[600px] rounded-full bg-emerald-500/8 blur-[120px]" />
        <div className="absolute bottom-1/4 left-0 h-[300px] w-[500px] rounded-full bg-purple-500/8 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300"
          >
            <Share2 className="h-3.5 w-3.5" />
            {t("badge")}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl"
          >
            {t("title")}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-base text-white/60 sm:text-lg"
          >
            {t("subtitle")}
          </motion.p>
        </div>

        {/* Benefits grid */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {benefits.map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-xl transition-all hover:bg-white/[0.04] sm:p-7"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                {benefit.icon}
              </div>
              <h3 className="mb-2 text-lg font-bold text-white">
                {benefit.title}
              </h3>
              <p className="text-sm leading-relaxed text-white/60">
                {benefit.desc}
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                <Check className="h-3 w-3" />
                {benefit.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-8 sm:p-12"
        >
          <h3 className="mb-8 text-center text-2xl font-bold text-white sm:text-3xl">
            {t("howItWorksTitle")}
          </h3>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-xl font-bold text-black shadow-lg shadow-emerald-500/30">
                  {step.num}
                </div>
                <h4 className="mb-2 text-base font-bold text-white">
                  {step.title}
                </h4>
                <p className="text-sm leading-relaxed text-white/60">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Reward highlight */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.05] p-6 text-center sm:flex-row sm:text-left"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20">
              <Award className="h-7 w-7 text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">
                {t("rewardValue")}
              </div>
              <p className="mt-1 text-sm text-white/70">
                {t("rewardDesc")}
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* CTA - links directly to referral card in dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 text-center"
        >
          <Link
            href="/dashboard#referral-card"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-3.5 text-sm font-bold text-black shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/40"
          >
            <Share2 className="h-4 w-4" />
            {t("ctaButton")}
          </Link>
          <p className="mt-4 text-xs text-white/40">
            {t("ctaNote")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
