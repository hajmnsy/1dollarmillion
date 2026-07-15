"use client";

import Image from "next/image";

interface LogoProps {
  className?: string;
  /** Logo image size in pixels. Default: 32 */
  size?: number;
}

/**
 * Logo — 1DollarMillion brand mark.
 *
 * Uses the brand logo image (green icon on black background).
 * The "Million" text is colored #2a8754 to match the logo's green.
 */
export const Logo = ({ className = "", size = 32 }: LogoProps) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <div
      className="relative rounded-full overflow-hidden bg-black flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo-main.png"
        alt="1DollarMillion logo"
        fill
        className="object-cover"
        priority
        sizes={`${size}px`}
      />
    </div>
    <span className="font-bold text-xl tracking-tight text-white whitespace-nowrap">
      1Dollar<span style={{ color: "#2a8754" }}>Million</span>
    </span>
  </div>
);
