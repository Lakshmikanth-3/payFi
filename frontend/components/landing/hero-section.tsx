"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Zap, Shield, Brain, Activity } from "lucide-react";
import { AsciiWave } from "./ascii-wave";

const stats = [
  { value: "Natural", label: "language payments.", company: "INTERFACE", icon: <Brain size={16} /> },
  { value: "0 Gas", label: "optimization.", company: "EFFICIENCY", icon: <Zap size={16} /> },
  { value: "100%", label: "on-chain execution.", company: "SETTLEMENT", icon: <Shield size={16} /> },
  { value: "24/7", label: "autonomous flows.", company: "RELIABILITY", icon: <Activity size={16} /> },
];

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-20">
      {/* Subtle grid */}
      <div className="absolute inset-0 grid-pattern opacity-50" />
      
      {/* ASCII Wave full width and height */}
      <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
        <AsciiWave className="w-full h-full" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-24">
        {/* Badge */}
        <div 
          className={`flex justify-center mb-10 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border bg-primary/5 border-primary/20">
            <div className="w-2 h-2 rounded-full bg-primary glow-subtle" />
            <span className="text-xs font-bold tracking-widest uppercase text-primary">
              Live on HashKey Testnet
            </span>
          </div>
        </div>
        
        {/* Headline */}
        <div className="text-center max-w-5xl mx-auto mb-10">
          <h1 
            className={`text-5xl md:text-7xl font-semibold tracking-tight leading-[0.95] mb-8 transition-all duration-700 delay-100 lg:text-7xl ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ fontFamily: 'var(--font-geist-pixel), monospace' }}
          >
            <span className="text-balance">Say it. Ship it.</span>
            <br />
            <span className="text-balance text-primary">Done.</span>
          </h1>
          
          <p 
            className={`text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            The world's first Natural Language Payment Programming Protocol.
            Describe what you want in plain English — the AI deploys it on-chain instantly.
          </p>
        </div>
        
        {/* CTAs */}
        <div 
          className={`flex flex-col sm:flex-row items-center justify-center gap-3 mb-20 transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Link 
            href="/create"
            className="bg-foreground hover:bg-foreground/90 text-background px-6 h-11 text-sm font-medium group inline-flex items-center gap-2 rounded-md transition-all"
          >
            Start Sending Payments
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link 
            href="/programs"
            className="h-11 px-6 text-sm font-medium border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 rounded-md inline-flex items-center transition-all"
          >
            View Programs
          </Link>
        </div>
        
        {/* Stats with company logos style */}
        <div 
          className={`grid grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden card-shadow transition-all duration-700 delay-400 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {stats.map((stat) => (
            <div key={stat.company} className="p-6 lg:p-8 flex justify-between min-h-[140px] bg-black shadow-none lg:py-8 flex-col">
              <div>
                <span className="text-xl lg:text-2xl font-semibold">{stat.value}</span>
                <span className="text-muted-foreground text-sm lg:text-base"> {stat.label}</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground/60 tracking-widest mt-4">
                {stat.icon}
                {stat.company}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
