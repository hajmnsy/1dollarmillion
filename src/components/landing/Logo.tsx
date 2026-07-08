"use client";

interface LogoProps {
  className?: string;
}

/**
 * Logo — 1DollarMillion brand mark.
 *
 * A hexagonal shield (security + blockchain) with a stylized "$1" path
 * inside, rendered in emerald gradient. Matches the platform's primary
 * accent color.
 */
export const Logo = ({ className = "w-8 h-8" }: LogoProps) => (
  <div className="flex items-center gap-2">
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="1DollarMillion logo"
    >
      <path
        d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
        fill="url(#hex-gradient)"
        fillOpacity="0.15"
        stroke="#10B981"
        strokeWidth="2"
      />
      <path
        d="M13 11L16 8V24M12 24H20"
        stroke="#34D399"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="hex-gradient"
          x1="16"
          y1="2"
          x2="16"
          y2="30"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#34D399" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
      </defs>
    </svg>
    <span className="font-bold text-xl tracking-tight text-white">
      1Dollar<span className="text-emerald-400">Million</span>
    </span>
  </div>
);
