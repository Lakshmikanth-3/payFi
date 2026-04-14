import { PaymentProgram } from "@/lib/parser";
import { Loader2, Zap, AlertCircle, ShieldCheck } from "lucide-react";

export function ProgramCard({ program, onDeploy, isDeploying }: { program: PaymentProgram, onDeploy: () => void, isDeploying: boolean }) {
  return (
    <div className="glass-card rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group border border-white/10">
      {/* Premium Glow Effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full group-hover:bg-blue-500/20 transition-all duration-700"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/10 blur-[80px] rounded-full group-hover:bg-cyan-500/20 transition-all duration-700"></div>

      <div className="flex justify-between items-start mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_#3b82f6]"></div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-400">Institutional Protocol</span>
          </div>
          <h3 className="text-3xl font-black tracking-tight text-white glow-text">Generated PayFi</h3>
          <p className="text-sm text-gray-400 max-w-sm mt-2 leading-relaxed">{program.summary}</p>
        </div>
        
        <div className="flex flex-col items-end">
           <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
             <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block text-right">Settlement</span>
             <span className="text-cyan-400 font-mono text-xs mt-1 flex items-center gap-2">
               <Zap size={12} className="fill-cyan-400" />
               {program.trigger.type}
             </span>
           </div>
        </div>
      </div>

      <div className="space-y-4 mb-8 relative z-10">
         <div className="flex items-center gap-3">
           <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Execution Rules</h4>
           <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
         </div>
         
         {program.rules.map((rule, idx) => (
            <div key={idx} className="group/rule flex flex-col sm:flex-row sm:justify-between items-start sm:items-center bg-white/[0.02] hover:bg-white/[0.05] p-5 rounded-3xl border border-white/5 transition-all duration-300">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover/rule:border-amber-500/30 transition-colors">
                    <span className="text-xs font-bold text-gray-400">{idx + 1}</span>
                  </div>
                  <div>
                     <div className="font-mono text-sm text-gray-300 flex items-center gap-2">
                       Recipient: <span className="text-white hover:text-amber-400 transition-colors cursor-pointer">{rule.recipient.slice(0, 10)}...{rule.recipient.slice(-8)}</span>
                     </div>
                     <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{rule.description}</div>
                  </div>
               </div>
               <div className="mt-4 sm:mt-0 text-right">
                  <div className="font-black font-mono text-xl text-white">
                    {rule.amountType === 0 ? (
                       <span className="flex items-center gap-2 justify-end">
                         {rule.fixedAmount} <span className="text-blue-400 text-sm">{rule.tokenSymbol}</span>
                       </span>
                    ) : rule.amountType === 1 ? (
                       <span className="flex items-center gap-2 justify-end">
                         {rule.percentBps / 100}% <span className="text-cyan-400 text-sm">of {rule.tokenSymbol}</span>
                       </span>
                    ) : (
                       <span className="text-emerald-400 text-sm">Equal Share</span>
                    )}
                  </div>
                  <div className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter mt-1">HSP Verified</div>
               </div>
            </div>
         ))}
      </div>

      {program.warnings && program.warnings.length > 0 && (
         <div className="mb-8 p-5 bg-blue-500/5 border border-blue-500/10 rounded-[1.5rem] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50"></div>
            <div className="flex items-center gap-3 mb-3 text-blue-400">
               <AlertCircle size={16} />
               <strong className="text-xs uppercase tracking-widest font-black">Settlement Advisory</strong>
            </div>
            <ul className="space-y-2">
               {program.warnings.map((w, idx) => (
                  <li key={idx} className="text-xs text-blue-300/60 pl-4 relative before:content-[''] before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-1.5 before:border before:border-blue-500/30 before:rotate-45">
                    {w}
                  </li>
               ))}
            </ul>
         </div>
      )}

      <div className="flex justify-between items-center pt-8 border-t border-white/5 relative z-10">
         <div className="flex items-center gap-4">
           <div className="text-xs font-mono">
              <span className="text-gray-500 block uppercase text-[8px] tracking-[0.2em] mb-1">Network Capacity</span>
              <span className="text-gray-300 font-bold">{program.estimatedGasHSK} <span className="text-blue-500/50">HSK</span></span>
           </div>
           <div className="h-8 w-px bg-white/5"></div>
           <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span className="text-[9px] font-black uppercase text-emerald-400 tracking-tighter">HSP Secured</span>
           </div>
         </div>
      </div>
    </div>
  );
}
