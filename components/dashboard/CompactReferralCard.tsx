"use client";

import { useAccount } from "wagmi";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Copy, Check, Share2, Users, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";

export function CompactReferralCard() {
  const t = useTranslations("dashboard.referral");
  const { address } = useAccount();
  const [copied, setCopied] = useState(false);
  const [referralLink, setReferralLink] = useState("");

  useEffect(() => {
    if (address && typeof window !== "undefined") {
      const origin = window.location.origin;
      setReferralLink(`${origin}/?ref=${address}`);
    }
  }, [address]);

  const handleCopy = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  };

  const handleShare = async () => {
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
      handleCopy();
    }
  };

  if (!address) return null;

  return (
    <Card className="border-emerald-500/30 bg-emerald-500/[0.05] p-4 shadow-lg">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
        {/* Icon + Label */}
        <div className="flex items-center gap-1.5 text-emerald-300 shrink-0">
          <Gift className="h-4 w-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">
            {t("yourLink")}
          </span>
        </div>

        {/* Link input */}
        <input
          type="text"
          readOnly
          value={referralLink}
          onClick={(e) => (e.target as HTMLInputElement).select()}
          className="h-9 flex-1 min-w-0 rounded-md border border-white/10 bg-black/30 px-2 text-[11px] text-white/60 font-mono truncate sm:text-xs"
        />

        {/* Copy button */}
        <Button
          onClick={handleCopy}
          size="sm"
          className="h-9 shrink-0 gap-1 rounded-md bg-emerald-500 px-3 text-xs font-bold text-black hover:bg-emerald-400"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("copied")}</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("copy")}</span>
            </>
          )}
        </Button>

        {/* Share button */}
        <Button
          onClick={handleShare}
          size="sm"
          className="h-9 shrink-0 gap-1 rounded-md bg-blue-500 px-3 text-xs font-bold text-white hover:bg-blue-400"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t("share")}</span>
        </Button>
      </div>

      {/* Stats row - shows invited/active/earned */}
      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/5 pt-3">
        <div className="text-center">
          <div className="mb-0.5 flex items-center justify-center gap-1 text-[9px] font-medium uppercase tracking-wider text-white/40">
            <Users className="h-3 w-3" />
            {t("invited")}
          </div>
          <div className="text-sm font-bold text-white">0</div>
        </div>
        <div className="text-center">
          <div className="mb-0.5 flex items-center justify-center gap-1 text-[9px] font-medium uppercase tracking-wider text-white/40">
            <Check className="h-3 w-3" />
            {t("active")}
          </div>
          <div className="text-sm font-bold text-white">0</div>
        </div>
        <div className="text-center">
          <div className="mb-0.5 flex items-center justify-center gap-1 text-[9px] font-medium uppercase tracking-wider text-white/40">
            <TrendingUp className="h-3 w-3" />
            {t("earned")}
          </div>
          <div className="text-sm font-bold text-white">$0</div>
        </div>
      </div>
    </Card>
  );
}
