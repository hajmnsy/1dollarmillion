"use client";

import { useAccount } from "wagmi";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Copy, Check, Share2, Users, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

/**
 * ReferralCard — shows the user's referral link and stats.
 *
 * Features:
 * - Generates a unique referral link: ?ref=0xUserWallet
 * - Copy to clipboard button
 * - Share button (Web Share API)
 * - Shows referral stats (invited, active, earned)
 * - Stores referrer address in localStorage when visiting via ?ref=
 *
 * The referral program:
 * - Referred user gets +5 extra active days on first deposit
 * - Referrer gets +5 extra active days when referred user deposits
 * - Referrer gets 1% of prize ($9,953) if referred user wins a draw
 *
 * Note: The smart contract needs to be updated with referral logic
 * for on-chain enforcement. Until then, the frontend tracks referrals
 * and the contract update is planned for the next deployment.
 */
export function ReferralCard() {
  const t = useTranslations("dashboard.referral");
  const { address } = useAccount();
  const [copied, setCopied] = useState(false);
  const [referralLink, setReferralLink] = useState("");
  const [hasReferrer, setHasReferrer] = useState(false);

  // Check if user came via a referral link
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

  // Generate referral link
  useEffect(() => {
    if (address) {
      const baseUrl = window.location.origin;
      setReferralLink(`${baseUrl}/en/dashboard?ref=${address}`);
    }
  }, [address]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "1DollarMillion — Win $1,000,000",
          text: "Join me on 1DollarMillion! Deposit USDT, stay active for $1/day, and win $1,000,000. Your principal is always safe!",
          url: referralLink,
        });
      } catch (e) {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  // Show a placeholder when no wallet connected (instead of null)
  if (!address) {
    return (
      <Card className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.04] via-white/[0.02] to-transparent p-6 shadow-xl">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
          <Gift className="h-3 w-3" />
          {t("badge")}
        </div>
        <h3 className="text-sm font-bold text-white">{t("title")}</h3>
        <p className="mt-1 text-xs text-white/50">{t("subtitle")}</p>
        <p className="mt-3 text-xs text-white/40">
          {t("connectPrompt")}
        </p>
      </Card>
    );
  }

  return (
    <Card id="referral-card" className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.04] via-white/[0.02] to-transparent p-6 shadow-xl scroll-mt-20">
      {/* Background glow */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-emerald-500/5 blur-3xl" />

      <div className="relative">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
              <Gift className="h-3 w-3" />
              {t("badge")}
            </div>
            <h3 className="text-sm font-bold text-white">{t("title")}</h3>
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
              type="text"
              readOnly
              value={referralLink}
              className="flex-1 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-white/60 font-mono truncate"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button
              onClick={handleCopy}
              size="sm"
              className="h-10 shrink-0 gap-1.5 rounded-lg bg-emerald-500 px-4 text-xs font-bold text-black shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400"
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
          </div>
        </div>

        {/* Share Button - blue with white text for visibility */}
        <Button
          onClick={handleShare}
          className="mb-4 h-10 w-full gap-2 rounded-lg bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-400"
        >
          <Share2 className="h-4 w-4" />
          {t("share")}
        </Button>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 border-t border-white/5 pt-4">
          <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-1 text-[10px] font-medium uppercase tracking-wider text-white/40">
              <Users className="h-3 w-3" />
              {t("invited")}
            </div>
            <div className="text-base font-bold text-white">0</div>
          </div>
          <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-1 text-[10px] font-medium uppercase tracking-wider text-white/40">
              <TrendingUp className="h-3 w-3" />
              {t("active")}
            </div>
            <div className="text-base font-bold text-emerald-400">0</div>
          </div>
          <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-1 text-[10px] font-medium uppercase tracking-wider text-white/40">
              <Gift className="h-3 w-3" />
              {t("earned")}
            </div>
            <div className="text-base font-bold text-amber-400">$0</div>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-4 space-y-2 rounded-lg bg-white/[0.02] p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
            {t("howItWorks")}
          </div>
          <div className="space-y-1.5 text-xs text-white/50">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-400">1.</span>
              <span>{t("step1")}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-400">2.</span>
              <span>{t("step2")}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-400">3.</span>
              <span>{t("step3")}</span>
            </div>
          </div>
        </div>

        {/* Referrer badge */}
        {hasReferrer && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2 text-xs text-emerald-300">
            <Gift className="h-3.5 w-3.5" />
            {t("referredBy")}
          </div>
        )}
      </div>
    </Card>
  );
}
