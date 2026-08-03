"use client";

import { useAccount } from "wagmi";
import { useTranslations, useLocale } from "next-intl";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Copy, Check, Share2, Users, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";

// Multi-language share messages
const SHARE_MESSAGES: Record<string, string> = {
  ar: "🎯 تخيل يانصيب لا تخسر فيه أبداً!\n💰 أودع $1 فقط، ابقَ نشطاً بـ $1/يوم، واربح $1,000,000\n🛡️ رأس مالك محمي 100%\n🎁 استخدم رابطي واحصل على +5 أيام نشطة مجانية:\n",
  en: "🎯 Imagine a lottery where you never lose!\n💰 Deposit just $1, stay active for $1/day, and win $1,000,000\n🛡️ Your principal is 100% protected\n🎁 Use my link and get +5 free active days:\n",
  es: "🎯 ¡Imagina una lotería donde nunca pierdes!\n💰 Deposita solo $1, mantente activo por $1/día, y gana $1,000,000\n🛡️ Tu capital está 100% protegido\n🎁 Usa mi enlace y obtén +5 días activos gratis:\n",
  fr: "🎯 Imaginez une loterie où vous ne perdez jamais!\n💰 Déposez juste $1, restez actif pour $1/jour, et gagnez $1,000,000\n🛡️ Votre capital est 100% protégé\n🎁 Utilisez mon lien et obtenez +5 jours actifs gratuits:\n",
  zh: "🎯 想象一个你永远不会输的彩票！\n💰 只需存入$1，每天$1保持活跃，赢取$1,000,000\n🛡️ 你的本金100%受保护\n🎁 使用我的链接，获得+5天免费活跃天数：\n",
  hi: "🎯 कल्पना करें ऐसा लॉटरी जहाँ आप कभी नहीं हारते!\n💰 केवल $1 जमा करें, $1/दिन सक्रिय रहें, और $1,000,000 जीतें\n🛡️ आपका मूलधन 100% सुरक्षित है\n🎁 मेरा लिंक उपयोग करें और +5 मुफ्त सक्रिय दिन पाएं:\n",
  ru: "🎯 Представьте лотерею, где вы никогда не проигрываете!\n💰 Внесите всего $1, оставайтесь активным за $1/день, и выиграйте $1,000,000\n🛡️ Ваш капитал защищен на 100%\n🎁 Используйте мою ссылку и получите +5 бесплатных активных дней:\n",
  pt: "🎯 Imagine uma loteria onde você nunca perde!\n💰 Deposite apenas $1, fique ativo por $1/dia, e ganhe $1,000,000\n🛡️ Seu capital está 100% protegido\n🎁 Use meu link e ganhe +5 dias ativos gratuitos:\n",
  tr: "🎯 Hiç kaybetmediğiniz bir piyango hayal edin!\n💰 Sadece $1 yatırın, $1/gün aktif kalın ve $1,000,000 kazanın\n🛡️ Anaparanız %100 korunuyor\n🎁 Linkimi kullanın ve +5 bedava aktif gün kazanın:\n",
  fa: "🎯 تصور کنید بخت‌آزمایی که در آن هرگز نمی‌بازید!\n💰 فقط $1 واریز کنید، با $1/روز فعال بمانید، و $1,000,000 ببرید\n🛡️ اصل سرمایه شما 100% محافظت می‌شود\n🎁 از لینک من استفاده کنید و +5 روز فعال رایگان دریافت کنید:\n",
  de: "🎯 Stellen Sie sich ein Lotterie vor, bei der Sie nie verlieren!\n💰 Zahlen Sie nur $1 ein, bleiben Sie für $1/Tag aktiv, und gewinnen Sie $1,000,000\n🛡️ Ihr Kapital ist zu 100% geschützt\n🎁 Verwenden Sie meinen Link und erhalten Sie +5 kostenlose aktive Tage:\n",
};

/**
 * CompactReferralCard — small referral card for the top of dashboard.
 * Shows only: referral link + copy/share buttons.
 */
export function CompactReferralCard() {
  const t = useTranslations("dashboard.referral");
  const locale = useLocale();
  const { address } = useAccount();
  const [copied, setCopied] = useState(false);
  const [referralLink, setReferralLink] = useState("");

  useEffect(() => {
    if (address && typeof window !== "undefined") {
      const origin = window.location.origin;
      setReferralLink(`${origin}/${locale}/?ref=${address}`);
    }
  }, [address, locale]);

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
    // Get the share message in the user's language, fallback to English
    const messagePrefix = SHARE_MESSAGES[locale] || SHARE_MESSAGES.en;
    const shareText = `${messagePrefix}${referralLink}`;
    
    // Always copy the full message to clipboard first
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.error("Copy failed:", e);
    }
    
    // Then try to open native share dialog
    if (navigator.share) {
      try {
        await navigator.share({
          title: "1DollarMillion — No-Loss Lottery",
          text: shareText,
          url: referralLink,
        });
      } catch (e) {
        console.log("Share cancelled");
      }
    }
  };

  if (!address) {
    return null;
  }

  return (
    <Card className="border-emerald-500/30 bg-emerald-500/[0.05] p-4 shadow-lg">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
        <div className="flex items-center gap-1.5 text-emerald-300 shrink-0">
          <Gift className="h-4 w-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">
            {t("yourLink")}
          </span>
        </div>

        <input
          type="text"
          readOnly
          value={referralLink}
          onClick={(e) => (e.target as HTMLInputElement).select()}
          className="h-9 flex-1 min-w-0 rounded-md border border-white/10 bg-black/30 px-2 text-[11px] text-white/60 font-mono truncate sm:text-xs"
        />

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

        <Button
          onClick={handleShare}
          size="sm"
          className="h-9 shrink-0 gap-1 rounded-md bg-blue-500 px-3 text-xs font-bold text-white hover:bg-blue-400"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t("share")}</span>
        </Button>
      </div>

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
