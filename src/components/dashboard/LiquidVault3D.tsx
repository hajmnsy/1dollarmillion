"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Trophy } from "lucide-react";

interface LiquidVault3DProps {
  progress: number; // 0 to 100
  currentAmountFormatted: string;
  targetAmountFormatted: string;
}

export function LiquidVault3D({
  progress,
  currentAmountFormatted,
  targetAmountFormatted,
}: LiquidVault3DProps) {
  // Clamp progress between 2% and 100% so liquid is visible
  const clampedProgress = Math.min(Math.max(progress, 3), 100);

  // Animated wave phase
  const [waveOffset, setWaveOffset] = useState(0);

  useEffect(() => {
    let frame: number;
    const animate = () => {
      setWaveOffset((prev) => (prev + 0.04) % (Math.PI * 2));
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Floating bubbles for dynamic liquid feel
  const bubbles = [
    { id: 1, left: "20%", delay: 0, duration: 4 },
    { id: 2, left: "45%", delay: 1.5, duration: 5 },
    { id: 3, left: "70%", delay: 0.8, duration: 3.5 },
    { id: 4, left: "85%", delay: 2.2, duration: 4.5 },
  ];

  return (
    <div className="relative mx-auto my-4 w-full max-w-xl">
      {/* 3D Glass Cylinder Container */}
      <div className="relative h-28 w-full overflow-hidden rounded-2xl border border-emerald-500/30 bg-black/40 p-1 shadow-inner backdrop-blur-xl ring-1 ring-emerald-500/20">
        {/* Top/Bottom Glass Capsule Reflections */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 via-transparent to-black/60" />
        
        {/* Liquid Layer with Dynamic Height */}
        <motion.div
          initial={{ height: "0%" }}
          animate={{ height: `${clampedProgress}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute bottom-0 left-0 right-0 overflow-hidden bg-gradient-to-t from-emerald-600/60 via-emerald-500/40 to-emerald-400/30 shadow-lg shadow-emerald-500/30"
        >
          {/* Animated Sine Wave Surface */}
          <div className="absolute -top-3 left-0 right-0 h-6 w-[200%] opacity-80">
            <svg
              className="h-full w-full"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path
                d={`M 0,20 Q 150,${20 + Math.sin(waveOffset) * 15} 300,20 T 600,20 T 900,20 T 1200,20 L 1200,120 L 0,120 Z`}
                fill="rgba(52, 211, 153, 0.4)"
              />
              <path
                d={`M 0,25 Q 150,${25 + Math.cos(waveOffset) * 12} 300,25 T 600,25 T 900,25 T 1200,25 L 1200,120 L 0,120 Z`}
                fill="rgba(16, 185, 129, 0.6)"
              />
            </svg>
          </div>

          {/* Bubbles */}
          {bubbles.map((b) => (
            <motion.div
              key={b.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: -60, opacity: [0, 0.8, 0] }}
              transition={{
                duration: b.duration,
                repeat: Infinity,
                delay: b.delay,
                ease: "linear",
              }}
              style={{ left: b.left }}
              className="absolute bottom-0 h-2 w-2 rounded-full bg-emerald-200/60 blur-[0.5px]"
            />
          ))}

          {/* Liquid Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-yellow-400/10 to-emerald-500/20" />
        </motion.div>

        {/* Shimmer Light Bar */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />

        {/* Foreground Content Overlay */}
        <div className="relative z-10 flex h-full items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30">
              <Trophy className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  {progress.toFixed(2)}% Completed
                </span>
                <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
              </div>
              <div className="text-lg font-bold text-white sm:text-xl">
                {currentAmountFormatted}
                <span className="text-xs font-normal text-white/50"> / {targetAmountFormatted}</span>
              </div>
            </div>
          </div>

          <div className="hidden text-end sm:block">
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/20">
              1,000,000 USDT Target
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
