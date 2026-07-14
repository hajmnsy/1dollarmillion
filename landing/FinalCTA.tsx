"use client";

import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Unlock, Wallet } from "lucide-react";

export function FinalCTA() {
  const t = useTranslations("finalCta");
  const locale = useLocale();

  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-8 text-center shadow-2xl shadow-emerald-500/10 sm:p-12 lg:p-16"
        >
          {/* Background glow */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-20 left-1/2 h-60 w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[100px]" />
          </div>

          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              {t("title")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-white/70 sm:text-lg">
              {t("subtitle")}
            </p>

            <div className="mt-8 flex justify-center">
              <Button
                asChild
                size="lg"
                className="group h-14 rounded-full bg-emerald-500 px-10 text-base font-semibold text-black shadow-xl shadow-emerald-500/30 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/50"
              >
                <Link href="/dashboard" className="inline-flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  {t("button")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                </Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/60">
              <div className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>
                  {locale === "ar"
                    ? "رأس المال محمي 100%"
                    : "100% principal protected"}
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5">
                <Unlock className="h-3.5 w-3.5 text-emerald-400" />
                <span>{locale === "ar" ? "بلا قيد" : "No lock-up"}</span>
              </div>
              <div className="inline-flex items-center gap-1.5">
                <Wallet className="h-3.5 w-3.5 text-emerald-400" />
                <span>
                  {locale === "ar" ? "سحب في أي وقت" : "Withdraw anytime"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
