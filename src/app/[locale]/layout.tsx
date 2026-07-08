import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getMessages, setRequestLocale } from "next-intl/server";
import { getBodyClassName, fontVariables } from "@/lib/fonts";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Provide all messages to the client
  const messages = await getMessages();

  // Detect RTL for Arabic (other locales are LTR)
  const isRTL = locale === "ar";
  const dir = isRTL ? "rtl" : "ltr";

  // Use Cairo font for Arabic, Geist Sans/Mono for all other locales
  const bodyClassName = isRTL
    ? `${fontVariables} font-cairo antialiased`
    : `${fontVariables} font-sans antialiased`;

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className={`${bodyClassName} bg-[#0a0a0a] text-white min-h-screen`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
