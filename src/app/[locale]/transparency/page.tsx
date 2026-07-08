import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck, Code, TrendingUp } from "lucide-react";
import { PageAnimation } from "@/components/landing/PageAnimation";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function TransparencyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legalPages.transparency");
  const tCommon = await getTranslations("legalPages");

  const sections = [
    {
      icon: <Code className="h-6 w-6" />,
      title: t("contractTitle"),
      body: t("contractBody"),
    },
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      title: t("solvencyTitle"),
      body: t("solvencyBody"),
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: t("yieldTitle"),
      body: t("yieldBody"),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a]">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <PageAnimation>
            <div className="mb-8">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/15 to-blue-500/5 shadow-lg shadow-blue-500/10">
                <ShieldCheck className="h-7 w-7 text-blue-400" />
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
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                      {section.icon}
                    </div>
                    <h2 className="text-lg font-bold text-white">
                      {section.title}
                    </h2>
                  </div>
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
