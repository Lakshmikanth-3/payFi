"use client";

import { useEffect, useRef } from "react";

interface AsciiSphereProps {
  className?: string;
}

export function AsciiSphere({ className = "" }: AsciiSphereProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let angle = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const chars = ".:-=+*#%@";
    const R = 10;
    const K2 = 5;
    const K1 = 25;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const output: string[][] = [];
      const zbuffer: number[][] = [];
      const cols = Math.floor(w / 10);
      const rows = Math.floor(h / 18);

      for (let i = 0; i < rows; i++) {
        output[i] = [];
        zbuffer[i] = [];
        for (let j = 0; j < cols; j++) {
          output[i][j] = " ";
          zbuffer[i][j] = 0;
        }
      }

      const A = angle;
      const B = angle * 0.7;

      for (let theta = 0; theta < 6.28; theta += 0.07) {
        for (let phi = 0; phi < 6.28; phi += 0.02) {
          const ct = Math.cos(theta);
          const st = Math.sin(theta);
          const cp = Math.cos(phi);
          const sp = Math.sin(phi);

          const cx = R * ct * sp;
          const cy = R * st * sp;
          const cz = R * cp;

          // Rotation
          const cosA = Math.cos(A);
          const sinA = Math.sin(A);
          const cosB = Math.cos(B);
          const sinB = Math.sin(B);

          const rx = cx * cosA + cz * sinA;
          const ry = cy;
          const rz = -cx * sinA + cz * cosA;

          const rx2 = rx * cosB - rz * sinB;
          const rz2 = rx * sinB + rz * cosB;

          const ooz = 1 / (rz2 + K2);
          const xp = Math.floor(cols / 2 + K1 * ooz * rx2 * 0.5);
          const yp = Math.floor(rows / 2 - K1 * ooz * ry * 0.5);

          const L = (cosB * ct * cp * Math.cos(A) + sp * Math.sin(A));

          if (yp >= 0 && yp < rows && xp >= 0 && xp < cols) {
            if (ooz > (zbuffer[yp][xp] || 0)) {
              zbuffer[yp][xp] = ooz;
              const luminanceIndex = Math.floor(L * 8);
              const idx = Math.max(0, Math.min(chars.length - 1, luminanceIndex + 4));
              output[yp][xp] = chars[idx];
            }
          }
        }
      }

      // Render
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const char = output[i][j];
          if (char === " ") continue;
          const dist = Math.sqrt(
            Math.pow(j - cols / 2, 2) + Math.pow(i - rows / 2, 2)
          );
          const maxDist = Math.max(cols, rows) / 2;
          const alpha = Math.max(0.05, 1 - dist / maxDist) * 0.6;
          ctx.fillStyle = `oklch(0.8 0.18 130 / ${alpha})`;
          ctx.font = "10px monospace";
          ctx.textBaseline = "top";
          ctx.fillText(char, j * 10, i * 18);
        }
      }

      angle += 0.015;
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
