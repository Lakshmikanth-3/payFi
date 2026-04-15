"use client";
import { ChatInterface } from "@/components/ChatInterface";
import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useChainId } from "wagmi";
import Link from "next/link";
import { Zap, ChevronLeft, Globe } from "lucide-react";

function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ width: '120px', height: '40px', background: 'oklch(0.18 0.02 260)', borderRadius: '16px' }} />;
  }

  if (isConnected) {
    return (
      <button
        onClick={() => disconnect()}
        style={{
          background: 'oklch(0.18 0.02 260)',
          color: 'oklch(0.96 0.005 240)',
          padding: '10px 20px',
          borderRadius: '16px',
          fontSize: '11px',
          fontWeight: 900,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          border: '1px solid oklch(0.25 0.02 260)',
          transition: 'all 0.2s',
          cursor: 'pointer',
        }}
      >
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </button>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      className="premium-button"
      style={{
        padding: '10px 24px',
        borderRadius: '16px',
        fontSize: '11px',
        fontWeight: 900,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        cursor: 'pointer',
      }}
    >
      Connect Wallet
    </button>
  );
}

export default function CreateFlow() {
  const chainId = useChainId();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-4 sm:p-24 relative overflow-hidden grid-pattern noise-bg">
      {/* Ambient Light */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: '600px', height: '600px', background: 'oklch(0.7 0.18 170 / 0.03)', filter: 'blur(120px)', borderRadius: '9999px', transform: 'translateX(50%) translateY(-50%)' }} />

      <div className="max-w-5xl w-full mx-auto flex flex-col h-full gap-8 relative z-10">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-border/50 pb-10">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-[10px] font-black uppercase tracking-widest">
              <ChevronLeft size={14} /> Back to Hub
            </Link>
            <div className="flex items-center gap-4">
              <div className="glow-teal" style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'oklch(0.6 0.12 200 / 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid oklch(0.6 0.12 200 / 0.2)' }}>
                <Zap size={24} style={{ color: 'oklch(0.7 0.18 170)', fill: 'oklch(0.7 0.18 170)' }} />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight text-foreground glow-text">
                  Deployment Console
                </h1>
                <p style={{ fontSize: '11px', color: 'oklch(0.55 0.03 240)', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '4px' }}>Configure & Initialize Payment Program</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-3">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px', background: 'oklch(0.18 0.02 260 / 0.3)', border: '1px solid oklch(0.25 0.02 260)', borderRadius: '16px', backdropFilter: 'blur(12px)' }}>
              <Globe size={14} style={{ color: 'oklch(0.7 0.18 170)' }} />
              <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'oklch(0.55 0.03 240)' }}>
                {chainId === 177 ? "HashKey Mainnet" : "HashKey Testnet (133)"}
              </span>
            </div>
            <ConnectWallet />
          </div>
        </header>

        <main className="flex-1">
          <ChatInterface />
        </main>

        <footer className="mt-8 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground">
          <span>Security Level: Institutional</span>
          <span>Propulsion: Gemini AI</span>
        </footer>
      </div>
    </div>
  );
}
