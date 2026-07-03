"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { WalletButton } from "@/components/web3/WalletButton";
import { Wallet, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export function WalletNotConnected() {
  const t = useTranslations("dashboard");

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 shadow-xl shadow-emerald-500/10"
      >
        <Wallet className="h-10 w-10 text-emerald-400" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-3 text-2xl font-bold text-white sm:text-3xl"
      >
        {t("walletNotConnected")}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8 max-w-md text-sm leading-relaxed text-white/60 sm:text-base"
      >
        {t("walletNotConnectedDesc")}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col items-center gap-4 sm:flex-row"
      >
        <WalletButton />
        <Button
          asChild
          variant="ghost"
          className="gap-2 rounded-full px-5 text-sm text-white/60 hover:text-white"
        >
          <Link href="/">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {t("backHome")}
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
