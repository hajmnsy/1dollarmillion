"use client";

import { motion } from "framer-motion";

/**
 * Client-side wrapper for animated sections used by server-rendered
 * legal pages. Framer Motion's `motion.*` requires client context,
 * so we isolate the animation logic in this small client component.
 */
export function PageAnimation({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      {children}
    </motion.div>
  );
}
