"use client";

import { useState } from "react";
import { DepositModal } from "@/components/dashboard/DepositModal";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { TrendingDown } from "lucide-react";

// Preview page — opens the deposit modal directly without requiring wallet connection.
// Useful for visual QA of the 5-layer gas optimization UX.
export default function DepositPreviewPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a]">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 shadow-lg shadow-emerald-500/10">
          <TrendingDown className="h-7 w-7 text-emerald-400" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-white">Deposit Modal Preview</h1>
        <p className="mb-6 max-w-md text-center text-sm text-white/60">
          Click the button below to open the Deposit Modal and verify the 5-layer
          gas optimization UX. (This is a visual QA page — no wallet required.)
        </p>
        <Button
          onClick={() => setOpen(true)}
          className="h-12 gap-2 rounded-xl bg-emerald-500 px-6 text-sm font-semibold text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
        >
          <TrendingDown className="h-4 w-4" />
          Open Deposit Modal
        </Button>

        {/* Modal — rendered with mock currentBalance since no wallet is connected */}
        <DepositModal open={open} onOpenChange={setOpen} currentBalance={150n * 10n ** 6n} />
      </main>
      <SiteFooter />
    </div>
  );
}
