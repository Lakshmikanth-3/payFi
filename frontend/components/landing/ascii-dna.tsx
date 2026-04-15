"use client";

import { useEffect, useRef } from "react";

interface AsciiDnaProps {
  className?: string;
}

export function AsciiDna({ className = "" }: AsciiDnaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let phase = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const centerY = h / 2;
      const amplitude = h * 0.35;
      const pointsPerStrand = 80;
      const runs = 20;

      ctx.font = "12px monospace";
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      for (let i = 0; i < pointsPerStrand; i++) {
        const t = (i / pointsPerStrand) * Math.PI * 6;
        const y = centerY + (i - pointsPerStrand / 2) * (h / pointsPerStrand);

        const x1 = w * 0.3 + Math.sin(t + phase) * amplitude * 0.3;
        const x2 = w * 0.7 + Math.sin(t + phase + Math.PI) * amplitude * 0.3;

        const depth1 = Math.cos(t + phase);
        const depth2 = Math.cos(t + phase + Math.PI);

        // Strand 1
        const alpha1 = 0.2 + (depth1 + 1) * 0.25;
        ctx.fillStyle = `oklch(0.8 0.18 130 / ${alpha1})`;
        ctx.fillText("◉", x1, y);

        // Strand 2
        const alpha2 = 0.2 + (depth2 + 1) * 0.25;
        ctx.fillStyle = `oklch(0.7 0.18 170 / ${alpha2})`;
        ctx.fillText("◉", x2, y);

        // Connecting rungs
        if (i % Math.floor(pointsPerStrand / runs) === 0) {
          const runAlpha = 0.15 + (depth1 + depth2 + 2) * 0.08;
          ctx.fillStyle = `oklch(0.6 0.03 240 / ${runAlpha})`;
          ctx.fillText("══", (x1 + x2) / 2, y);
        }
      }

      phase += 0.03;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} style={{ display: "block" }} />;
}
