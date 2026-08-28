"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface Card3DTiltProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  enableGlow?: boolean;
}

export function Card3DTilt({
  children,
  className = "",
  glowColor = "rgba(16, 185, 129, 0.25)",
  enableGlow = true,
}: Card3DTiltProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Raw mouse coordinates relative to card center (-0.5 to 0.5)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Fast responsive spring physics for 3D rotation
  const mouseXSpring = useSpring(x, { stiffness: 260, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 260, damping: 20 });

  // Rotate between -10deg and 10deg for prominent 3D feel
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  // Glare position in percent (0% to 100%)
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <div
      style={{ perspective: 1000 }}
      className="relative transition-all duration-300"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        animate={{
          scale: isHovered ? 1.015 : 1,
          translateZ: isHovered ? 20 : 0,
        }}
        transition={{ duration: 0.2 }}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className={`relative overflow-hidden rounded-2xl transition-shadow duration-300 ${
          isHovered ? "shadow-2xl shadow-emerald-500/20" : "shadow-lg"
        } ${className}`}
      >
        {/* Dynamic Specular Light Glare */}
        {enableGlow && isHovered && (
          <motion.div
            className="pointer-events-none absolute -inset-px z-10 rounded-2xl opacity-80 transition-opacity duration-300"
            style={{
              background: `radial-gradient(500px circle at ${glareX} ${glareY}, ${glowColor}, transparent 70%)`,
            }}
          />
        )}

        {/* Content container */}
        <div className="relative z-20 h-full w-full">{children}</div>
      </motion.div>
    </div>
  );
}
