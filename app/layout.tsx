import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Web3ModalProvider } from "@/providers/Web3ModalProvider";

export const metadata: Metadata = {
  title: "1DollarMillion — No-Loss Lottery Powered by DeFi",
  description:
    "Deposit USDT. Win $1,000,000. Never lose your principal. The world's first hybrid ROSCA + No-Loss Lottery powered by Aave V3 yield and Chainlink VRF.",
  keywords: [
    "DeFi",
    "Lottery",
    "ROSCA",
    "Aave",
    "Chainlink",
    "USDT",
    "No-Loss Lottery",
    "Web3",
  ],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "1DollarMillion",
    description:
      "Deposit USDT. Win $1,000,000. Never lose your principal.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground min-h-screen">
        <Web3ModalProvider>{children}</Web3ModalProvider>
        <Toaster />
      </body>
    </html>
  );
}
