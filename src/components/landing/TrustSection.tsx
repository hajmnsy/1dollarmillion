"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ShieldCheck, Layers, Lock, FileSearch } from "lucide-react";

export function TrustSection() {
  const t = useTranslations("trust");

  const items = [
    {
      icon: <Layers className="h-7 w-7" />,
      title: t("chainlinkTitle"),
      desc: t("chainlinkDesc"),
      badge: "VRF v2",
    },
    {
      icon: <ShieldCheck className="h-7 w-7" />,
      title: t("aaveTitle"),
      desc: t("aaveDesc"),
      badge: "$12B+ TVL",
    },
    {
      icon: <Lock className="h-7 w-7" />,
      title: t("openzeppelinTitle"),
      desc: t("openzeppelinDesc"),
      badge: "Battle-tested",
    },
    {
      icon: <FileSearch className="h-7 w-7" />,
      title: t("auditTitle"),
      desc: t("auditDesc"),
      badge: "Open Source",
    },
  ];

  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-base text-white/60 sm:text-lg">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex items-start gap-5 rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all hover:border-white/20 hover:bg-white/[0.04] sm:p-7"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-white/10 to-white/5 text-emerald-400 ring-1 ring-white/10">
                {item.icon}
              </div>
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-300 ring-1 ring-emerald-500/20">
                    {item.badge}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-white/60">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
