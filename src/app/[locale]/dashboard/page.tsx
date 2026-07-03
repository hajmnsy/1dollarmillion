"use client";

import { useTranslations } from "next-intl";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { WalletNotConnected } from "@/components/dashboard/WalletNotConnected";
import { PositionCard } from "@/components/dashboard/PositionCard";
import { PoolProgressCard } from "@/components/dashboard/PoolProgressCard";
import { YieldTrackerCard } from "@/components/dashboard/YieldTrackerCard";
import { SolvencyCard } from "@/components/dashboard/SolvencyCard";
import { OddsCard } from "@/components/dashboard/OddsCard";
import { useDashboardData } from "@/hooks/useLottery";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

// Locale is provided by the parent [locale]/layout.tsx via NextIntlClientProvider.
// We use the client-side useLocale() hook to access it.
export default function DashboardPage() {
  return <DashboardContent />;
}

function DashboardContent() {
  const t = useTranslations("dashboard");
  const { isConnected, isReconnecting } = useAccount();
  const data = useDashboardData();

  const isLoading = !isConnected || isReconnecting || data.isLoading;

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a]">
      <SiteHeader />
      <main className="flex-1">
        {!isConnected ? (
          <WalletNotConnected />
        ) : isLoading ? (
          <LoadingState label={t("title")} />
        ) : (
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            {/* Page header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {t("title")}
              </h1>
              <p className="mt-1.5 text-sm text-white/60 sm:text-base">
                {t("subtitle")}
              </p>
            </motion.div>

            {/* Main grid: 2 columns on lg */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Left column */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                {data.userInfo ? (
                  <PositionCard
                    userInfo={data.userInfo}
                    daysRemaining={data.daysRemaining}
                    userStatus={data.userStatus}
                    drawInProgress={data.drawInProgress}
                    onDeposit={() => {
                      // Phase 3: open deposit modal
                      console.log("Open deposit modal");
                    }}
                    onWithdraw={() => {
                      // Phase 3: open withdraw modal
                      console.log("Open withdraw modal");
                    }}
                  />
                ) : (
                  <SkeletonCard />
                )}
              </motion.div>

              {/* Right column */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <PoolProgressCard
                  currentPool={data.currentPool}
                  poolProgress={data.poolProgress}
                  activeUserCount={data.activeUserCount}
                  regularDrawCount={data.drawCounts.regular}
                  bonusDrawCount={data.drawCounts.bonus}
                  drawInProgress={data.drawInProgress}
                />
              </motion.div>
            </div>

            {/* Second row: yield + side cards */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="lg:col-span-2"
              >
                <YieldTrackerCard
                  yieldBalance={data.yieldBalance}
                  yieldProgress={data.yieldProgress}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <SolvencyCard accounting={data.accounting} />
              </motion.div>
            </div>

            {/* Third row: odds of winning */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2"
            >
              <OddsCard
                activeUserCount={data.activeUserCount}
                userIsActive={data.userStatus === "active"}
              />

              {/* Activity feed placeholder for Phase 4 */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <h3 className="mb-4 text-sm font-bold text-white">
                  Recent Activity
                </h3>
                <div className="space-y-3 text-xs text-white/40">
                  <div className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
                    <span>Connect your wallet to see activity</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-32 text-center">
      <Loader2 className="mb-4 h-8 w-8 animate-spin text-emerald-400" />
      <p className="text-sm text-white/60">{label}...</p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="h-96 animate-pulse rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="mb-6 h-6 w-1/3 rounded-lg bg-white/5" />
      <div className="mb-4 h-12 w-1/2 rounded-lg bg-white/5" />
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="h-16 rounded-lg bg-white/5" />
        <div className="h-16 rounded-lg bg-white/5" />
      </div>
      <div className="mb-5 h-4 w-full rounded bg-white/5" />
      <div className="flex gap-3">
        <div className="h-11 flex-1 rounded-xl bg-white/5" />
        <div className="h-11 flex-1 rounded-xl bg-white/5" />
      </div>
    </div>
  );
}
