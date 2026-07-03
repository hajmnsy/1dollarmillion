import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // Only English and Arabic are supported at MVP — removing the stub
  // locales (es, fr, pt, tr, id, vi) that were never properly translated.
  locales: ["en", "ar"],

  // Default locale used when no prefix is present
  defaultLocale: "en",

  // Always show locale prefix — better for SEO and consistent URLs
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
