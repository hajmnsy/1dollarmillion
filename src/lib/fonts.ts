import { NextFont } from "next/dist/compiled/@next/font";
import { Geist, Geist_Mono, Cairo } from "next/font/google";

// Latin fonts (English UI)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Arabic font — Tajawal/Cairo is purpose-built for Arabic glyph rendering
// with consistent x-height and proper RTL kerning.
const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

/**
 * Returns the body className based on locale.
 * - English (and any non-Arabic) → Geist Sans + Geist Mono
 * - Arabic → Cairo (replaces the default sans for proper Arabic typography)
 */
export function getBodyClassName(locale: string): string {
  const isArabic = locale === "ar";
  if (isArabic) {
    return `${cairo.variable} antialiased`;
  }
  return `${geistSans.variable} ${geistMono.variable} antialiased`;
}

// Exports used by globals.css to wire up the CSS variables
export const fontVariables = `${geistSans.variable} ${geistMono.variable} ${cairo.variable}`;

export { geistSans, geistMono, cairo };
