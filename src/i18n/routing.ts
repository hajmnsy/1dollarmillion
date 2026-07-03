import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // All locales supported by the platform
  locales: ["en", "ar", "es", "fr", "pt", "tr", "id", "vi"],

  // Default locale used when no prefix is present
  defaultLocale: "en",

  // Always show locale prefix — better for SEO and consistent URLs
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
