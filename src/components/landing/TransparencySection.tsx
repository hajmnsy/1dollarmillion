"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ExternalLink, ShieldCheck } from "lucide-react";
import {
  POLYGONSCAN_CONTRACT_URL,
  AAVE_POOL_URL,
  CHAINLINK_VRF_URL,
} from "@/lib/contract/config";

export function TransparencySection() {
  const t = useTranslations("transparency");

  const cards = [
    {
      title: t("poolCardTitle"),
      desc: t("poolCardDesc"),
      value: "$847,231",
      progress: 84.7,
      color: "emerald" as const,
      link: t("viewOnEtherscan"),
      href: POLYGONSCAN_CONTRACT_URL,
    },
    {
      title: t("yieldCardTitle"),
      desc: t("yieldCardDesc"),
      value: "$23,402",
      progress: 2.3,
      color: "purple" as const,
      link: t("viewOnAave"),
      href: AAVE_POOL_URL,
    },
    {
      title: t("solvencyCardTitle"),
      desc: t("solvencyCardDesc"),
      value: t("solvencyHealthy"),
      progress: 100,
      color: "blue" as const,
      link: t("viewOnEtherscan"),
      href: POLYGONSCAN_CONTRACT_URL,
      isStatus: true,
    },
    {
      title: t("drawCardTitle"),
      desc: t("drawCardDesc"),
      value: "~4 days",
      progress: 85,
      color: "amber" as const,
      link: t("verifyVRF"),
      href: CHAINLINK_VRF_URL,
    },
  ];

  const colorClasses = {
    emerald: {
      text: "text-emerald-400",
      bar: "bg-emerald-500",
      glow: "shadow-emerald-500/20",
      ring: "ring-emerald-500/20",
    },
    purple: {
      text: "text-purple-400",
      bar: "bg-purple-500",
      glow: "shadow-purple-500/20",
      ring: "ring-purple-500/20",
    },
    blue: {
      text: "text-blue-400",
      bar: "bg-blue-500",
      glow: "shadow-blue-500/20",
      ring: "ring-blue-500/20",
    },
    amber: {
      text: "text-amber-400",
      bar: "bg-amber-500",
      glow: "shadow-amber-500/20",
      ring: "ring-amber-500/20",
    },
  };

  return (
    <section className="relative py-20 sm:py-28" id="transparency">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-base text-white/60 sm:text-lg">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6">
          {cards.map((card, i) => {
            const c = colorClasses[card.color];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-xl ${c.glow} ring-1 ${c.ring} transition-all hover:bg-white/[0.04] sm:p-7`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-white sm:text-lg">
                      {card.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-white/50 sm:text-sm">
                      {card.desc}
                    </p>
                  </div>
                  {card.isStatus && (
                    <div className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                      <ShieldCheck className="h-3 w-3" />
                    </div>
                  )}
                </div>

                <div className="mt-5">
                  <div
                    className={`text-3xl font-bold tracking-tight ${c.text} sm:text-4xl`}
                  >
                    {card.value}
                  </div>
                  {card.isStatus && (
                    <p className="mt-1 text-xs text-emerald-300/70">
                      {t("solvencyHealthyDesc")}
                    </p>
                  )}

                  <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${card.progress}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.2 + i * 0.1, ease: "easeOut" }}
                      className={`h-full rounded-full ${c.bar}`}
                    />
                  </div>

                  <a
                    href={card.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-xs text-white/40 transition-colors hover:text-white"
                  >
                    <span>{t("verifiableOn")}:</span>
                    <span className="inline-flex items-center gap-1 font-medium text-white/60 transition-colors group-hover:text-white">
                      {card.link}
                      <ExternalLink className="h-3 w-3" />
                    </span>
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA: View on Polygonscan (external link) */}
        <div className="mt-10 text-center">
          <a
            href={POLYGONSCAN_CONTRACT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
          >
            {t("viewOnEtherscan")}
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
