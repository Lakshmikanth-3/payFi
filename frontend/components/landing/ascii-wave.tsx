"use client";

import { useEffect, useRef } from "react";

interface AsciiWaveProps {
  className?: string;
}

export function AsciiWave({ className = "" }: AsciiWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const chars = " .:-=+*#%@";
    const fontSize = 14;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const cols = Math.floor(w / (fontSize * 0.6));
      const rows = Math.floor(h / (fontSize * 1.2));

      ctx.font = `${fontSize}px monospace`;
      ctx.textBaseline = "top";

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const nx = x / cols;
          const ny = y / rows;

          // Multiple sine waves for a rich surface
          let v = 0;
          v += Math.sin(nx * 4 + time * 0.8 + ny * 2) * 0.5;
          v += Math.sin(nx * 6 - time * 1.2 + ny * 3) * 0.3;
          v += Math.sin(ny * 3 + time * 0.6 + nx * 5) * 0.2;
          v = v * 0.5 + 0.5; // normalize to 0..1

          const charIndex = Math.floor(v * (chars.length - 1));
          const char = chars[charIndex];

          // Color based on value
          const hue = 130 + v * 40; // lime to teal range
          const lightness = 0.6 + v * 0.25;
          const alpha = 0.15 + v * 0.35;
          ctx.fillStyle = `oklch(${lightness} 0.18 ${hue} / ${alpha})`;
          ctx.fillText(char, x * fontSize * 0.6, y * fontSize * 1.2);
        }
      }

      time += 0.02;
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
