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
    return <div className="w-[120px] h-[40px] bg-white/5 animate-pulse rounded-2xl" />;
  }

  if (isConnected) {
    return (
      <button 
        onClick={() => disconnect()} 
        className="bg-white/5 hover:bg-white/10 text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest border border-white/10 transition-all active:scale-95"
      >
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </button>
    );
  }

  return (
    <button 
      onClick={() => connect({ connector: connectors[0] })} 
      className="premium-button text-white px-8 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
    >
      Connect AI Wallet
    </button>
  );
}

export default function CreateFlow() {
  const chainId = useChainId();
  
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col p-4 sm:p-24 relative overflow-hidden">
       {/* Ambient Light */}
       <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
       
       <div className="max-w-5xl w-full mx-auto flex flex-col h-full gap-8 relative z-10">
           <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-white/5 pb-10">
              <div className="flex flex-col gap-4">
                 <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">
                    <ChevronLeft size={14} /> Back to Hub
                 </Link>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                       <Zap size={24} className="text-blue-500 fill-blue-500" />
                    </div>
                    <div>
                       <h1 className="text-4xl font-black tracking-tight text-white glow-text">
                         Deployment Console
                       </h1>
                       <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Configure & Initialize HSP Protocol</p>
                    </div>
                 </div>
              </div>
              
              <div className="flex flex-col sm:items-end gap-3">
                 <div className="flex items-center gap-3 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-md">
                    <Globe size={14} className="text-cyan-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                       {chainId === 177 ? "HashKey Mainnet" : "HashKey Testnet (133)"}
                    </span>
                 </div>
                 <ConnectWallet />
              </div>
           </header>
           
           <main className="flex-1">
              <ChatInterface />
           </main>

           <footer className="mt-8 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.4em] text-gray-700">
              <span>Security Level: Institutional</span>
              <span>Propulsion: Gemini 1.5 Flash</span>
           </footer>
       </div>
    </div>
  );
}
