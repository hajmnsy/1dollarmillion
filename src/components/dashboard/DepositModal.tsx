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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  ExternalLink,
  TrendingDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TOKEN_DECIMALS_BI,
  DAILY_DEDUCTION,
} from "@/lib/contract/config";
import { useUserUsdtBalance, formatUsd } from "@/hooks/useLottery";
import { useDeposit, computeGasEfficiency, EST_GAS_COST_USD } from "@/hooks/useDeposit";
import { useNetworkGuard } from "@/hooks/useNetworkGuard";
import { NetworkSwitchBanner } from "@/components/dashboard/NetworkSwitchBanner";

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBalance: bigint;
}

const QUICK_SELECT_VALUES = [1, 30, 100, 500];

export function DepositModal({
  open,
  onOpenChange,
  currentBalance,
}: DepositModalProps) {
  const t = useTranslations("dashboard.deposit");
  const { data: walletUsdt } = useUserUsdtBalance();

  // === Amount state (defaults to 30) ===
  const [amountStr, setAmountStr] = useState("30");

  // Reset to default when modal opens
  useEffect(() => {
    if (open) setAmountStr("30");
  }, [open]);

  // Parse to bigint
  const amountBigInt = useMemo(() => {
    const parsed = parseFloat(amountStr);
    if (isNaN(parsed) || parsed <= 0) return 0n;
    // Convert to 6-decimal bigint
    return BigInt(Math.floor(parsed * Number(TOKEN_DECIMALS_BI)));
  }, [amountStr]);

  const amountUsd = useMemo(
    () => Number(amountBigInt) / Number(TOKEN_DECIMALS_BI),
    [amountBigInt]
  );

  // === Gas efficiency (Layer 3) ===
  const gasEff = computeGasEfficiency(amountUsd);

  // === Wallet balance checks (Layer 4 - checklist) ===
  const hasEnoughUsdt = walletUsdt ? walletUsdt >= amountBigInt && amountBigInt > 0n : false;

  // === Deposit hook ===
  const deposit = useDeposit(amountBigInt);

  // === Network guard (chain mismatch detection) ===
  const { isWrongChain } = useNetworkGuard();

  // === Derived days of activity ===
  const daysOfActivity = useMemo(() => {
    if (amountBigInt <= 0n) return 0;
    return Number(amountBigInt / DAILY_DEDUCTION);
  }, [amountBigInt]);

  // === Balance after deposit ===
  const balanceAfter = currentBalance + amountBigInt;

  // === Active until date ===
  const activeUntilDate = useMemo(() => {
    const totalDays = Number((balanceAfter) / DAILY_DEDUCTION);
    const d = new Date();
    d.setDate(d.getDate() + totalDays);
    return d;
  }, [balanceAfter]);

  // === Handlers ===
  const handleQuickSelect = (value: number) => {
    setAmountStr(value.toString());
  };

  const handleMax = () => {
    if (walletUsdt) {
      const maxUsd = Number(walletUsdt) / Number(TOKEN_DECIMALS_BI);
      setAmountStr(maxUsd.toString());
    }
  };

  const handleApprove = async () => {
    await deposit.approve();
  };

  const handleDeposit = async () => {
    await deposit.deposit();
  };

  const handleClose = () => {
    deposit.reset();
    onOpenChange(false);
  };

  // === Determine button state ===
  const showApproveButton = deposit.needsApproval && deposit.step !== "done";
  const showDepositButton =
    !deposit.needsApproval ||
    deposit.step === "approved" ||
    deposit.step === "depositing" ||
    deposit.step === "done";

  // === Success state ===
  const isSuccess = deposit.step === "done";

  return (
    <Dialog open={open} onOpenChange={(v) => !isSuccess && handleClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-white/10 bg-[#0f0f0f] p-0 sm:max-w-md">
        {/* === Header === */}
        <div className="border-b border-white/5 p-6">
          <DialogHeader>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
                <TrendingDown className="h-5 w-5 text-black" />
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
              newBalanceLabel={t("success.newBalance")}
              activeForLabel={t("success.activeFor")}
              newBalance={balanceAfter}
              daysActive={daysOfActivity}
              txHash={deposit.depositTxHash}
              viewOnEtherscan={t("success.viewOnEtherscan")}
              closeLabel={t("success.closeButton")}
              onClose={handleClose}
            />
          ) : (
            <>
              {/* === Network Switch Banner (shows if on wrong chain) === */}
              <NetworkSwitchBanner />

              {/* === Amount Input + Quick Select (Layer 1 & 2) === */}
              <div className="mb-5">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-medium uppercase tracking-wider text-white/50">
                    {t("amountLabel")}
                  </label>
                  <button
                    type="button"
                    onClick={handleMax}
                    className="text-xs font-medium text-emerald-400 transition-colors hover:text-emerald-300"
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
                    className="h-14 bg-white/[0.03] pr-16 text-2xl font-bold text-white border-white/10 focus:border-emerald-500/50 focus-visible:ring-emerald-500/20"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-white/40">
                    USDT
                  </span>
                </div>

                {/* Quick select chips */}
                <div className="mt-3">
                  <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-white/40">
                    {t("quickSelect.label")}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {QUICK_SELECT_VALUES.map((value) => {
                      const isSelected = amountStr === value.toString();
                      const isRecommended = value === 30;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleQuickSelect(value)}
                          className={`relative rounded-xl border px-2 py-2.5 text-sm font-semibold transition-all ${
                            isSelected
                              ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                              : "border-white/10 bg-white/[0.02] text-white/70 hover:border-white/20 hover:bg-white/5"
                          }`}
                        >
                          {value}
                          {isRecommended && (
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-500 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-black">
                              {t("quickSelect.thirtyRecommended")}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* === Gas Efficiency Badge (Layer 3) === */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={gasEff.tier}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.2 }}
                  className="mb-5"
                >
                  <GasEfficiencyBadge tier={gasEff.tier} />
                </motion.div>
              </AnimatePresence>

              {/* === Expandable Explainer (Layer 4) === */}
              <div className="mb-5">
                <Accordion type="single" collapsible>
                  <AccordionItem
                    value="explainer"
                    className="border-white/10"
                  >
                    <AccordionTrigger className="py-3 text-sm font-medium text-white/80 hover:no-underline hover:text-white">
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-emerald-400" />
                        {t("explainer.title")}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 text-sm text-white/60">
                      <p className="mb-3 leading-relaxed">{t("explainer.body")}</p>
                      <div className="space-y-2">
                        <ExplainerRow
                          label={t("explainer.row1Label")}
                          value={t("explainer.row1Value")}
                          highlight="bad"
                        />
                        <ExplainerRow
                          label={t("explainer.row2Label")}
                          value={t("explainer.row2Value")}
                          highlight="good"
                        />
                        <ExplainerRow
                          label={t("explainer.row3Label")}
                          value={t("explainer.row3Value")}
                          highlight="good"
                        />
                      </div>
                      <p className="mt-3 text-xs leading-relaxed text-white/50">
                        {t("explainer.conclusion")}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* === Cost Breakdown === */}
              <div className="mb-5 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="mb-3 text-xs font-medium uppercase tracking-wider text-white/40">
                  {t("costBreakdown.title")}
                </div>
                <div className="space-y-2">
                  <BreakdownRow
                    label={t("costBreakdown.depositAmount")}
                    value={`${amountUsd.toFixed(2)} USDT`}
                  />
                  <BreakdownRow
                    label={t("costBreakdown.estGasCost")}
                    value={
                      EST_GAS_COST_USD < 0.10
                        ? `~${(EST_GAS_COST_USD * 100).toFixed(1)}¢`  // show in cents if < $0.10
                        : `~$${EST_GAS_COST_USD.toFixed(2)}`
                    }
                  />
                  <BreakdownRow
                    label={t("costBreakdown.gasToDepositRatio")}
                    value={
                      gasEff.ratioPercent < 0.1
                        ? `${gasEff.ratioPercent.toFixed(3)}%`
                        : `${gasEff.ratioPercent.toFixed(2)}%`
                    }
                    accent={gasEff.tier === "optimal" || gasEff.tier === "good"}
                  />
                  <BreakdownRow
                    label={t("costBreakdown.daysOfActivity")}
                    value={`${daysOfActivity} ${daysOfActivity === 1 ? "day" : "days"}`}
                  />
                  <BreakdownRow
                    label={t("costBreakdown.costPerDay")}
                    value={
                      daysOfActivity > 0
                        ? EST_GAS_COST_USD / daysOfActivity < 0.10
                          ? `${((EST_GAS_COST_USD / daysOfActivity) * 100).toFixed(2)}¢`
                          : `$${(EST_GAS_COST_USD / daysOfActivity).toFixed(2)}`
                        : "—"
                    }
                  />
                  <div className="my-2 border-t border-white/5" />
                  <BreakdownRow
                    label={t("costBreakdown.balanceAfter")}
                    value={formatUsd(balanceAfter)}
                    bold
                  />
                  <BreakdownRow
                    label={t("costBreakdown.activeUntil")}
                    value={activeUntilDate.toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  />
                </div>
              </div>

              {/* === Pre-transaction Checklist === */}
              <div className="mb-5 space-y-2">
                <ChecklistRow
                  ok={true}
                  label={t("checklist.walletConnected")}
                  status={t("checklist.ready")}
                />
                <ChecklistRow
                  ok={hasEnoughUsdt}
                  label={t("checklist.usdtBalance")}
                  status={
                    hasEnoughUsdt
                      ? t("checklist.sufficient")
                      : t("checklist.insufficient")
                  }
                />
                <ChecklistRow
                  ok={!deposit.needsApproval}
                  label={t("checklist.usdtAllowance")}
                  status={
                    deposit.needsApproval
                      ? t("checklist.needsApproval")
                      : t("checklist.ready")
                  }
                />
              </div>

              {/* === Error message === */}
              {deposit.step === "error" && deposit.errorMessage && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-300">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{deposit.errorMessage}</span>
                </div>
              )}

              {/* === Wizard Steps Indicator === */}
              <div className="mb-4 flex items-center gap-2 text-xs text-white/40">
                <span>
                  {t("wizard.currentStep", {
                    current: deposit.needsApproval ? 1 : 2,
                    total: 2,
                  })}
                </span>
                <div className="flex flex-1 gap-1">
                  <StepBar
                    state={
                      deposit.step === "done" || !deposit.needsApproval
                        ? "done"
                        : deposit.step === "approving"
                          ? "active"
                          : deposit.step === "error" && deposit.errorStep === "approve"
                            ? "error"
                            : "pending"
                    }
                  />
                  <StepBar
                    state={
                      deposit.step === "done"
                        ? "done"
                        : deposit.step === "depositing"
                          ? "active"
                          : deposit.step === "error" && deposit.errorStep === "deposit"
                            ? "error"
                            : "pending"
                    }
                  />
                </div>
              </div>

              {/* === Action Buttons === */}
              <div className="space-y-2">
                {/* Approve button */}
                {showApproveButton && (
                  <WizardButton
                    onClick={handleApprove}
                    disabled={
                      !hasEnoughUsdt ||
                      isWrongChain ||
                      deposit.step === "approving" ||
                      deposit.step === "depositing"
                    }
                    loading={deposit.step === "approving"}
                    loadingText={t("wizard.step1Pending")}
                    icon={<ChevronRight className="h-4 w-4 rtl:rotate-180" />}
                    variant="primary"
                  >
                    {deposit.step === "approved"
                      ? t("wizard.step1Success")
                      : t("wizard.step1Button")}
                  </WizardButton>
                )}

                {/* Skip approval notice */}
                {!deposit.needsApproval && deposit.step === "idle" && (
                  <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {t("wizard.skipApproval")}
                  </div>
                )}

                {/* Deposit button */}
                {showDepositButton && (
                  <WizardButton
                    onClick={handleDeposit}
                    disabled={
                      !hasEnoughUsdt ||
                      isWrongChain ||
                      deposit.step === "approving" ||
                      deposit.step === "depositing"
                    }
                    loading={deposit.step === "depositing"}
                    loadingText={t("wizard.step2Pending")}
                    icon={null}
                    variant={deposit.step === "done" ? "success" : "primary"}
                  >
                    {deposit.step === "done"
                      ? t("wizard.step2Success")
                      : t("wizard.step2Button")}
                  </WizardButton>
                )}

                {/* Retry button on error */}
                {deposit.step === "error" && (
                  <Button
                    onClick={() => deposit.reset()}
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

function GasEfficiencyBadge({
  tier,
}: {
  tier: "poor" | "fair" | "good" | "optimal";
}) {
  const t = useTranslations("dashboard.deposit.gasBadge");

  const config = {
    poor: {
      label: t("poor"),
      desc: t("poorDesc"),
      icon: <XCircle className="h-4 w-4" />,
      className: "border-red-500/30 bg-red-500/10 text-red-300",
    },
    fair: {
      label: t("fair"),
      desc: t("fairDesc"),
      icon: <AlertTriangle className="h-4 w-4" />,
      className: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    },
    good: {
      label: t("good"),
      desc: t("goodDesc"),
      icon: <CheckCircle2 className="h-4 w-4" />,
      className:
        "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    },
    optimal: {
      label: t("optimal"),
      desc: t("optimalDesc"),
      icon: <Sparkles className="h-4 w-4" />,
      className:
        "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
    },
  }[tier];

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${config.className}`}
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-current/10">
        {config.icon}
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold">{config.label}</div>
        <div className="text-xs opacity-80">{config.desc}</div>
      </div>
    </div>
  );
}

function ExplainerRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight: "good" | "bad";
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.02] px-3 py-2 text-xs">
      <span className="text-white/70">{label}</span>
      <span
        className={`text-end font-medium ${
          highlight === "good" ? "text-emerald-300" : "text-red-300"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  accent = false,
  bold = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-white/50">{label}</span>
      <span
        className={`font-mono ${
          accent ? "text-emerald-400" : "text-white/80"
        } ${bold ? "font-bold" : "font-semibold"}`}
      >
        {value}
      </span>
    </div>
  );
}

function ChecklistRow({
  ok,
  label,
  status,
}: {
  ok: boolean;
  label: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-2">
        {ok ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
        ) : (
          <XCircle className="h-3.5 w-3.5 text-red-400" />
        )}
        <span className="text-white/70">{label}</span>
      </div>
      <span className={ok ? "text-emerald-400" : "text-red-400"}>{status}</span>
    </div>
  );
}

function StepBar({
  state,
}: {
  state: "pending" | "active" | "done" | "error";
}) {
  const colors = {
    pending: "bg-white/10",
    active: "bg-emerald-500 animate-pulse",
    done: "bg-emerald-500",
    error: "bg-red-500",
  }[state];
  return <div className={`h-1 flex-1 rounded-full ${colors}`} />;
}

function WizardButton({
  onClick,
  disabled,
  loading,
  loadingText,
  icon,
  variant,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
  loadingText: string;
  icon: React.ReactNode;
  variant: "primary" | "success";
  children: React.ReactNode;
}) {
  const variantClasses = {
    primary:
      "bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40",
    success: "bg-emerald-600 text-white",
  }[variant];

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`h-12 w-full gap-2 rounded-xl text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses}`}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          {children}
          {icon}
        </>
      )}
    </Button>
  );
}

function SuccessView({
  title,
  description,
  newBalanceLabel,
  activeForLabel,
  newBalance,
  daysActive,
  txHash,
  viewOnEtherscan,
  closeLabel,
  onClose,
}: {
  title: string;
  description: string;
  newBalanceLabel: string;
  activeForLabel: string;
  newBalance: bigint;
  daysActive: number;
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
        className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 ring-4 ring-emerald-500/20"
      >
        <CheckCircle2 className="h-8 w-8 text-emerald-400" />
      </motion.div>

      <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
      <p className="mb-6 text-sm text-white/60">{description}</p>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-white/40">
            {newBalanceLabel}
          </div>
          <div className="text-lg font-bold text-emerald-400">
            {formatUsd(newBalance)}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-white/40">
            {activeForLabel}
          </div>
          <div className="text-lg font-bold text-white">
            {daysActive} {daysActive === 1 ? "day" : "days"}
          </div>
        </div>
      </div>

      {txHash && (
        <a
          href={`https://polygonscan.com/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 transition-colors hover:text-emerald-300"
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
