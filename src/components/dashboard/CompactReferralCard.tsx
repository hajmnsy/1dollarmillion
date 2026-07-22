"use client";

import { useAccount } from "wagmi";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Copy, Check, Share2 } from "lucide-react";
import { useState, useEffect } from "react";

/**
 * CompactReferralCard — small referral card for the top of dashboard.
 * Shows only: referral link + copy/share buttons.
 */
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

  if (!address) {
    return null;
  }

  return (
    <Card className="border-emerald-500/30 bg-emerald-500/[0.05] p-3 shadow-lg">
      <div className="flex items-center gap-2">
        {/* Icon + Label */}
        <div className="flex items-center gap-1.5 text-emerald-300">
          <Gift className="h-4 w-4" />
          <span className="hidden text-[10px] font-bold uppercase tracking-wider sm:inline">
            {t("yourLink")}
          </span>
        </div>

        {/* Link input */}
        <input
          type="text"
          readOnly
          value={referralLink}
          onClick={(e) => (e.target as HTMLInputElement).select()}
          className="h-8 flex-1 min-w-0 rounded-md border border-white/10 bg-black/30 px-2 text-[10px] text-white/60 font-mono truncate sm:text-xs"
        />

        {/* Copy button */}
        <Button
          onClick={handleCopy}
          size="sm"
          className="h-8 shrink-0 gap-1 rounded-md bg-emerald-500 px-2 text-[10px] font-bold text-black hover:bg-emerald-400 sm:px-3 sm:text-xs"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              <span className="hidden sm:inline">{t("copied")}</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span className="hidden sm:inline">{t("copy")}</span>
            </>
          )}
        </Button>

        {/* Share button */}
        <Button
          onClick={handleShare}
          size="sm"
          className="h-8 shrink-0 gap-1 rounded-md bg-blue-500 px-2 text-[10px] font-bold text-white hover:bg-blue-400 sm:px-3 sm:text-xs"
        >
          <Share2 className="h-3 w-3" />
          <span className="hidden sm:inline">{t("share")}</span>
        </Button>
      </div>
    </Card>
  );
}
