"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";

const localeLabels: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
  es: "Español",
  fr: "Français",
  pt: "Português",
  tr: "Türkçe",
  id: "Bahasa Indonesia",
  vi: "Tiếng Việt",
};

const localeFlags: Record<Locale, string> = {
  en: "🇬🇧",
  ar: "🇸🇦",
  es: "🇪🇸",
  fr: "🇫🇷",
  pt: "🇵🇹",
  tr: "🇹🇷",
  id: "🇮🇩",
  vi: "🇻🇳",
};

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("languageSwitcher");

  const handleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale as Locale });
  };

  return (
    <Select value={locale} onValueChange={handleChange}>
      <SelectTrigger
        className="w-auto gap-2 rounded-full border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 hover:text-white"
        aria-label={t("label")}
      >
        <Globe className="h-3.5 w-3.5" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="min-w-[140px]">
        {routing.locales.map((l) => (
          <SelectItem key={l} value={l} className="text-sm">
            <span className="mr-2">{localeFlags[l]}</span>
            {localeLabels[l]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
