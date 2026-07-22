"use client";

import { useAccount } from "wagmi";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Copy, Check, Share2, Users, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function ReferralCard() {
  const t = useTranslations("dashboard.referral");
  const { address } = useAccount();
  const [copied, setCopied] = useState(false);
  const [referralLink, setReferralLink] = useState("");
  const [hasReferrer, setHasReferrer] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("ref");
    if (ref && ref.toLowerCase() !== address?.toLowerCase()) {
      localStorage.setItem("1dm_referrer", ref);
      setHasReferrer(true);
    } else {
      const stored = localStorage.getItem("1dm_referrer");
      setHasReferrer(!!stored);
    }
  }, [address]);

  useEffect(() => {
    if (address && typeof window !== "undefined") {
      const origin = window.location.origin;
      setReferralLink(`${origin}/?ref=${address}`);
    }
  }, [address]);

  const copyLink = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  };

  const shareLink = async () => {
    if (!referralLink) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "1DollarMillion — Win $1,000,000",
          text: "Join the no-loss lottery. Deposit USDT, win $1M. Use my referral link:",
          url: referralLink,
        });
      } catch (e) {
        console.log("Share cancelled");
      }
    } else {
      copyLink();
    }
  };

  if (!address) {
    return (
      <Card className="border-emerald-500/20 bg-emerald-500/[0.03] p-6">
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-emerald-400" />
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
            {t("badge")}
          </span>
        </div>
        <h3 className="mt-3 text-sm font-bold text-white">{t("title")}</h3>
        <p className="mt-0.5 text-xs text-white/50">{t("subtitle")}</p>
        <p className="mt-3 text-xs text-white/40">{t("connectPrompt")}</p>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.05] via-white/[0.02] to-transparent p-6 shadow-xl">
      <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-500/20">
              <Gift className="h-3 w-3" />
              {t("badge")}
            </div>
            <h3 className="text-lg font-bold text-white">{t("title")}</h3>
            <p className="mt-0.5 text-xs text-white/50">{t("subtitle")}</p>
          </div>
        </div>

        {/* Referral Link */}
        <div className="mb-4">
          <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-white/40">
            {t("yourLink")}
          </label>
          <div className="flex gap-2">
            <input
              readOnly
              value={referralLink}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="h-10 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 text-xs text-white/70 outline-none focus:border-emerald-500/50"
            />
            <Button
              onClick={copyLink}
              size="sm"
              className="h-10 gap-1.5 rounded-lg bg-emerald-500 px-3 text-xs font-semibold text-black hover:bg-emerald-400"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  {t("copied")}
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  {t("copy")}
                </>
              )}
            </Button>
            <Button
              onClick={shareLink}
              size="sm"
              variant="outline"
              className="h-10 gap-1.5 rounded-lg border-white/20 px-3 text-xs font-semibold text-white hover:bg-white/5"
            >
              <Share2 className="h-3.5 w-3.5" />
              {t("share")}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-4 grid grid-cols-3 gap-3 border-t border-white/5 pt-4">
          <Stat icon={<Users className="h-4 w-4 text-blue-400" />} label={t("invited")} value="0" />
          <Stat icon={<Check className="h-4 w-4 text-emerald-400" />} label={t("active")} value="0" />
          <Stat icon={<TrendingUp className="h-4 w-4 text-purple-400" />} label={t("earned")} value="$0" />
        </div>

        {/* How it works */}
        <div className="rounded-lg bg-white/[0.02] p-3">
          <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-white/40">
            {t("howItWorks")}
          </div>
          <div className="space-y-1.5 text-xs text-white/60">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[9px] font-bold text-emerald-300">1</span>
              <span>{t("step1")}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[9px] font-bold text-emerald-300">2</span>
              <span>{t("step2")}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[9px] font-bold text-emerald-300">3</span>
              <span>{t("step3")}</span>
            </div>
          </div>
        </div>

        {/* Referred by */}
        {hasReferrer && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-lg border border-blue-500/20 bg-blue-500/[0.05] p-2.5 text-xs text-blue-300"
          >
            {t("referredBy")} ✅
          </motion.div>
        )}
      </div>
    </Card>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="mb-1 flex items-center justify-center gap-1 text-[10px] font-medium uppercase tracking-wider text-white/40">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-base font-bold text-white">{value}</div>
    </div>
  );
}
