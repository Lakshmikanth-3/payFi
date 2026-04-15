"use client";

import { useEffect, useState, useRef } from "react";
import { AsciiDna } from "./ascii-dna";

function AnimatedCounter({ end, suffix = "", prefix = "" }: { end: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 2000;
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, hasAnimated]);

  return (
    <div
      ref={ref}
      className="font-mono text-4xl lg:text-6xl font-semibold tracking-tight"
      style={{ color: "oklch(0.85 0.2 130)" }}
    >
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </div>
  );
}

const metrics = [
  {
    value: 500,
    suffix: "+",
    label: "Payment Programs Deployed",
    sublabel: "FlowScripts on-chain",
  },
  {
    value: 100,
    suffix: "%",
    label: "On-Chain Settlement",
    sublabel: "HashKey Chain verified",
  },
  {
    value: 2,
    suffix: "s",
    label: "Avg AI Parse Time",
    sublabel: "Natural language → FlowScript",
  },
  {
    value: 133,
    suffix: "",
    label: "Chain ID",
    sublabel: "HashKey Testnet",
  },
];

export function ProtocolSection() {
  const [time, setTime] = useState(new Date());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="protocol" className="relative py-32 overflow-hidden">
      {/* ASCII DNA Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <AsciiDna className="w-full h-full object-cover" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
          <div>
            <p className="text-sm font-mono mb-3" style={{ color: "oklch(0.85 0.2 130)" }}>
              // LIVE PROTOCOL STATE
            </p>
            <h2
              className="text-3xl lg:text-5xl font-semibold tracking-tight"
              style={{
                fontFamily: "var(--font-geist-pixel), 'Geist Pixel Line', monospace",
                color: "oklch(0.96 0.005 240)",
              }}
            >
              Real-time protocol
              <br />
              <span className="text-gradient-lime">performance.</span>
            </h2>
          </div>
          <div className="flex items-center gap-3 font-mono text-sm" style={{ color: "oklch(0.55 0.03 240)" }}>
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "oklch(0.85 0.2 130)" }}
            />
            <span>HSP Engine Active</span>
            <span style={{ color: "oklch(0.25 0.02 260)" }}>|</span>
            <span>{isClient ? time.toLocaleTimeString() : ""}</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px rounded-xl overflow-hidden card-shadow"
          style={{ background: "oklch(0.25 0.02 260)" }}
        >
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="p-8 flex flex-col gap-4"
              style={{ background: "oklch(0.08 0.015 260)" }}
            >
              <AnimatedCounter end={metric.value} suffix={metric.suffix} />
              <div>
                <div className="font-medium" style={{ color: "oklch(0.96 0.005 240)" }}>
                  {metric.label}
                </div>
                <div className="text-sm" style={{ color: "oklch(0.55 0.03 240)" }}>
                  {metric.sublabel}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
