import { PaymentProgram } from "@/lib/parser";
import { Loader2, Zap, AlertCircle, ShieldCheck } from "lucide-react";

export function ProgramCard({ program, onDeploy, isDeploying }: { program: PaymentProgram, onDeploy: () => void, isDeploying: boolean }) {
   return (
      <div className="card-shadow group" style={{ background: 'oklch(0.12 0.02 260)', borderRadius: '32px', padding: '32px', border: '1px solid oklch(0.25 0.02 260)', position: 'relative', overflow: 'hidden' }}>
         {/* Premium Glow Effect */}
         <div style={{ position: 'absolute', top: '-96px', right: '-96px', width: '192px', height: '192px', background: 'oklch(0.6 0.12 200 / 0.08)', filter: 'blur(80px)', borderRadius: '9999px' }} />
         <div style={{ position: 'absolute', bottom: '-96px', left: '-96px', width: '192px', height: '192px', background: 'oklch(0.7 0.18 170 / 0.08)', filter: 'blur(80px)', borderRadius: '9999px' }} />

         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', position: 'relative', zIndex: 10 }}>
            <div>
               <div className="flex items-center gap-2 mb-2">
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'oklch(0.6 0.12 200)', boxShadow: '0 0 8px oklch(0.6 0.12 200 / 0.6)' }} />
                  <span style={{ fontSize: '10px', letterSpacing: '0.2em', fontWeight: 700, textTransform: 'uppercase', color: 'oklch(0.6 0.12 200)' }}>Payment Program</span>
               </div>
               <h3 className="text-gradient" style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '8px' }}>Generated PayFi</h3>
               <p style={{ fontSize: '14px', color: 'oklch(0.55 0.03 240)', maxWidth: '320px', marginTop: '8px', lineHeight: 1.6 }}>{program.summary}</p>
            </div>

            <div className="flex flex-col items-end">
               <div style={{ background: 'oklch(0.18 0.02 260)', border: '1px solid oklch(0.25 0.02 260)', padding: '8px 16px', borderRadius: '16px', backdropFilter: 'blur(12px)' }}>
                  <span style={{ fontSize: '10px', letterSpacing: '0.15em', fontWeight: 700, textTransform: 'uppercase', color: 'oklch(0.55 0.03 240)', display: 'block', textAlign: 'right' }}>Settlement</span>
                  <span style={{ color: 'oklch(0.7 0.18 170)', fontFamily: 'var(--font-jetbrains), monospace', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                     <Zap size={12} style={{ fill: 'oklch(0.7 0.18 170)' }} />
                     {program.trigger.type}
                  </span>
               </div>
            </div>
         </div>

         <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px', position: 'relative', zIndex: 10 }}>
            <div className="flex items-center gap-3">
               <h4 style={{ fontSize: '10px', fontWeight: 800, color: 'oklch(0.55 0.03 240)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Execution Rules</h4>
               <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to right, oklch(0.25 0.02 260), transparent)' }} />
            </div>

            {program.rules.map((rule, idx) => (
               <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderRadius: '24px', border: '1px solid oklch(0.25 0.02 260)', background: 'oklch(0.18 0.02 260 / 0.3)', transition: 'all 0.3s' }}>
                  <div className="flex items-center gap-4">
                     <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'oklch(0.18 0.02 260)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid oklch(0.25 0.02 260)' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'oklch(0.55 0.03 240)' }}>{idx + 1}</span>
                     </div>
                     <div>
                        <div style={{ fontSize: '14px', color: 'oklch(0.6 0.03 240)', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-jetbrains), monospace' }}>
                           Recipient: <span style={{ color: 'oklch(0.96 0.005 240)', cursor: 'pointer' }}>{rule.recipient.slice(0, 10)}...{rule.recipient.slice(-8)}</span>
                        </div>
                        <div style={{ fontSize: '10px', color: 'oklch(0.55 0.03 240)', marginTop: '4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{rule.description}</div>
                     </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                     <div style={{ fontSize: '20px', fontWeight: 900, color: 'oklch(0.96 0.005 240)', fontFamily: 'var(--font-jetbrains), monospace' }}>
                        {rule.amountType === 0 ? (
                           <span className="flex items-center gap-2 justify-end">
                              {rule.fixedAmount} <span style={{ color: 'oklch(0.6 0.12 200)', fontSize: '14px' }}>{rule.tokenSymbol}</span>
                           </span>
                        ) : rule.amountType === 1 ? (
                           <span className="flex items-center gap-2 justify-end">
                              {rule.percentBps / 100}% <span style={{ color: 'oklch(0.7 0.18 170)', fontSize: '14px' }}>of {rule.tokenSymbol}</span>
                           </span>
                        ) : (
                           <span style={{ color: 'oklch(0.85 0.2 130)', fontSize: '14px' }}>Equal Share</span>
                        )}
                     </div>
                     <div style={{ fontSize: '9px', color: 'oklch(0.55 0.03 240)', fontWeight: 700, letterSpacing: '0.05em', marginTop: '4px', textTransform: 'uppercase' }}>Verified</div>
                  </div>
               </div>
            ))}
         </div>

         {program.warnings && program.warnings.length > 0 && (
            <div style={{ marginBottom: '32px', padding: '20px', background: 'oklch(0.6 0.12 200 / 0.05)', border: '1px solid oklch(0.6 0.12 200 / 0.1)', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
               <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'oklch(0.6 0.12 200 / 0.5)' }} />
               <div className="flex items-center gap-3 mb-3" style={{ color: 'oklch(0.6 0.12 200)' }}>
                  <AlertCircle size={16} />
                  <strong style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 800 }}>Advisory</strong>
               </div>
               <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '16px' }}>
                  {program.warnings.map((w, idx) => (
                     <li key={idx} style={{ fontSize: '12px', color: 'oklch(0.6 0.12 200 / 0.6)' }}>
                        {w}
                     </li>
                  ))}
               </ul>
            </div>
         )}

         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '24px', borderTop: '1px solid oklch(0.25 0.02 260)', position: 'relative', zIndex: 10 }}>
            <div className="flex items-center gap-4">
               <div style={{ fontSize: '12px', fontFamily: 'var(--font-jetbrains), monospace' }}>
                  <span style={{ color: 'oklch(0.55 0.03 240)', display: 'block', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '4px' }}>Network Capacity</span>
                  <span style={{ color: 'oklch(0.6 0.03 240)', fontWeight: 700 }}>{program.estimatedGasHSK} <span style={{ color: 'oklch(0.6 0.12 200 / 0.5)' }}>HSK</span></span>
               </div>
               <div style={{ height: '32px', width: '1px', background: 'oklch(0.25 0.02 260)' }} />
               <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '9999px', background: 'oklch(0.85 0.2 130 / 0.1)', border: '1px solid oklch(0.85 0.2 130 / 0.2)' }}>
                  <ShieldCheck size={12} style={{ color: 'oklch(0.85 0.2 130)' }} />
                  <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'oklch(0.85 0.2 130)' }}>Secured</span>
               </div>
            </div>
         </div>
      </div>
   );
}
