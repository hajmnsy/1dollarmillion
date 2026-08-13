import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Web3ModalProvider } from "@/providers/Web3ModalProvider";

export const metadata: Metadata = {
  title: "1DollarMillion — Win $1,000,000. Never Lose Your Funds.",
  description:
    "Deposit USDT. Stay active for $1/day. Win $1,000,000. Your funds are always safe and verifiable on-chain.",
  keywords: [
    "Lottery",
    "No-Loss",
    "Polygon",
    "Chainlink",
    "USDT",
    "Smart Contract",
    "Web3",
  ],
  icons: {
    icon: [
      { url: "/logo-main.png", sizes: "any" },
      { url: "/logo-main.png", sizes: "32x32", type: "image/png" },
      { url: "/logo-main.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/logo-main.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/logo-main.png",
  },
  openGraph: {
    title: "1DollarMillion",
    description:
      "Deposit USDT. Stay active for $1/day. Win $1,000,000.",
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
