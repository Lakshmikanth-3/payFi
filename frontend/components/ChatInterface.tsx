'use client';
import { useState, useRef, useEffect } from 'react';
import { parsePaymentIntent, PaymentProgram } from '@/lib/parser';
import { ProgramCard } from './ProgramCard';
import { DualMode } from './DualMode';
import { ApprovalModal } from './ApprovalModal';
import { QRModal } from './QRModal';
import { WalletButton } from './WalletButton';
import { Send, Bot, User, Loader2, Sparkles, Command, QrCode, Zap, Split, Calendar, RefreshCw, Mic, MicOff } from 'lucide-react';
import { ethers } from 'ethers';
import { useWalletClient, useChainId } from 'wagmi';
import RegistryABI from '@/abis/PayFiRegistry.json';
import ExecutorABI from '@/abis/PayFiExecutor.json';
import contractsConfig from '@/config/contracts.json';

const QUICK_TEMPLATES = [
  { icon: <Send size={16} />, label: 'Send Once', desc: 'Manual tx right now', prompt: 'Send 0.0001 HSK to 0xc1654cbcc9a3cbb21e62f2609f2a5fa02da565fd', color: '#a3f542' },
  { icon: <Split size={16} />, label: 'Split Pay', desc: 'Split among multiple', prompt: 'Split 1 USDC equally between 3 friends', color: '#00e5c4' },
  { icon: <Calendar size={16} />, label: 'Schedule', desc: 'Future date or time', prompt: 'Send 5 USDC to alice.hsk on April 30th', color: '#3b82f6' },
  { icon: <RefreshCw size={16} />, label: 'Recurring', desc: 'Every week or month', prompt: 'Pay 10 USDC to bob.hsk every Monday', color: '#ffcc00' },
];

const EXPLORERBASE = 'https://testnet-explorer.hsk.xyz';
const REGISTRY_ADDR = (contractsConfig as any).networks['133']?.contracts?.registry;
if (!REGISTRY_ADDR) console.warn("Registry address missing in config!");

