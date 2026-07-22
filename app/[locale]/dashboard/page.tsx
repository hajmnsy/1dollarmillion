"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { PositionCard } from "@/components/dashboard/PositionCard";
import { PoolProgressCard } from "@/components/dashboard/PoolProgressCard";
import { YieldTrackerCard } from "@/components/dashboard/YieldTrackerCard";
import { SolvencyCard } from "@/components/dashboard/SolvencyCard";
import { OddsCard } from "@/components/dashboard/OddsCard";
import { DepositModal } from "@/components/dashboard/DepositModal";
import { WithdrawModal } from "@/components/dashboard/WithdrawModal";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { ReferralCard } from "@/components/dashboard/ReferralCard";
import { useDashboardData } from "@/hooks/useLottery";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return <DashboardContent />;
}

function DashboardContent() {
  const t = useTranslations("dashboard");
  const { isConnected, isReconnecting } = useAccount();
  const data = useDashboardData();

  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

  const isLoading = isReconnecting || (isConnected && data.isLoading);

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a]">
      <SiteHeader />
      <main className="flex-1">
        {isLoading ? (
          <LoadingState label={t("title")} />
        ) : (
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
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

              {!isConnected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.05] p-5 sm:p-6"
                >
                  <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {t("walletNotConnected")}
                      </h3>
                      <p className="mt-1 text-sm text-white/60">
                        {t("walletNotConnectedDesc")}
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="h-11 gap-2 rounded-full bg-emerald-500 px-5 text-sm font-semibold text-black shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400"
                    >
                      <Wallet className="h-4 w-4" />
                      {t("connectButton")}
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                {isConnected && data.userInfo ? (
                  <PositionCard
                    userInfo={data.userInfo}
                    daysRemaining={data.daysRemaining}
                    userStatus={data.userStatus}
                    drawInProgress={data.drawInProgress}
                    onDeposit={() => setDepositModalOpen(true)}
                    onWithdraw={() => setWithdrawModalOpen(true)}
                  />
                ) : (
                  <SkeletonCard />
                )}
              </motion.div>

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

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2"
            >
              <OddsCard
                activeUserCount={data.activeUserCount}
                userIsActive={isConnected && data.userStatus === "active"}
              />

              <ActivityFeed />
            </motion.div>

            {/* Referral Card - always visible */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="mt-6"
            >
              <ReferralCard />
            </motion.div>
          </div>
        )}
      </main>
      <SiteFooter />

      {isConnected && data.userInfo && (
        <DepositModal
          open={depositModalOpen}
          onOpenChange={setDepositModalOpen}
          currentBalance={data.userInfo.balance}
        />
      )}

      {isConnected && data.userInfo && (
        <WithdrawModal
          open={withdrawModalOpen}
          onOpenChange={setWithdrawModalOpen}
          currentBalance={data.userInfo.balance}
        />
      )}
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
