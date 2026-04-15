"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  {
    number: "01",
    title: "Describe Your Payment",
    description: "Type your payment intent in plain English. 'Send 10 USDC to Bob every Monday' — our AI parses the instruction.",
    code: `"Send 10 USDC to Bob every Monday"\n  ↓\nAI parses intent → extracts rules\nRecipient, amount, token, trigger`,
  },
  {
    number: "02",
    title: "AI Generates FlowScript",
    description: "The AI builds your payment program with execution rules, triggers, and recipient mappings. Review and approve.",
    code: `FlowScript Generated:\n  rules: [{ recipient: Bob,\n          amount: 10,\n          token: USDC }]\n  trigger: { type: CRON, interval: 7d }`,
  },
  {
    number: "03",
    title: "Deploy & Execute",
    description: "Deploy on-chain with one click. Choose Manual approval or let the Autonomous Engine handle it. Settlement is instant.",
    code: `await registry.deploy(\n  rules, TRIGGER.CRON, 7d\n)\n✓ Deployed on HashKey Chain\n✓ FlowScript #a3f542 active`,
  },
];

function highlightCode(line: string): string {
  const tokens = [
    { regex: /(\/\/.+$)/g, class: "text-muted-foreground/50" },
    { regex: /(".*?"|'.*?')/g, class: "text-green-400" },
    { regex: /\b(rules|trigger|await|const|type)\b/g, class: "text-foreground" },
    { regex: /(\.\w+)/g, class: "text-primary" },
    { regex: /([{}()\[\]:;,])/g, class: "text-muted-foreground/70" },
  ];

  let result = line;
  const placeholders: string[] = [];

  tokens.forEach((token, idx) => {
    result = result.replace(token.regex, (match) => {
      const id = `__PLACEHOLDER_${idx}_${placeholders.length}__`;
      placeholders.push(`<span class="${token.class}">${match}</span>`);
      return id;
    });
  });

  placeholders.forEach((html, idx) => {
    const id = new RegExp(`__PLACEHOLDER_\\d+_${idx}__`, "g");
    result = result.replace(id, html);
  });

  return result;
}

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative py-32 overflow-hidden"
      style={{ background: "oklch(0.18 0.02 260 / 0.3)" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-20">
          <p
            className="text-sm font-mono mb-3"
            style={{ color: "oklch(0.85 0.2 130)" }}
          >
            // HOW IT WORKS
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
            <span className="block">Three steps to</span>
            <span className="block text-gradient-lime">payment flow.</span>
          </h2>
        </div>

        {/* Main content */}
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Steps list */}
          <div className="space-y-2">
            {steps.map((step) => (
              <button
                key={step.number}
                type="button"
                onClick={() => setActiveStep(parseInt(step.number) - 1)}
                className="w-full text-left p-6 rounded-xl border transition-all duration-300"
                style={{
                  background:
                    activeStep === parseInt(step.number) - 1
                      ? "oklch(0.12 0.02 260)"
                      : "transparent",
                  borderColor:
                    activeStep === parseInt(step.number) - 1
                      ? "oklch(0.85 0.2 130 / 0.5)"
                      : "transparent",
                }}
              >
                <div className="flex items-start gap-4">
                  <span
                    className="font-mono text-sm transition-colors"
                    style={{
                      color:
                        activeStep === parseInt(step.number) - 1
                          ? "oklch(0.85 0.2 130)"
                          : "oklch(0.55 0.03 240)",
                    }}
                  >
                    {step.number}
                  </span>
                  <div className="flex-1">
                    <h3
                      className="text-lg font-semibold mb-1"
                      style={{ color: "oklch(0.96 0.005 240)" }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed transition-colors"
                      style={{ color: "oklch(0.55 0.03 240)" }}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                {activeStep === parseInt(step.number) - 1 && (
                  <div className="mt-4 ml-8">
                    <div
                      className="h-0.5 rounded-full overflow-hidden"
                      style={{ background: "oklch(0.25 0.02 260)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: "100%",
                          background: "oklch(0.85 0.2 130)",
                          animation: "progress 4s linear",
                        }}
                      />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Code display */}
          <div className="lg:sticky lg:top-32">
            <div
              className="rounded-xl overflow-hidden border"
              style={{
                background: "oklch(0.12 0.02 260)",
                borderColor: "oklch(0.25 0.02 260)",
              }}
            >
              {/* Window chrome */}
              <div
                className="px-4 py-3 border-b flex items-center gap-3"
                style={{
                  borderColor: "oklch(0.25 0.02 260)",
                  background: "oklch(0.18 0.02 260 / 0.3)",
                }}
              >
                <div className="flex gap-1.5">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: "oklch(0.25 0.02 260)" }}
                  />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: "oklch(0.25 0.02 260)" }}
                  />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: "oklch(0.25 0.02 260)" }}
                  />
                </div>
                <span
                  className="text-xs font-mono"
                  style={{ color: "oklch(0.55 0.03 240)" }}
                >
                  payfi-flow.ts
                </span>
              </div>

              {/* Code content */}
              <div
                className="p-6 font-mono text-sm min-h-[200px]"
                style={{ color: "oklch(0.55 0.03 240)" }}
              >
                <pre>
                  {steps[activeStep].code.split("\n").map((line, i) => (
                    <div
                      key={`${activeStep}-${i}`}
                      className="leading-relaxed"
                      style={{
                        animation: "fadeIn 0.3s ease forwards",
                        animationDelay: `${i * 50}ms`,
                      }}
                    >
                      <span
                        className="select-none w-6 inline-block"
                        style={{ color: "oklch(0.25 0.02 260)" }}
                      >
                        {i + 1}
                      </span>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: highlightCode(line),
                        }}
                      />
                    </div>
                  ))}
                </pre>
              </div>

              {/* Output */}
              <div
                className="border-t p-4 font-mono text-xs"
                style={{
                  borderColor: "oklch(0.25 0.02 260)",
                  background: "oklch(0.18 0.02 260 / 0.2)",
                }}
              >
                <div
                  className="flex items-center gap-2"
                  style={{ color: "oklch(0.85 0.2 130)" }}
                >
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ background: "oklch(0.85 0.2 130)" }}
                  />
                  Ready
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}
