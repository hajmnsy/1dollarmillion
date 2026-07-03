"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Color = "emerald" | "purple" | "amber" | "blue" | "red";

const colorClasses: Record<Color, { bar: string; glow: string; text: string }> = {
  emerald: {
    bar: "bg-gradient-to-r from-emerald-500 to-emerald-400",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.5)]",
    text: "text-emerald-400",
  },
  purple: {
    bar: "bg-gradient-to-r from-purple-500 to-purple-400",
    glow: "shadow-[0_0_20px_rgba(168,85,247,0.5)]",
    text: "text-purple-400",
  },
  amber: {
    bar: "bg-gradient-to-r from-amber-500 to-amber-400",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.5)]",
    text: "text-amber-400",
  },
  blue: {
    bar: "bg-gradient-to-r from-blue-500 to-blue-400",
    glow: "shadow-[0_0_20px_rgba(59,130,246,0.5)]",
    text: "text-blue-400",
  },
  red: {
    bar: "bg-gradient-to-r from-red-500 to-red-400",
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.5)]",
    text: "text-red-400",
  },
};

interface ProgressBarProps {
  /** Progress value (0-100) */
  value: number;
  /** Color theme */
  color?: Color;
  /** Show pulsing animation when near 100% */
  pulseNearComplete?: boolean;
  /** Height of the bar (in px) */
  height?: number;
  /** Additional classes */
  className?: string;
  /** Enable glow effect */
  glow?: boolean;
}

export function ProgressBar({
  value,
  color = "emerald",
  pulseNearComplete = true,
  height = 8,
  className,
  glow = true,
}: ProgressBarProps) {
  const colors = colorClasses[color];
  const clamped = Math.min(100, Math.max(0, value));
  const isNearComplete = clamped >= 95;
  const isComplete = clamped >= 100;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-full bg-white/5 ring-1 ring-inset ring-white/10",
        className
      )}
      style={{ height: `${height}px` }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={cn(
          "h-full rounded-full",
          colors.bar,
          glow && colors.glow,
          pulseNearComplete && isNearComplete && !isComplete && "animate-pulse"
        )}
      >
        {/* Animated shimmer overlay */}
        <div className="h-full w-full overflow-hidden rounded-full">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: 1,
            }}
            className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        </div>
      </motion.div>
    </div>
  );
}
