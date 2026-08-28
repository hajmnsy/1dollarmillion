"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DepositCelebrationProps {
  show: boolean;
  onComplete?: () => void;
}

export function DepositCelebration({
  show,
  onComplete,
}: DepositCelebrationProps) {
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      color: string;
      size: number;
      rotation: number;
    }>
  >([]);

  useEffect(() => {
    if (show) {
      const colors = ["#10b981", "#34d399", "#fbbf24", "#f59e0b", "#6ee7b7", "#ffffff"];
      const newParticles = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 400,
        y: -Math.random() * 300 - 50,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        setParticles([]);
        if (onComplete) onComplete();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && particles.length > 0 && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ scale: 0, x: 0, y: 0, opacity: 1, rotate: 0 }}
              animate={{
                scale: [0, 1.2, 0.8],
                x: p.x,
                y: [0, p.y, p.y + 400],
                opacity: [1, 1, 0],
                rotate: p.rotation + 720,
              }}
              transition={{ duration: 2.5, ease: "easeOut" }}
              style={{
                backgroundColor: p.color,
                width: p.size,
                height: p.size,
                borderRadius: p.id % 2 === 0 ? "50%" : "2px",
              }}
              className="absolute shadow-lg"
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
