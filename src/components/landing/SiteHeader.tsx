"use client";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { WalletButton } from "@/components/web3/WalletButton";
import { LanguageSwitcher } from "@/components/web3/LanguageSwitcher";
import { Sparkles } from "lucide-react";

export function SiteHeader() {
  const t = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();

  // Smooth scroll to a section ID. If not on homepage, navigate there first.
  const scrollToSection = (sectionId: string) => {
    const isHome = pathname === "/";
    if (isHome) {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      router.push("/");
      // Wait for navigation, then scroll
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 600);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
            <Sparkles className="h-5 w-5 text-black" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            HybridRoSCA
          </span>
        </Link>

        {/* Desktop nav — mix of scroll + route links */}
        <nav className="hidden items-center gap-8 md:flex">
          <button
            type="button"
            onClick={() => scrollToSection("how-it-works")}
            className="text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            {t("howItWorks")}
          </button>
          <Link
            href="/transparency"
            className="text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            {t("transparency")}
          </Link>
          <Link
            href="/winners"
            className="text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            {t("winners")}
          </Link>
          <Link
            href="/faq"
            className="text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            {t("faq")}
          </Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
