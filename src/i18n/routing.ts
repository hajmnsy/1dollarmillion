import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // 8 supported locales — covers ~70% of global Web3 users
  locales: ["en", "ar", "es", "fr", "zh", "hi", "ru", "pt"],

  // Default locale used when no prefix is present
  defaultLocale: "en",

  // Always show locale prefix — better for SEO and consistent URLs
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
