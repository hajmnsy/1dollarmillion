"use client";

interface LogoProps {
  className?: string;
}

/**
 * Logo — 1DollarMillion brand mark.
 *
 * A glowing gold coin icon (circle with $ sign) that pops against the
 * dark background. The "Million" text is also gold to match.
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
      <defs>
        {/* Gold gradient for the circle fill */}
        <radialGradient id="coin-gold" cx="0.35" cy="0.35" r="0.8">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </radialGradient>
        {/* Glow filter */}
        <filter id="coin-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Glowing gold coin */}
      <circle
        cx="16"
        cy="16"
        r="14"
        fill="url(#coin-gold)"
        stroke="#FBBF24"
        strokeWidth="1.5"
        filter="url(#coin-glow)"
      />
      {/* Inner ring for depth */}
      <circle
        cx="16"
        cy="16"
        r="11.5"
        stroke="#FEF3C7"
        strokeWidth="0.5"
        strokeOpacity="0.4"
        fill="none"
      />
      {/* $ sign in dark gold */}
      <path
        d="M16 9V23M12.5 12H18C19.3807 12 20.5 13.1193 20.5 14.5C20.5 15.8807 19.3807 17 18 17H14C12.6193 17 11.5 18.1193 11.5 19.5C11.5 20.8807 12.6193 22 14 22H19.5"
        stroke="#78350F"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <span className="font-bold text-xl tracking-tight text-white">
      1Dollar<span className="text-amber-400">Million</span>
    </span>
  </div>
);
