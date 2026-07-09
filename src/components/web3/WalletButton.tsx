"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

/**
 * WalletButtonPlaceholder — static button shown during SSR and
 * while the dynamic import loads on the client.
 */
function WalletButtonPlaceholder() {
  const t = useTranslations("wallet");
  return (
    <Button
      disabled
      className="h-10 gap-2 rounded-full bg-emerald-500 px-4 sm:px-5 text-sm font-semibold text-black opacity-70"
    >
      <Wallet className="h-4 w-4" />
      <span className="hidden xs:inline">{t("connect")}</span>
      <span className="xs:hidden">{t("connectShort")}</span>
    </Button>
  );
}

/**
 * WalletButton — dynamically loads WalletButtonInner with ssr:false.
 *
 * This pattern completely eliminates hydration mismatches:
 *   - Server renders: static placeholder button
 *   - Client first render: same static placeholder (matches server)
 *   - Client after dynamic import loads: real wallet button
 *
 * The real wallet button (with wagmi hooks like useAccount, useConnect)
 * never runs on the server, so there's zero chance of mismatch.
 */
const WalletButtonDynamic = dynamic(
  () => import("./WalletButtonInner").then((m) => m.WalletButtonInner),
  {
    ssr: false,
    loading: () => <WalletButtonPlaceholder />,
  }
);

export function WalletButton() {
  return <WalletButtonDynamic />;
}
