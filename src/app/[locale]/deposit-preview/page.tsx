"use client";

import { useState } from "react";
import { DepositModal } from "@/components/dashboard/DepositModal";
import { WithdrawModal } from "@/components/dashboard/WithdrawModal";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { TrendingDown, ArrowUpFromLine } from "lucide-react";

// Preview page — opens deposit & withdraw modals directly without requiring
// wallet connection. Useful for visual QA of Phase 3 + Phase 4 components.
export default function DepositPreviewPage() {
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  // Mock currentBalance for both modals
  const mockBalance = 150n * 10n ** 6n;

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a]">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20">
        <h1 className="mb-2 text-2xl font-bold text-white">Modal Preview</h1>
        <p className="mb-8 max-w-md text-center text-sm text-white/60">
          Click the buttons below to open either modal and verify the UX.
          (Visual QA page — no wallet required.)
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={() => setDepositOpen(true)}
            className="h-12 gap-2 rounded-xl bg-emerald-500 px-6 text-sm font-semibold text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
          >
            <TrendingDown className="h-4 w-4" />
            Open Deposit Modal
          </Button>
          <Button
            onClick={() => setWithdrawOpen(true)}
            className="h-12 gap-2 rounded-xl bg-amber-500 px-6 text-sm font-semibold text-black shadow-lg shadow-amber-500/20 hover:bg-amber-400"
          >
            <ArrowUpFromLine className="h-4 w-4" />
            Open Withdraw Modal
          </Button>
        </div>

        {/* Deposit modal */}
        <DepositModal
          open={depositOpen}
          onOpenChange={setDepositOpen}
          currentBalance={mockBalance}
        />

        {/* Withdraw modal */}
        <WithdrawModal
          open={withdrawOpen}
          onOpenChange={setWithdrawOpen}
          currentBalance={mockBalance}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
