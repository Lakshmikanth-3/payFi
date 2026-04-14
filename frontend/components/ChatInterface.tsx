"use client";
import { useState, useRef, useEffect } from 'react';
import { parsePaymentIntent, PaymentProgram } from '@/lib/parser';
import { ProgramCard } from './ProgramCard';
import { Send, Bot, User, Loader2, Sparkles, Command, ExternalLink } from 'lucide-react';
import { ethers } from 'ethers';
import { useWalletClient, useChainId } from 'wagmi';
import RegistryABI from '@/abis/PayFiRegistry.json';
import ExecutorABI from '@/abis/PayFiExecutor.json';
import contractsConfig from '@/config/contracts.json';

export function ChatInterface() {
  const renderMessageContent = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return content.split(urlRegex).map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 font-bold hover:text-blue-300 underline underline-offset-4 decoration-blue-500/50 transition-colors inline-block max-w-full truncate align-bottom"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const [messages, setMessages] = useState<{role: 'user'|'assistant', content: string}[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeProgram, setActiveProgram] = useState<PaymentProgram | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, activeProgram]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const newMessages = [...messages, { role: 'user' as const, content: inputValue }];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      const historyMsg = newMessages.map(m => ({
          role: m.role, 
          content: m.content
      }));
      
      const program = await parsePaymentIntent(inputValue, historyMsg.slice(0, -1));
      
      setMessages([...newMessages, { role: 'assistant', content: "Protocol analyzed. I've structured your payment logic for the HashKey Settlement Protocol. Review the secure program card below." }]);
      setActiveProgram(program);

    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: "Emergency: Analysis failed. Please refine your instruction." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleDeploy = async () => {
    if (!activeProgram) return;
    if (!walletClient) {
       alert("Network Connection Required: Please link your OKX or Metamask wallet.");
       return;
    }

    setIsDeploying(true);
    const explorerBase = "https://testnet-explorer.hsk.xyz";

    try {
       const provider = new ethers.BrowserProvider(walletClient as unknown as ethers.Eip1193Provider);
       const signer = await provider.getSigner();

       const chainIdKey = chainId.toString() as keyof typeof contractsConfig.networks;
       const networkConfig = contractsConfig.networks[chainIdKey] || contractsConfig.networks["133"];

       const registryContract = new ethers.Contract(
          networkConfig.contracts.registry,
          RegistryABI.abi,
          signer
       );

       const rulesFormatted = activeProgram.rules.map(r => {
          const recipient = r.recipient?.startsWith('0x') && r.recipient.length === 42
             ? r.recipient
             : "0x0000000000000000000000000000000000000000";

          let token = r.token;
          if (token === "address(0)" || !token?.startsWith('0x')) {
             token = "0x0000000000000000000000000000000000000000";
          }

          return {
             recipient,
             amountType: r.amountType,
             fixedAmount: r.amountType === 0 ? ethers.parseUnits(r.fixedAmount || "0", 18) : BigInt(0),
             percentBps: r.amountType === 1 ? r.percentBps : 0,
             token
          };
       });

       const triggerTypeEnum = activeProgram.trigger.type === 'CRON' ? 0 : activeProgram.trigger.type === 'ON_RECEIVE' ? 1 : 2;

       // Step 1: Register intent on-chain (no value — avoids executor forwarding issues)
       const registerTx = await registryContract.deploy(
          rulesFormatted,
          triggerTypeEnum,
          activeProgram.trigger.cronInterval,
          activeProgram.receiptEnabled,
          { value: BigInt(0) }
       );

       setMessages(prev => [...prev, {
          role: 'assistant',
          content: `⏳ Registering payment program on HashKey Chain... [${explorerBase}/tx/${registerTx.hash}]`
       }]);
       await registerTx.wait();

       // Step 2: For MANUAL trigger with native HSK, send directly to each recipient
       const hskRules = rulesFormatted.filter(
          r => r.token === "0x0000000000000000000000000000000000000000" && r.amountType === 0 && BigInt(r.fixedAmount) > BigInt(0)
       );

       if (triggerTypeEnum === 2 && hskRules.length > 0) {
          for (const rule of hskRules) {
             const amount = BigInt(rule.fixedAmount);
             const sendTx = await signer.sendTransaction({
                to: rule.recipient,
                value: amount,
             });

             setMessages(prev => [...prev, {
                role: 'assistant',
                content: `💸 Dispatching ${ethers.formatEther(amount)} HSK to ${rule.recipient.slice(0, 6)}...${rule.recipient.slice(-4)}...`
             }]);

             const sendReceipt = await sendTx.wait();
             setMessages(prev => [...prev, {
                role: 'assistant',
                content: `✅ Settlement Complete! ${ethers.formatEther(amount)} HSK delivered to ${rule.recipient.slice(0, 6)}...${rule.recipient.slice(-4)}. View: ${explorerBase}/tx/${sendTx.hash}`
             }]);
          }
       } else {
          setMessages(prev => [...prev, {
             role: 'assistant',
             content: `✅ PayFi Program deployed on HashKey Chain. Program will execute based on its trigger schedule.`
          }]);
       }

       setActiveProgram(null);
    } catch (e: unknown) {
       console.error(e);
       const msg = e instanceof Error ? e.message : String(e);
       setMessages(prev => [...prev, {
          role: 'assistant',
          content: `❌ Transaction failed: ${msg.slice(0, 120)}. Please check your wallet balance and network.`
       }]);
    } finally {
       setIsDeploying(false);
    }
  };

  return (
    <div className="flex flex-col h-[700px] glass-card rounded-[2.5rem] bg-black/40 overflow-hidden relative border border-white/5 group">
       
       {/* Background Accent */}
       <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>

       {/* Header */}
       <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-black/20 backdrop-blur-md relative z-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                <Bot size={20} className="text-blue-500" />
             </div>
             <div>
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                   PayFi AI <Sparkles size={12} className="text-cyan-500 animate-pulse" />
                </h2>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">HSP Settlement Engine</span>
             </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
             <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Chain Sync Active</span>
          </div>
       </div>
       
       <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-premium relative z-0">
          
          {messages.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-6 opacity-40 animate-float">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-800 flex items-center justify-center">
                   <Command size={32} />
                </div>
                <div className="text-center">
                   <p className="text-lg font-medium text-gray-400">Initialize Payment Protocol</p>
                   <p className="text-xs uppercase tracking-[0.3em] font-bold mt-2">Speak to deploy on-chain</p>
                </div>
                <div className="grid grid-cols-1 gap-3 max-w-sm w-full mt-4">
                  <div className="text-[10px] font-bold uppercase border border-white/5 bg-white/5 rounded-2xl py-3 px-4 hover:border-blue-500/30 transition-colors cursor-pointer text-center">&quot;Pay alice.hsk 100 USDC every Friday&quot;</div>
                  <div className="text-[10px] font-bold uppercase border border-white/5 bg-white/5 rounded-2xl py-3 px-4 hover:border-blue-500/30 transition-colors cursor-pointer text-center">&quot;Split incoming USDC equally among 3 devs&quot;</div>
                </div>
             </div>
          ) : (
             <>
                {messages.map((m, idx) => (
                   <div key={idx} className={`flex gap-5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-500 ${m.role === 'user' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-gray-900 border-white/5 text-gray-400 shadow-xl'}`}>
                         {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                      </div>
                      <div className={`max-w-[75%] rounded-[1.8rem] p-5 text-sm leading-relaxed transition-all duration-500 ${m.role === 'user' ? 'bg-blue-500/5 text-blue-50 rounded-tr-none border border-blue-500/10' : 'bg-white/[0.03] text-gray-300 rounded-tl-none border border-white/5 backdrop-blur-sm shadow-xl'}`}>
                         {m.content}
                      </div>
                   </div>
                ))}
                
                {activeProgram && !isTyping && (
                  <div className="flex gap-5 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                       <Bot size={18} />
                    </div>
                    <div className="max-w-[90%] w-full">
                       <ProgramCard program={activeProgram} onDeploy={handleDeploy} isDeploying={isDeploying} />
                    </div>
                  </div>
                )}

                {isTyping && (
                   <div className="flex gap-5 animate-pulse">
                      <div className="w-10 h-10 rounded-2xl bg-gray-900 border border-white/5 flex items-center justify-center shrink-0 shadow-lg">
                         <Bot size={18} className="text-gray-600" />
                      </div>
                      <div className="bg-white/[0.02] px-6 py-4 rounded-3xl rounded-tl-none border border-white/5 flex items-center gap-3 shadow-xl">
                         <Loader2 className="animate-spin text-blue-500/50" size={16} />
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Parsing Intent...</span>
                      </div>
                   </div>
                )}
             </>
          )}
          <div ref={bottomRef} />
       </div>

       {/* Input Section */}
       <div className="p-8 bg-black/40 backdrop-blur-2xl border-t border-white/5">
          <div className="relative flex items-center group/input">
             <div className="absolute left-6 text-gray-500 group-focus-within/input:text-blue-500 transition-colors">
                <Command size={18} />
             </div>
             <input 
                type="text" 
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Declare payment program..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-full py-5 pl-16 pr-20 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 shadow-inner group-hover/input:border-white/20"
             />
             <div className="absolute right-3 flex items-center gap-2">
                <button 
                   onClick={handleSend}
                   disabled={isTyping || !inputValue.trim()}
                   className="p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all duration-300 disabled:opacity-20 disabled:grayscale shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:scale-105 active:scale-95"
                >
                   <Send size={18} className="fill-white" />
                </button>
             </div>
          </div>
          <p className="mt-4 text-center text-[9px] text-gray-600 uppercase font-black tracking-[0.3em]">Encrypted Transmission · HSP Validated</p>
       </div>
    </div>
  );
}
