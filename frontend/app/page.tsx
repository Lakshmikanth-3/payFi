import Link from "next/link";
import { ArrowRight, Zap, Shield, Cpu } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24 overflow-hidden relative">
      
      {/* Premium Background Elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full translate-y-1/2"></div>

      <div className="z-10 w-full max-w-5xl flex flex-col items-center text-center">
        <div className="flex items-center gap-3 mb-8 animate-float">
           <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
              <Zap size={24} className="text-blue-500 fill-blue-500" />
           </div>
           <span className="text-sm font-black uppercase tracking-[0.4em] text-blue-500/80">Next-Gen Protocol</span>
        </div>

        <h1 className="text-7xl sm:text-9xl font-black tracking-tighter text-white mb-8 glow-text">
          PayFi
        </h1>
        
        <p className="text-xl sm:text-3xl text-gray-400 mb-12 max-w-3xl font-medium leading-tight">
          The <span className="text-white">Natural Language</span> Payment Programming Protocol. 
          Built for the HashKey Settlement Layer.
        </p>
        
        <div className="flex flex-wrap justify-center gap-8 mb-16 px-6 py-4 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
             <Shield size={14} className="text-blue-500" />
             HSP Secured
           </div>
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
             <Cpu size={14} className="text-cyan-500" />
             AI-Powered Intent
           </div>
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
             <Zap size={14} className="text-blue-400" />
             Instant Settlement
           </div>
        </div>

        <Link 
          href="/create"
          className="premium-button group flex flex-row items-center gap-4 text-white px-12 py-5 rounded-[2rem] text-xl font-black uppercase tracking-widest shadow-2xl"
        >
          Initialize App
          <ArrowRight className="group-hover:translate-x-2 transition-transform" />
        </Link>

        {/* Social Proof / Trust */}
        <div className="mt-24 grid grid-cols-2 sm:grid-cols-4 gap-12 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
           <div className="text-sm font-black tracking-widest uppercase">HashKey Chain</div>
           <div className="text-sm font-black tracking-widest uppercase">HSP Layer</div>
           <div className="text-sm font-black tracking-widest uppercase">Supra Oracle</div>
           <div className="text-sm font-black tracking-widest uppercase">Gemini 1.5</div>
        </div>
      </div>

      <div className="fixed bottom-0 w-full text-center p-8 text-[10px] uppercase font-black tracking-[0.5em] text-gray-700 pointer-events-none">
        Decentralized Autonomous Payments · HSP v1.0
      </div>
    </main>
  );
}
