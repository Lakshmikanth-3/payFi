"use client";

import { useEffect, useRef, useState } from "react";
import { AsciiCube } from "./ascii-cube";

// Animated ASCII generators for PayFi features
const asciiAnimations = {
  chat: (frame: number) => {
    const states = ["◉", "◎", "○", "◎"];
    const getChar = (offset: number) => states[(frame + offset) % states.length];
    return `  ┌──────────┐
  │ ${getChar(0)} PAY: 10  │
  │ ${getChar(1)} TO: Bob  │
  │ ${getChar(2)} NOW      │
  └──────────┘`;
  },
  deploy: (frame: number) => {
    const arrows = ["─", "═", "━", "═"];
    const a = arrows[frame % arrows.length];
    return `  ┌──┐   ┌──┐
  │AI├${a}${a}${a}▶│██│
  └──┘   └┬─┘
        ┌▼┐
        │✓│
        └─┘`;
  },
  flow: (frame: number) => {
    const bars = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
    const h = [
      bars[(frame + 0) % bars.length],
      bars[(frame + 2) % bars.length],
      bars[(frame + 4) % bars.length],
      bars[(frame + 1) % bars.length],
      bars[(frame + 3) % bars.length],
    ];
    return `  │${h[0]} ${h[1]} ${h[2]} ${h[3]} ${h[4]}
  │ Flow Active
  └────────────`;
  },
  secure: (frame: number) => {
    const lock = ["◈", "◇", "◆", "◇"];
    const l = lock[frame % lock.length];
    return `   ╔═════╗
   ║  ${l}  ║
  ┌╨─────╨┐
  │███████│
  └───────┘`;
  },
  split: (frame: number) => {
    const dots = ["●", "○", "●", "○"];
    return `     ┌───┐
     │ S │
    ┌╨─┐┌╨─┐┌╨─┐
    │${dots[frame%4]}││${dots[(frame+1)%4]}││${dots[(frame+2)%4]}│
    └──┘└──┘└──┘`;
  },
  cron: (frame: number) => {
    const ticks = ["┃", "╱", "━", "╲"];
    const t = ticks[frame % ticks.length];
    return `   ┌─────┐
   │  12${t}│
   │  3 ┃ 9│
   │  6  ┃ │
   └─────┘`;
  },
};

const features = [
  {
    title: "Natural Language Input",
    description: "Type any payment instruction in plain English. 'Send 5 USDC to Alice every Monday' — our AI parses intent instantly.",
    animationKey: "chat" as const,
  },
  {
    title: "Instant On-Chain Deployment",
    description: "Every payment program deploys as a FlowScript on HashKey Chain. Fully verifiable, transparent, and immutable.",
    animationKey: "deploy" as const,
  },
  {
    title: "Real-Time Flow Monitoring",
    description: "Track every execution, view activity feeds, and monitor payment calendars — all in real time.",
    animationKey: "flow" as const,
  },
  {
    title: "Dual Execution Modes",
    description: "Choose Manual for full control or Auto for autonomous agent-driven execution. You decide the trust level.",
    animationKey: "secure" as const,
  },
  {
    title: "Split Payments & Multi-Routing",
    description: "Split any amount equally among recipients, or define custom percentages. One instruction, many paths.",
    animationKey: "split" as const,
  },
  {
    title: "Scheduled & Recurring Flows",
    description: "Set up recurring payments — daily, weekly, monthly. The HSP engine watches triggers and executes on-chain.",
    animationKey: "cron" as const,
  },
];

function AnimatedAscii({ animationKey }: { animationKey: keyof typeof asciiAnimations }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setFrame((f) => f + 1), 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <pre
      className="text-xs leading-tight whitespace-pre font-mono"
      style={{ color: "oklch(0.85 0.2 130)" }}
    >
      {asciiAnimations[animationKey](frame)}
    </pre>
  );
}

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className="group relative rounded-xl p-8 transition-all duration-700 hover:border-primary/50"
      style={{
        transitionDelay: `${index * 100}ms`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(32px)",
        background: "transparent",
        border: "1px solid oklch(0.25 0.02 260 / 0.5)",
      }}
    >
      <div className="mb-6 h-24 flex items-center">
        <AnimatedAscii animationKey={feature.animationKey} />
      </div>
      <h3 className="text-lg font-semibold mb-2" style={{ color: "oklch(0.96 0.005 240)" }}>
        {feature.title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: "oklch(0.55 0.03 240)" }}>
        {feature.description}
      </p>
    </div>
  );
}

export function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" ref={sectionRef} className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <p
              className="text-sm font-mono mb-3"
              style={{ color: "oklch(0.85 0.2 130)" }}
            >
              // PROTOCOL POWER
            </p>
            <h2
              className="text-3xl lg:text-5xl font-semibold tracking-tight mb-6 transition-all duration-700"
              style={{
                fontFamily: "var(--font-geist-pixel), 'Geist Pixel Line', monospace",
                color: "oklch(0.96 0.005 240)",
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(16px)",
              }}
            >
              <span className="block">Speak. Deploy.</span>
              <span className="block text-gradient-lime">Settle.</span>
            </h2>
            <p
              className="text-lg leading-relaxed max-w-lg transition-all duration-700 delay-100"
              style={{
                color: "oklch(0.55 0.03 240)",
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(16px)",
              }}
            >
              PayFi rewrites the rules of on-chain payments. Describe any payment flow in natural
              language and watch the AI deploy it as verified, on-chain FlowScript logic.
            </p>
          </div>

          {/* ASCII Cube visualization */}
          <div className="flex justify-center lg:justify-end">
            <AsciiCube className="w-[400px] h-[500px]" />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
