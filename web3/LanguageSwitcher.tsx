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

const localeLabels: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
  es: "Español",
  fr: "Français",
  zh: "中文",
  hi: "हिन्दी",
  ru: "Русский",
  pt: "Português",
};

const localeFlags: Record<Locale, string> = {
  en: "🇬🇧",
  ar: "🇸🇦",
  es: "🇪🇸",
  fr: "🇫🇷",
  zh: "🇨🇳",
  hi: "🇮🇳",
  ru: "🇷🇺",
  pt: "🇵🇹",
};

// RTL locales
const rtlLocales: Locale[] = ["ar"];

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale as Locale });
  };

  return (
    <Select value={locale} onValueChange={handleChange}>
      <SelectTrigger
        className="w-auto gap-2 rounded-full border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 hover:text-white"
        aria-label="Language"
      >
        <Globe className="h-3.5 w-3.5" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="min-w-[160px] max-h-[300px]">
        {routing.locales.map((l) => (
          <SelectItem key={l} value={l} className="text-sm">
            <span className="me-2">{localeFlags[l]}</span>
            {localeLabels[l]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { rtlLocales };
