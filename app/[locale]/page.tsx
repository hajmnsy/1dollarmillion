import { setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { TransparencySection } from "@/components/landing/TransparencySection";
import { ReferralSection } from "@/components/landing/ReferralSection";
import { TrustSection } from "@/components/landing/TrustSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { SiteFooter } from "@/components/landing/SiteFooter";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LandingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a]">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <TransparencySection />
        <ReferralSection />
        <TrustSection />
        <FinalCTA />
      </main>
      <SiteFooter />
    </div>
  );
}
