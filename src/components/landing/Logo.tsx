"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  /** Size of the icon in pixels (width = height) */
  size?: number;
  /** Show the "HybridRoSCA" text next to the icon */
  showText?: boolean;
  /** Text size class (e.g. "text-lg", "text-xl") */
  textClassName?: string;
  /** Additional classes for the wrapper */
  className?: string;
  /** Variant: "light" for dark backgrounds, "dark" for light backgrounds */
  variant?: "light" | "dark";
}

/**
 * Logo — HybridRoSCA brand mark.
 *
 * The icon is a geometric "infinity shield" — a hexagon (representing
 * security and blockchain) merged with an infinity loop (representing
 * the no-loss, self-sustaining nature of the pool). Emerald gradient
 * matches the platform's primary accent color.
 */
export function Logo({
  size = 36,
  showText = true,
  textClassName = "text-lg",
  className,
  variant = "light",
}: LogoProps) {
  const textColor = variant === "light" ? "text-white" : "text-gray-900";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="HybridRoSCA logo"
      >
        <defs>
          {/* Emerald gradient — matches the platform's primary accent */}
          <linearGradient id="rosca-grad" x1="0" y1="0" x2="48" y2="48">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          {/* Subtle glow filter */}
          <filter id="rosca-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer hexagon — represents security + blockchain */}
        <path
          d="M24 2L42 12V36L24 46L6 36V12L24 2Z"
          fill="url(#rosca-grad)"
          opacity="0.15"
        />
        <path
          d="M24 2L42 12V36L24 46L6 36V12L24 2Z"
          stroke="url(#rosca-grad)"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Infinity loop — represents the no-loss, self-sustaining pool */}
        <g filter="url(#rosca-glow)">
          <path
            d="M16 24C16 20.69 18.69 18 22 18C24.5 18 26.5 19.5 27.5 21.5C28.5 19.5 30.5 18 33 18C36.31 18 39 20.69 39 24C39 27.31 36.31 30 33 30C30.5 30 28.5 28.5 27.5 26.5C26.5 28.5 24.5 30 22 30C18.69 30 16 27.31 16 24Z"
            stroke="url(#rosca-grad)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Left loop of infinity */}
          <ellipse
            cx="22"
            cy="24"
            rx="4"
            ry="4"
            stroke="url(#rosca-grad)"
            strokeWidth="2.5"
            fill="none"
          />
          {/* Right loop of infinity */}
          <ellipse
            cx="33"
            cy="24"
            rx="4"
            ry="4"
            stroke="url(#rosca-grad)"
            strokeWidth="2.5"
            fill="none"
          />
        </g>

        {/* Center accent dot — the "pool" */}
        <circle cx="27.5" cy="24" r="2" fill="url(#rosca-grad)" />
      </svg>

      {showText && (
        <span className={cn("font-bold tracking-tight", textClassName, textColor)}>
          Hybrid<span className="text-emerald-400">RoSCA</span>
        </span>
      )}
    </div>
  );
}
