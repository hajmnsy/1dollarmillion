import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { PageAnimation } from "@/components/landing/PageAnimation";

type Props = {
  params: Promise<{ locale: string }>;
  pageKey: "faq" | "terms" | "privacy" | "risk";
};

export async function LegalPage({ params, pageKey }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations(`legalPages.${pageKey}`);
  const tCommon = await getTranslations("legalPages");

  // For terms/privacy/risk, render 5 sections (section1Title through section5Body)
  const sections =
    pageKey === "terms" || pageKey === "privacy" || pageKey === "risk"
      ? [1, 2, 3, 4, 5].map((n) => ({
          title: t(`section${n}Title`),
          body: t(`section${n}Body`),
        }))
      : [];

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a]">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <PageAnimation>
            <div className="mb-8">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 shadow-lg shadow-emerald-500/10">
                <FileText className="h-7 w-7 text-emerald-400" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {t("title")}
              </h1>
              <p className="mt-2 text-base text-white/60">{t("subtitle")}</p>
            </div>
          </PageAnimation>

          <div className="space-y-6">
            {sections.map((section, i) => (
              <PageAnimation key={i} delay={0.05 * (i + 1)}>
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
                  <h2 className="mb-3 text-lg font-bold text-white">
                    {section.title}
                  </h2>
                  <p className="text-sm leading-relaxed text-white/60">
                    {section.body}
                  </p>
                </div>
              </PageAnimation>
            ))}
          </div>

          <div className="mt-8">
            <Button
              asChild
              variant="ghost"
              className="gap-2 rounded-full text-sm text-white/60 hover:text-white"
            >
              <Link href="/">
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                {tCommon("backHome")}
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
