"use client";

import { useEffect, useRef } from "react";

interface Particle3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  color: string;
  alpha: number;
  pulseSpeed: number;
  pulsePhase: number;
}

export function Interactive3DCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates with 3D depth reaction
    let mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      radius: 220,
    };

    // Color palette: Vivid Cyberpunk Web3 Emerald & Gold
    const colors = [
      "rgba(16, 185, 129, ",   // Emerald
      "rgba(52, 211, 153, ",   // Mint
      "rgba(251, 191, 36, ",   // Golden Yellow
      "rgba(245, 158, 11, ",   // Amber Gold
      "rgba(110, 231, 183, ",  // Aqua Emerald
    ];

    // Initialize 3D particles
    const particleCount = Math.min(Math.floor((width * height) / 10000), 90);
    const particles: Particle3D[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.2,
        y: (Math.random() - 0.5) * height * 1.2,
        z: Math.random() * 600 + 100, // 3D depth (100 to 700)
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        vz: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2.5 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.4 + 0.4,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    const fov = 400; // 3D field of view

    // Render loop
    const render = () => {
      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Calculate projected 2D coordinates for all particles
      const projected = particles.map((p) => {
        // Perspective projection
        const scale = fov / (fov + p.z);
        const projX = p.x * scale + centerX;
        const projY = p.y * scale + centerY;
        const projSize = Math.max(p.size * scale * 1.8, 0.8);

        return {
          p,
          projX,
          projY,
          projSize,
          scale,
        };
      });

      // Draw 3D connecting filaments
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];

          const dx = p1.projX - p2.projX;
          const dy = p1.projY - p2.projY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            const lineAlpha = (1 - dist / 140) * 0.35 * Math.min(p1.scale, p2.scale);
            ctx.strokeStyle = `rgba(52, 211, 153, ${lineAlpha})`;
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.moveTo(p1.projX, p1.projY);
            ctx.lineTo(p2.projX, p2.projY);
            ctx.stroke();
          }
        }
      }

      // Update and draw particles
      projected.forEach(({ p, projX, projY, projSize, scale }) => {
        p.pulsePhase += p.pulseSpeed;
        const pulse = Math.sin(p.pulsePhase) * 0.2 + 0.8;

        // Mouse interaction in 2D projected space
        const dx = mouse.x - projX;
        const dy = mouse.y - projY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const force = (1 - dist / mouse.radius) * 1.5;
          p.x -= (dx / dist) * force * 5;
          p.y -= (dy / dist) * force * 5;
        }

        // 3D physics movement
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Wrap around 3D box
        const boundX = width * 0.7;
        const boundY = height * 0.7;
        if (p.x < -boundX) p.x = boundX;
        if (p.x > boundX) p.x = -boundX;
        if (p.y < -boundY) p.y = boundY;
        if (p.y > boundY) p.y = -boundY;
        if (p.z < 50) p.z = 650;
        if (p.z > 650) p.z = 50;

        // Draw particle with glowing halo
        ctx.save();
        const currentAlpha = Math.min(p.alpha * pulse * scale * 1.4, 0.95);
        ctx.fillStyle = `${p.color}${currentAlpha})`;
        ctx.shadowBlur = 12 * scale;
        ctx.shadowColor = `${p.color}0.8)`;
        ctx.beginPath();
        ctx.arc(projX, projY, projSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-90"
      aria-hidden="true"
    />
  );
}
