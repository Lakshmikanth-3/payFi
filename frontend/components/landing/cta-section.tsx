"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AsciiSphere } from "./ascii-sphere";

export function CtaSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div
          className="relative rounded-2xl overflow-hidden transition-all duration-1000"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(32px)",
          }}
        >
          {/* Background */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.06 0.015 260) 0%, oklch(0.12 0.02 260) 100%)",
            }}
          />
          <div className="absolute inset-0 grid-pattern opacity-20" />

          {/* Sphere animation */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 overflow-hidden opacity-20">
            <AsciiSphere className="w-[500px] h-[500px]" />
          </div>

          <div className="relative z-10 px-8 lg:px-16 py-16 lg:py-24">
            <div className="flex items-center justify-between gap-8">
              <div className="max-w-2xl">
                <h2
                  className="text-3xl lg:text-5xl font-semibold tracking-tight mb-6"
                  style={{
                    fontFamily:
                      "var(--font-geist-pixel), 'Geist Pixel Line', monospace",
                    color: "oklch(0.96 0.005 240)",
                  }}
                >
                  Say it. Ship it.
                  <br />
                  <span className="text-gradient-lime">Done.</span>
                </h2>

                <p
                  className="text-lg mb-8 leading-relaxed max-w-lg"
                  style={{ color: "oklch(0.55 0.03 240)" }}
                >
                  Join the protocol where natural language meets on-chain execution.
                  Deploy your first payment program in under 30 seconds.
                </p>

                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <Link
                    href="/create"
                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-105"
                    style={{
                      background: "linear-gradient(135deg, oklch(0.85 0.2 130), #6fcd00)",
                      color: "oklch(0.06 0.015 260)",
                      boxShadow: "0 8px 24px oklch(0.85 0.2 130 / 0.3)",
                    }}
                  >
                    Launch App
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                  <Link
                    href="/programs"
                    className="px-8 py-3.5 rounded-xl text-sm font-bold border transition-all duration-300"
                    style={{
                      borderColor: "oklch(0.25 0.02 260)",
                      color: "oklch(0.96 0.005 240)",
                      background: "transparent",
                    }}
                  >
                    View Programs
                  </Link>
                </div>

                <p
                  className="text-sm mt-6 font-mono uppercase tracking-widest"
                  style={{ color: "oklch(0.25 0.02 260)" }}
                >
                  // Built on HashKey Chain
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
