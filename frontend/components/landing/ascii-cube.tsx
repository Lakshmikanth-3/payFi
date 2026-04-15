"use client";

import { useEffect, useRef } from "react";

interface AsciiCubeProps {
  className?: string;
}

export function AsciiCube({ className = "" }: AsciiCubeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let angleX = 0;
    let angleY = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const chars = " .:-=+*#%@";

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const output: string[][] = [];
      const zbuffer: number[][] = [];
      const fontSize = 12;
      const cols = Math.floor(w / (fontSize * 0.6));
      const rows = Math.floor(h / (fontSize * 1.2));

      for (let i = 0; i < rows; i++) {
        output[i] = [];
        zbuffer[i] = [];
        for (let j = 0; j < cols; j++) {
          output[i][j] = " ";
          zbuffer[i][j] = 0;
        }
      }

      const size = 8;
      const scale = 18;
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      // Draw cube faces
      for (let x = -size; x <= size; x += 0.3) {
        for (let y = -size; y <= size; y += 0.3) {
          for (let z = -size; z <= size; z += 0.3) {
            // Only render faces
            const isFace =
              Math.abs(x) >= size - 0.3 ||
              Math.abs(y) >= size - 0.3 ||
              Math.abs(z) >= size - 0.3;

            if (!isFace) continue;

            // Rotate around X
            let ry = y * cosX - z * sinX;
            let rz1 = y * sinX + z * cosX;

            // Rotate around Y
            let rx = x * cosY + rz1 * sinY;
            let rz = -x * sinY + rz1 * cosY;

            const ooz = 1 / (rz + 25);
            const xp = Math.floor(cols / 2 + rx * scale * ooz * 0.5);
            const yp = Math.floor(rows / 2 - ry * scale * ooz * 0.5);

            if (yp >= 0 && yp < rows && xp >= 0 && xp < cols) {
              if (ooz > zbuffer[yp][xp]) {
                zbuffer[yp][xp] = ooz;
                const L = Math.abs(rz) / (size * 2);
                const idx = Math.floor(L * chars.length);
                output[yp][xp] = chars[Math.min(idx, chars.length - 1)];
              }
            }
          }
        }
      }

      // Render
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const char = output[i][j];
          if (char === " ") continue;
          const alpha = zbuffer[i][j] * 0.6;
          ctx.fillStyle = `oklch(0.75 0.18 170 / ${Math.min(alpha, 0.7)})`;
          ctx.font = `${fontSize}px monospace`;
          ctx.textBaseline = "top";
          ctx.fillText(char, j * fontSize * 0.6, i * fontSize * 1.2);
        }
      }

      angleX += 0.008;
      angleY += 0.012;
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