function renderContent(content: string): React.ReactNode {
  // Regex to match [text](url) markdown links
  const mdLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g;
  
  // First, let's substitute markdown links
  const parts: (string | React.ReactNode)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = mdLinkRegex.exec(content)) !== null) {
    // Push text before the match
    if (match.index > lastIndex) {
      parts.push(content.substring(lastIndex, match.index));
    }
    
    // Push the interactive link
    parts.push(
      <a 
        key={`link-${match.index}`} 
        href={match[2]} 
        target="_blank" 
        rel="noopener noreferrer"
        style={{ color: '#a3f542', fontWeight: 800, textDecoration: 'underline', textUnderlineOffset: '3px' }}
      >
        {match[1]} ↗
      </a>
    );
    
    lastIndex = mdLinkRegex.lastIndex;
  }
  
  // Push remaining text
  if (lastIndex < content.length) {
    const remaining = content.substring(lastIndex);
    
    // Fallback URL regex for plain links not in markdown
    const urlRegex = /(https?:\/\/[^\s\)]+)/g;
    const subParts = remaining.split(urlRegex);
    
    subParts.forEach((part, i) => {
      if (part.match(urlRegex)) {
        parts.push(
          <a 
            key={`plain-${i}`} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#a3f542', fontWeight: 700, textDecoration: 'underline', wordBreak: 'break-all' }}
          >
            {part}
          </a>
        );
      } else {
        parts.push(part);
      }
    });
  }

  return <>{parts}</>;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeProgram, setActiveProgram] = useState<PaymentProgram | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [execMode, setExecMode] = useState<'MANUAL' | 'AUTO'>('MANUAL');
  const [showApproval, setShowApproval] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [approvalRules, setApprovalRules] = useState<{ recipient: string; amount: string; token: string }[]>([]);
  const [pendingTxFn, setPendingTxFn] = useState<(() => Promise<void>) | null>(null);

  const [isListening, setIsListening] = useState(false);
  const [activeChip, setActiveChip] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
    };

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping, activeProgram]);

  const addActivity = (type: string, title: string, description: string, txHash?: string) => {
    try {
      const current = JSON.parse(localStorage.getItem('payfi_activity') || '[]');
      const item = { id: Math.random().toString(36).slice(2), type, title, description, timestamp: Date.now(), txHash };
      localStorage.setItem('payfi_activity', JSON.stringify([item, ...current].slice(0, 50)));
    } catch {}
  };

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isTyping) return;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsTyping(true);
    try {
      const program = await parsePaymentIntent(text);
      setIsTyping(false);
      if (program) {
        setActiveProgram(program);
        setMessages(prev => [...prev, { role: 'assistant', content: `🧠 Intent parsed. Review your payment program below and choose your execution mode.` }]);
        addActivity('PROGRAM_DEPLOYED', 'Program Parsed', program.summary || 'Payment program ready', undefined);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `I couldn't parse that payment. Try: "Send 0.0001 HSK to 0x..."` }]);
      }
    } catch {
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ Parse error. Please check your intent and try again.` }]);
    }
  };

  const execDeploy = async () => {
    if (!activeProgram) return;
    setIsDeploying(true);
    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) throw new Error("No crypto wallet found. Please install Metamask.");
      
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const account = await signer.getAddress();
      
      const chainIdNum = typeof chainId === 'number' ? chainId : Number(chainId);
      const networkKey = chainIdNum === 177 ? '177' : '133';
      const networkConfig = (contractsConfig as any).networks[networkKey] || (contractsConfig as any).networks['133'];
      
      const registryAddr = networkConfig.contracts.registry;
      const registryContract = new ethers.Contract(registryAddr, RegistryABI.abi, signer);

      const rulesFormatted = activeProgram.rules.map(r => {
        let recipient = r.recipient || '0x0000000000000000000000000000000000000000';
        if (!recipient.startsWith('0x') || recipient.length !== 42) recipient = '0x0000000000000000000000000000000000000000';
        
        let token = r.token;
        if (token === 'address(0)' || !token?.startsWith('0x')) token = '0x0000000000000000000000000000000000000000';
        return {
          recipient,
          amountType: r.amountType,
          fixedAmount: r.amountType === 0 ? ethers.parseUnits(r.fixedAmount || '0', 18) : BigInt(0),
          percentBps: Number(r.percentBps || 0),
          token,
        };
      });

      console.log("Targeting Registry:", registryAddr);

      // Align trigger mapping with Contract Enum: CRON=0, ON_RECEIVE=1, MANUAL=2
      const triggerTypeEnum = activeProgram.trigger.type === 'CRON' ? 0 
                            : activeProgram.trigger.type === 'ON_RECEIVE' ? 1 
                            : 2; // MANUAL is 2

      // Step 1: Register on-chain
      setMessages(prev => [...prev, { role: 'assistant', content: `🛡️ Registering FlowScript on HashKey Chain...` }]);
      
      const registerTx = await registryContract.deploy(
        rulesFormatted, 
        triggerTypeEnum, 
        BigInt(activeProgram.trigger.cronInterval || 0), 
        !!activeProgram.receiptEnabled, 
        { gasLimit: BigInt(250000) } 
      );
      
      if (!registerTx) throw new Error("Deployment transaction failed to submit");
      
      setMessages(prev => [...prev, { role: 'assistant', content: `⏳ Registering FlowScript on HashKey Chain... [Explorer](${EXPLORERBASE}/tx/${registerTx.hash})` }]);
      await registerTx.wait();
      
      const newProgram = {
        id: registerTx.hash,
        trigger: activeProgram.trigger.type,
        status: 'ACTIVE',
        rulesCount: activeProgram.rules.length,
        created: new Date().toISOString().split('T')[0],
        lastRun: '—',
        totalRuns: 0
      };
      
      const storedProgs = JSON.parse(localStorage.getItem('payfi_programs') || '[]');
      localStorage.setItem('payfi_programs', JSON.stringify([newProgram, ...storedProgs]));
      
      addActivity('PROGRAM_DEPLOYED', 'Program Deployed', `FlowScript live on-chain`, registerTx.hash);

      // Step 2: For MANUAL mode, send directly if HSK rules
      const hskRules = rulesFormatted.filter(r => r.token === '0x0000000000000000000000000000000000000000' && r.amountType === 0 && BigInt(r.fixedAmount) > BigInt(0));

      if (execMode === 'MANUAL' && hskRules.length > 0) {
        for (const rule of hskRules) {
          const amount = BigInt(rule.fixedAmount);
          const sendTx = await signer.sendTransaction({ 
            to: rule.recipient, 
            value: amount,
            gasLimit: BigInt(21000)
          });
          if (!sendTx) continue;
          
          setMessages(prev => [...prev, { role: 'assistant', content: `💸 Moving ${ethers.formatEther(amount)} HSK to recipient...` }]);
          const receipt = await sendTx.wait();
          
          setMessages(prev => [...prev, { role: 'assistant', content: `✅ Flow Success! ${ethers.formatEther(amount)} HSK delivered correctly. [View Transaction](${EXPLORERBASE}/tx/${sendTx.hash})` }]);
          
          const txRow = {
            hash: sendTx.hash,
            timestamp: new Date().toISOString(),
            type: 'MANUAL',
            from: account,
            to: rule.recipient,
            value: ethers.formatEther(amount),
            token: 'HSK',
            status: 'SUCCESS',
            gasUsed: receipt?.gasUsed?.toString() || '0',
            blockNumber: receipt?.blockNumber?.toString() || '0'
          };
          const storedTxs = JSON.parse(localStorage.getItem('payfi_txs') || '[]');
          localStorage.setItem('payfi_txs', JSON.stringify([txRow, ...storedTxs]));

          addActivity('PAYMENT_SENT', 'Payment Sent', `${ethers.formatEther(amount)} HSK sent`, sendTx.hash);
          if (typeof window !== 'undefined' && window.showToast) {
            window.showToast('SUCCESS', 'Payment Sent', `${ethers.formatEther(amount)} HSK delivered ✓`, `${EXPLORERBASE}/tx/${sendTx.hash}`);
          }
        }
      } else if (execMode === 'AUTO') {
        setMessages(prev => [...prev, { role: 'assistant', content: `🤖 Autonomous FlowScript deployed. The HSP keeper will watch for triggers and execute on-chain.` }]);
      }
      
      setActiveProgram(null);
      setExecMode('MANUAL');
      setShowApproval(false);
    } catch (e: any) {
      setShowApproval(false);
      setIsDeploying(false);
      console.error("Exec error details:", e);
      
      let msg = "Transaction Failed";
      let errorDesc = e.message || "Unknown error";

      if (e.code === 'ACTION_REJECTED' || (e.message && e.message.includes('user rejected'))) {
        msg = "Transaction Cancelled";
        errorDesc = "You rejected the request in your wallet.";
      } else if (e.message?.toLowerCase().includes('insufficient funds')) {
        msg = "Insufficient HSK Balance";
        errorDesc = "You don't have enough HSK to cover the payment + gas fee.";
      } else if (e.message?.toLowerCase().includes('chain id mismatch') || (chainId !== 133 && chainId !== 0x85)) {
        msg = "Wrong Network Selected";
        errorDesc = "Please switch your wallet to HashKey Testnet (ID: 133)";
      } else if (e.code === 'UNPREDICTABLE_GAS_LIMIT') {
        msg = "Gas Estimation Failed";
        errorDesc = "The transaction might fail on-chain. This usually happens if the contract logic reverts.";
      } else if (e.reason) {
        msg = e.reason;
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ **${msg}**\n\n**Reason:** ${errorDesc}\n\n*Technical info: ${e.code || 'GenericError'}*` 
      }]);

      addActivity('TX_REJECTED', msg, errorDesc.slice(0, 80));
      
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('FAILED', msg, errorDesc.slice(0, 60));
      }
    } finally {
      setIsDeploying(false);
    }
  };

  const handleDeploy = async () => {
    if (!activeProgram) return;
    if (!walletClient) { alert('Please connect your wallet first.'); return; }

    if (execMode === 'MANUAL') {
      // Build approval rules for modal
      const rules = activeProgram.rules.map(r => ({
        recipient: r.recipient || '',
        amount: `${r.fixedAmount || ''}`,
        token: r.tokenSymbol || 'HSK',
      }));
      setApprovalRules(rules);
      setPendingTxFn(() => execDeploy);
      setShowApproval(true);
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('APPROVAL', 'Action Required', 'Open the approval modal to confirm payment', undefined, 6000);
      }
    } else {
      await execDeploy();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0b0c0f' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(11,12,15,0.9)', backdropFilter: 'blur(20px)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(163,245,66,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(163,245,66,0.2)' }}>
            <Bot size={18} style={{ color: '#a3f542' }} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 900, color: '#fff', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              PayFi AI <Sparkles size={11} style={{ color: '#00e5c4' }} />
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>HSP Settlement Engine</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#a3f542', boxShadow: '0 0 6px rgba(163,245,66,0.6)' }} />
            <span style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Live</span>
          </div>
        </div>
        <WalletButton onAddressChange={setWalletAddress} />
      </div>

      {/* Messages */}
      <div className="scrollbar-premium" style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {messages.length === 0 && !activeProgram && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '12px' }}>PayFi Protocol</div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', marginBottom: '8px', letterSpacing: '-0.02em' }}>Natural Language Payments</h1>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.6, maxWidth: '360px', margin: '0 0 8px' }}>
              Type any payment instruction in plain English. Choose Manual or Auto mode for every program.
            </p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: '4px' }}>Speak to deploy on-chain</p>
          </div>
        )}

        {messages.map((m, idx) => (
          <div key={idx} style={{ 
            display: 'flex', gap: '12px', 
            flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
            animation: 'fadeInUp 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards'
          }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '12px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: m.role === 'user' ? 'rgba(163,245,66,0.1)' : 'rgba(0,229,196,0.1)',
              border: m.role === 'user' ? '1px solid rgba(163,245,66,0.2)' : '1px solid rgba(0,229,196,0.2)',
              color: m.role === 'user' ? '#a3f542' : '#00e5c4',
              boxShadow: m.role === 'user' ? '0 0 15px rgba(163,245,66,0.1)' : '0 0 15px rgba(0,229,196,0.1)',
            }}>
              {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
            </div>
            <div style={{
              maxWidth: '75%', padding: '16px 20px', borderRadius: '22px',
              borderTopLeftRadius: m.role === 'user' ? '22px' : '6px',
              borderTopRightRadius: m.role === 'user' ? '6px' : '22px',
              background: m.role === 'user' ? 'rgba(163,245,66,0.06)' : 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(10px)',
              border: m.role === 'user' ? '1px solid rgba(163,245,66,0.15)' : '1px solid rgba(255,255,255,0.08)',
              fontSize: '14px', color: m.role === 'user' ? '#fff' : 'rgba(255,255,255,0.9)', 
              lineHeight: 1.6,
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}>
              {renderContent(m.content)}
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', animation: 'fadeIn 0.3s ease forwards' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}>
              <Bot size={18} />
            </div>
            <div style={{ 
              padding: '16px 20px', borderRadius: '22px', borderTopLeftRadius: '6px', 
              background: 'rgba(163,245,66,0.03)', border: '1px solid rgba(163,245,66,0.1)', 
              display: 'flex', alignItems: 'center', gap: '12px',
              boxShadow: '0 0 20px rgba(163,245,66,0.05)'
            }}>
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#a3f542', letterSpacing: '0.15em', textTransform: 'uppercase' }}>AI is thinking...</span>
            </div>
          </div>
        )}

        {activeProgram && !isTyping && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(163,245,66,0.1)', border: '1px solid rgba(163,245,66,0.2)', color: '#a3f542' }}>
              <Bot size={16} />
            </div>
            <div style={{ flex: 1, maxWidth: '90%' }}>
              <ProgramCard program={activeProgram} onDeploy={handleDeploy} isDeploying={isDeploying} />
              <DualMode mode={execMode} onChange={setExecMode} />
              <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  style={{
                    flex: 1, padding: '13px 20px',
                    background: execMode === 'MANUAL' ? 'linear-gradient(135deg,#a3f542,#6fcd00)' : 'linear-gradient(135deg,#00e5c4,#009e89)',
                    border: 'none', borderRadius: '14px',
                    fontSize: '12px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: '#000', cursor: isDeploying ? 'wait' : 'pointer',
                    opacity: isDeploying ? 0.7 : 1,
                    transition: 'all 0.3s cubic-bezier(0.34,1.2,0.64,1)',
                    boxShadow: execMode === 'MANUAL' ? '0 8px 24px rgba(163,245,66,0.25)' : '0 8px 24px rgba(0,229,196,0.25)',
                  }}
                >
                  {isDeploying ? '⏳ Deploying...' : execMode === 'MANUAL' ? '✓ Deploy with Manual Approval →' : '🤖 Deploy as Autonomous Program →'}
                </button>
                <button
                  onClick={() => setActiveProgram(null)}
                  disabled={isDeploying}
                  style={{ padding: '13px 16px', background: 'rgba(255,77,77,0.08)', border: '1px solid rgba(255,77,77,0.2)', borderRadius: '14px', color: '#ff4d4d', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                >Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick Templates */}
      <div style={{ padding: '0 24px 12px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', flexShrink: 0 }}>
        {QUICK_TEMPLATES.map((t, i) => (
          <button
            key={i}
            onClick={() => setActiveChip(i)}
            className={`template-chip ${activeChip === i ? 'active-chip' : ''}`}
            style={{
              padding: '10px 12px', borderRadius: '12px',
              background: activeChip === i ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)', 
              border: activeChip === i ? `1px solid ${t.color}` : `1px solid rgba(255,255,255,0.06)`,
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex', flexDirection: 'column', gap: '4px',
              position: 'relative', overflow: 'hidden',
              boxShadow: activeChip === i ? `0 0 20px ${t.color}30` : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', color: t.color }}>
              {t.icon}
              <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t.label}</span>
            </div>
            <p style={{ fontSize: '10px', color: activeChip === i ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)', margin: 0 }}>{t.desc}</p>
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '12px 24px 24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '8px 8px 8px 16px' }}>
          <Command size={16} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Send 0.0001 HSK to 0x... or describe a payment flow"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontSize: '13px', color: '#fff',
            }}
          />
          <button
            onClick={() => setShowQR(true)}
            title="QR Code"
            style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}
          ><QrCode size={16} /></button>

          <button
            onClick={toggleListening}
            title={isListening ? "Listening..." : "Voice Input"}
            style={{ 
              width: '36px', height: '36px', borderRadius: '10px', 
              background: isListening ? 'rgba(163,245,66,0.1)' : 'rgba(255,255,255,0.04)', 
              border: isListening ? '1px solid rgba(163,245,66,0.3)' : '1px solid rgba(255,255,255,0.08)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              cursor: 'pointer', color: isListening ? '#a3f542' : 'rgba(255,255,255,0.5)', 
              flexShrink: 0,
              animation: isListening ? 'pulse-glow 1.5s infinite' : 'none'
            }}
          >
            {isListening ? <Mic size={16} /> : <Mic size={16} />}
          </button>

          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            style={{
              width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
              background: inputValue.trim() ? 'linear-gradient(135deg,#a3f542,#6fcd00)' : 'rgba(255,255,255,0.04)',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: inputValue.trim() ? 'pointer' : 'default',
              color: inputValue.trim() ? '#000' : 'rgba(255,255,255,0.2)',
              transition: 'all 0.2s',
            }}
          ><Send size={15} /></button>
        </div>
      </div>

      {/* Modals */}
      {showApproval && (
        <ApprovalModal
          rules={approvalRules}
          onConfirm={execDeploy}
          onReject={() => setShowApproval(false)}
        />
      )}

      {showQR && (
        <QRModal
          walletAddress={walletAddress}
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  );
}
