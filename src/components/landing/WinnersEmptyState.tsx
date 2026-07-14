"use client";

import { Trophy, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

interface WinnersEmptyStateProps {
  badge: string;
  title: string;
  body: string;
  ctaLabel: string;
}

/**
 * WinnersEmptyState — client component for the animated empty state
 * on the Winners page. Extracted so the page itself can remain a
 * server component (using getTranslations).
 */
export function WinnersEmptyState({
  badge,
  title,
  body,
  ctaLabel,
}: WinnersEmptyStateProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-8 text-center shadow-2xl shadow-amber-500/10 sm:p-12">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/2 h-60 w-[500px] -translate-x-1/2 rounded-full bg-amber-500/20 blur-[100px]" />
      </div>

      <div className="relative">
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: 0.2,
            type: "spring",
            stiffness: 200,
          }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/15 ring-4 ring-amber-500/20"
        >
          <Trophy className="h-10 w-10 text-amber-400" />
        </motion.div>

        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300">
          <Sparkles className="h-3 w-3" />
          {badge}
        </div>

        <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
          {title}
        </h2>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-white/60 sm:text-base">
          {body}
        </p>

        <div className="mt-8">
          <Button
            asChild
            className="h-12 gap-2 rounded-full bg-amber-500 px-8 text-sm font-semibold text-black shadow-xl shadow-amber-500/30 transition-all hover:bg-amber-400 hover:shadow-amber-500/50"
          >
            <Link href="/dashboard">
              <Trophy className="h-4 w-4" />
              {ctaLabel}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
