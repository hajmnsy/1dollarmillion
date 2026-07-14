"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/landing/Logo";

export function SiteFooter() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-white/5 bg-[#080808]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Logo className="w-7 h-7" />
            <p className="mt-3 text-xs leading-relaxed text-white/50">
              {t("tagline")}
            </p>
          </div>

          {/* Product */}
          <FooterColumn
            title={t("product")}
            links={[
              { label: t("productLinks.howItWorks"), href: "/#how-it-works" },
              { label: t("productLinks.transparency"), href: "/transparency" },
              { label: t("productLinks.winners"), href: "/winners" },
              { label: t("productLinks.faq"), href: "/faq" },
            ]}
          />

          {/* Developers — external placeholder links (no real URLs yet) */}
          <FooterColumn
            title={t("developers")}
            links={[
              {
                label: t("developerLinks.contract"),
                href: "https://etherscan.io",
                external: true,
              },
              {
                label: t("developerLinks.docs"),
                href: "#",
                external: false,
              },
              {
                label: t("developerLinks.audit"),
                href: "#",
                external: false,
              },
              {
                label: t("developerLinks.github"),
                href: "https://github.com",
                external: true,
              },
            ]}
          />

          {/* Legal */}
          <FooterColumn
            title={t("legal")}
            links={[
              { label: t("legalLinks.terms"), href: "/terms" },
              { label: t("legalLinks.privacy"), href: "/privacy" },
              { label: t("legalLinks.risk"), href: "/risk" },
            ]}
          />
        </div>

        {/* Disclaimer */}
        <div className="mt-10 border-t border-white/5 pt-6">
          <p className="text-xs leading-relaxed text-white/40">
            {t("disclaimer")}
          </p>
          <p className="mt-3 text-xs text-white/30">
            © {year} 1DollarMillion. {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">
        {title}
      </h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((link, i) =>
          link.external ? (
            <li key={i}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/60 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            </li>
          ) : (
            <li key={i}>
              <Link
                href={link.href as any}
                className="text-sm text-white/60 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
