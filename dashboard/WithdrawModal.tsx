"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowUpFromLine,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  TOKEN_DECIMALS_BI,
  DAILY_DEDUCTION,
} from "@/lib/contract/config";
import { formatUsd } from "@/hooks/useLottery";
import { useWithdraw, EST_WITHDRAW_GAS_USD } from "@/hooks/useWithdraw";
import { useNetworkGuard } from "@/hooks/useNetworkGuard";
import { NetworkSwitchBanner } from "@/components/dashboard/NetworkSwitchBanner";

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBalance: bigint;
}

export function WithdrawModal({
  open,
  onOpenChange,
  currentBalance,
}: WithdrawModalProps) {
  const t = useTranslations("dashboard.withdraw");

  // === Amount state (defaults to empty) ===
  const [amountStr, setAmountStr] = useState("");

  // Reset to default when modal opens
  useEffect(() => {
    if (open) setAmountStr("");
  }, [open]);

  // Parse to bigint
  const amountBigInt = useMemo(() => {
    const parsed = parseFloat(amountStr);
    if (isNaN(parsed) || parsed <= 0) return 0n;
    return BigInt(Math.floor(parsed * Number(TOKEN_DECIMALS_BI)));
  }, [amountStr]);

  const amountUsd = useMemo(
    () => Number(amountBigInt) / Number(TOKEN_DECIMALS_BI),
    [amountBigInt]
  );

  // === Withdraw hook ===
  const withdraw = useWithdraw(amountBigInt);

  // === Network guard (chain mismatch detection) ===
  const { isWrongChain } = useNetworkGuard();

  // === Derived values ===
  const remainingBalance =
    amountBigInt > currentBalance ? 0n : currentBalance - amountBigInt;
  const remainingUsd = Number(remainingBalance) / Number(TOKEN_DECIMALS_BI);
  const willBecomeInactive = remainingBalance > 0n && remainingBalance < TOKEN_DECIMALS_BI;
  const becomesZero = remainingBalance === 0n && amountBigInt > 0n;
  const showLowBalanceWarning = (willBecomeInactive || becomesZero) && amountBigInt > 0n;
  const exceedsBalance = amountBigInt > currentBalance;
  const daysActiveAfter = remainingBalance > 0n
    ? Number(remainingBalance / DAILY_DEDUCTION)
    : 0;

  // === Handlers ===
  const handleMax = () => {
    const maxUsd = Number(currentBalance) / Number(TOKEN_DECIMALS_BI);
    setAmountStr(maxUsd.toString());
  };

  const handleWithdraw = async () => {
    await withdraw.withdraw();
  };

  const handleClose = () => {
    withdraw.reset();
    onOpenChange(false);
  };

  const isSuccess = withdraw.step === "done";

  // === Status after withdrawal ===
  const statusAfterLabel = (() => {
    if (remainingBalance === 0n && amountBigInt > 0n) {
      return t("statusAfter.inactive");
    }
    if (willBecomeInactive) {
      return t("statusAfter.inactive");
    }
    return t("statusAfter.active");
  })();

  return (
    <Dialog open={open} onOpenChange={(v) => !isSuccess && handleClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-white/10 bg-[#0f0f0f] p-0 sm:max-w-md">
        {/* === Header === */}
        <div className="border-b border-white/5 p-6">
          <DialogHeader>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30">
                <ArrowUpFromLine className="h-5 w-5 text-black" />
              </div>
              <DialogTitle className="text-xl font-bold text-white">
                {t("title")}
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-white/60">
              {t("subtitle")}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6">
          {/* === Success view === */}
          {isSuccess ? (
            <SuccessView
              title={t("success.title")}
              description={t("success.description")}
              withdrawnAmountLabel={t("success.withdrawnAmount")}
              newBalanceLabel={t("success.newBalance")}
              withdrawnAmount={amountBigInt}
              newBalance={remainingBalance}
              txHash={withdraw.withdrawTxHash}
              viewOnEtherscan={t("success.viewOnEtherscan")}
              closeLabel={t("success.closeButton")}
              onClose={handleClose}
            />
          ) : (
            <>
              {/* === Network Switch Banner (shows if on wrong chain) === */}
              <NetworkSwitchBanner />

              {/* === Amount Input === */}
              <div className="mb-5">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-medium uppercase tracking-wider text-white/50">
                    {t("amountLabel")}
                  </label>
                  <button
                    type="button"
                    onClick={handleMax}
                    className="text-xs font-medium text-amber-400 transition-colors hover:text-amber-300"
                  >
                    {t("maxButton")}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    placeholder={t("amountPlaceholder")}
                    className="h-14 bg-white/[0.03] pr-16 text-2xl font-bold text-white border-white/10 focus:border-amber-500/50 focus-visible:ring-amber-500/20"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-white/40">
                    USDT
                  </span>
                </div>

                {/* Available balance hint */}
                <div className="mt-2 flex items-center justify-between text-xs text-white/40">
                  <span>
                    {t("costBreakdown.remainingBalance")}:{" "}
                    <span className="font-semibold text-white/70">
                      {formatUsd(currentBalance)}
                    </span>
                  </span>
                </div>
              </div>

              {/* === Low Balance Warning === */}
              {showLowBalanceWarning && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/40 bg-gradient-to-br from-red-500/15 to-red-500/5 p-4"
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-500/20">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-red-300">
                      {t("lowBalanceWarning.title")}
                    </div>
                    <div className="mt-1 text-xs leading-relaxed text-red-200/80">
                      {t("lowBalanceWarning.body")}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* === Exceeds balance error === */}
              {exceedsBalance && (
                <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-300">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{t("errors.insufficientBalance")}</span>
                </div>
              )}

              {/* === Cost Breakdown === */}
              <div className="mb-5 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="mb-3 text-xs font-medium uppercase tracking-wider text-white/40">
                  {t("costBreakdown.title")}
                </div>
                <div className="space-y-2">
                  <BreakdownRow
                    label={t("costBreakdown.withdrawAmount")}
                    value={`${amountUsd.toFixed(2)} USDT`}
                  />
                  <BreakdownRow
                    label={t("costBreakdown.remainingBalance")}
                    value={formatUsd(remainingBalance)}
                    accent={remainingBalance > 0n && !willBecomeInactive}
                  />
                  <BreakdownRow
                    label={t("costBreakdown.statusAfter")}
                    value={statusAfterLabel}
                    accent={statusAfterLabel === t("statusAfter.active")}
                    danger={statusAfterLabel === t("statusAfter.inactive")}
                  />
                  <BreakdownRow
                    label={t("costBreakdown.estGasCost")}
                    value={`~$${EST_WITHDRAW_GAS_USD.toFixed(2)}`}
                  />
                  {remainingBalance > 0n && !willBecomeInactive && (
                    <BreakdownRow
                      label={t("costBreakdown.activeAfter")}
                      value={t("statusAfter.activeForDays", { days: daysActiveAfter })}
                    />
                  )}
                </div>
              </div>

              {/* === Error message === */}
              {withdraw.step === "error" && withdraw.errorMessage && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-300">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{withdraw.errorMessage}</span>
                </div>
              )}

              {/* === Action Buttons === */}
              <div className="space-y-2">
                <Button
                  onClick={handleWithdraw}
                  disabled={
                    !withdraw.canWithdraw ||
                    isWrongChain ||
                    exceedsBalance ||
                    withdraw.step === "withdrawing"
                  }
                  className="h-12 w-full gap-2 rounded-xl bg-amber-500 text-sm font-semibold text-black shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 hover:shadow-amber-500/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {withdraw.step === "withdrawing" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("wizard.pending")}
                    </>
                  ) : (
                    <>
                      {t("wizard.button")}
                      <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                    </>
                  )}
                </Button>

                {/* Retry on error */}
                {withdraw.step === "error" && (
                  <Button
                    onClick={() => withdraw.reset()}
                    variant="outline"
                    className="w-full rounded-xl border-white/15 bg-white/5 text-sm font-medium text-white hover:bg-white/10"
                  >
                    {t("retryButton")}
                  </Button>
                )}
              </div>

              {/* === Agreement === */}
              <p className="mt-4 text-center text-[10px] leading-relaxed text-white/40">
                {t("agreeNote")}
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// =================== Sub-components =========================
// ============================================================

function BreakdownRow({
  label,
  value,
  accent = false,
  danger = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-white/50">{label}</span>
      <span
        className={`font-mono font-semibold ${
          danger
            ? "text-red-400"
            : accent
              ? "text-emerald-400"
              : "text-white/80"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function SuccessView({
  title,
  description,
  withdrawnAmountLabel,
  newBalanceLabel,
  withdrawnAmount,
  newBalance,
  txHash,
  viewOnEtherscan,
  closeLabel,
  onClose,
}: {
  title: string;
  description: string;
  withdrawnAmountLabel: string;
  newBalanceLabel: string;
  withdrawnAmount: bigint;
  newBalance: bigint;
  txHash: `0x${string}` | undefined;
  viewOnEtherscan: string;
  closeLabel: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="py-6 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15 ring-4 ring-amber-500/20"
      >
        <CheckCircle2 className="h-8 w-8 text-amber-400" />
      </motion.div>

      <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
      <p className="mb-6 text-sm text-white/60">{description}</p>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-white/40">
            {withdrawnAmountLabel}
          </div>
          <div className="text-lg font-bold text-amber-400">
            {formatUsd(withdrawnAmount)}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-white/40">
            {newBalanceLabel}
          </div>
          <div className="text-lg font-bold text-white">
            {formatUsd(newBalance)}
          </div>
        </div>
      </div>

      {txHash && (
        <a
          href={`https://polygonscan.com/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 transition-colors hover:text-amber-300"
        >
          {viewOnEtherscan}
          <ExternalLink className="h-3 w-3" />
        </a>
      )}

      <Button
        onClick={onClose}
        className="h-11 w-full rounded-xl bg-white/10 text-sm font-semibold text-white hover:bg-white/15"
      >
        {closeLabel}
      </Button>
    </motion.div>
  );
}
