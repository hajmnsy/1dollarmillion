"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";

export function SiteFooter() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-white/5 bg-[#080808]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600">
                <Sparkles className="h-4 w-4 text-black" />
              </div>
              <span className="text-base font-bold text-white">HybridRoSCA</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-white/50">
              {t("tagline")}
            </p>
          </div>

          {/* Product */}
          <FooterColumn
            title={t("product")}
            links={[
              { label: t("productLinks.howItWorks"), href: "/how-it-works" },
              { label: t("productLinks.transparency"), href: "/transparency" },
              { label: t("productLinks.winners"), href: "/winners" },
              { label: t("productLinks.faq"), href: "/faq" },
            ]}
          />

          {/* Developers */}
          <FooterColumn
            title={t("developers")}
            links={[
              { label: t("developerLinks.contract"), href: "#" },
              { label: t("developerLinks.docs"), href: "#" },
              { label: t("developerLinks.audit"), href: "#" },
              { label: t("developerLinks.github"), href: "#" },
            ]}
          />

          {/* Legal */}
          <FooterColumn
            title={t("legal")}
            links={[
              { label: t("legalLinks.terms"), href: "#" },
              { label: t("legalLinks.privacy"), href: "#" },
              { label: t("legalLinks.risk"), href: "#" },
            ]}
          />
        </div>

        {/* Disclaimer */}
        <div className="mt-10 border-t border-white/5 pt-6">
          <p className="text-xs leading-relaxed text-white/40">
            {t("disclaimer")}
          </p>
          <p className="mt-3 text-xs text-white/30">
            © {year} HybridRoSCA Lottery. {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">
        {title}
      </h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((link, i) => (
          <li key={i}>
            <Link
              href={link.href as any}
              className="text-sm text-white/60 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
