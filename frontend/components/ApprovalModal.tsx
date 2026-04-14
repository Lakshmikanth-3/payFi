'use client';
import { useState, useEffect, useRef } from 'react';
import { X, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { ethers } from 'ethers';

interface PaymentRule {
  recipient: string;
  amount: string;
  token: string;
}

interface ApprovalModalProps {
  programId?: string;
  rules: PaymentRule[];
  onConfirm: () => Promise<void>;
  onReject: () => void;
  timeoutSeconds?: number;
}

export function ApprovalModal({ programId, rules, onConfirm, onReject, timeoutSeconds = 60 }: ApprovalModalProps) {
  const [countdown, setCountdown] = useState(timeoutSeconds);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'rejected'>('idle');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoReject();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleAutoReject = () => {
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast('FAILED', 'Auto-Rejected', 'Payment auto-rejected — timer expired');
    }
    onReject();
  };

  const handleConfirm = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('sending');
    try {
      await onConfirm();
      setStatus('success');
      setTimeout(onReject, 1500);
    } catch {
      setStatus('rejected');
      setTimeout(onReject, 2000);
    }
  };

  const handleReject = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast('FAILED', 'Payment Rejected', 'Transaction rejected manually');
    }
    onReject();
  };

  const progress = (countdown / timeoutSeconds) * 100;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div
        className="glow-border-anim"
        style={{
          background: '#0b0c0f',
          border: '2px solid #a3f542',
          borderRadius: '28px',
          padding: '32px',
          maxWidth: '480px',
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 40px 80px rgba(0,0,0,0.8)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <AlertTriangle style={{ color: '#a3f542' }} size={20} />
            <span style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#a3f542' }}>
              Payment Approval Required
            </span>
          </div>
          {programId && (
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              FlowScript #{programId} · Mode: MANUAL APPROVAL
            </p>
          )}
        </div>

        {/* Payment breakdown */}
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '16px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>
            Payment Breakdown
          </div>
          {rules.map((rule, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < rules.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#a3f542', fontSize: '12px' }}>→</span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>
                  {rule.recipient.slice(0, 6)}...{rule.recipient.slice(-4)}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{rule.amount}</span>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>{rule.token}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Network info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>Network</div>
            <div style={{ fontSize: '12px', color: '#fff', fontWeight: 600 }}>HashKey Chain Testnet</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>Chain ID</div>
            <div style={{ fontSize: '12px', color: '#fff', fontWeight: 600 }}>0x85 (133)</div>
          </div>
        </div>

        {/* Countdown */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Auto-rejects in</span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: countdown < 10 ? '#ff4d4d' : '#ffcc00' }}>{countdown}s</span>
          </div>
          <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
            <div style={{
              height: '100%', borderRadius: '2px',
              background: countdown < 10 ? '#ff4d4d' : '#ffcc00',
              width: `${progress}%`,
              transition: 'width 1s linear, background 0.3s',
            }} />
          </div>
        </div>

        {/* Buttons */}
        {status === 'idle' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={handleConfirm}
              style={{
                width: '100%', padding: '16px',
                background: 'linear-gradient(135deg, #a3f542, #6fcd00)',
                border: 'none', borderRadius: '14px',
                fontSize: '13px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: '#000', cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(163,245,66,0.3)',
                transition: 'all 0.3s cubic-bezier(0.34,1.2,0.64,1)',
              }}
            >
              Confirm & Execute
            </button>
            <button
              onClick={handleReject}
              style={{
                width: '100%', padding: '16px',
                background: 'transparent', border: '1.5px solid #ff4d4d',
                borderRadius: '14px', fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: '#ff4d4d', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Reject
            </button>
          </div>
        )}

        {status === 'sending' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '24px', color: 'rgba(255,255,255,0.6)' }}>
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', color: '#a3f542' }} />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Waiting for wallet confirmation...</span>
          </div>
        )}

        {status === 'success' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '24px', color: '#a3f542' }}>
            <CheckCircle size={20} />
            <span style={{ fontSize: '13px', fontWeight: 700 }}>Transaction Submitted!</span>
          </div>
        )}

        {status === 'rejected' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '24px', color: '#ff4d4d' }}>
            <X size={20} />
            <span style={{ fontSize: '13px', fontWeight: 700 }}>Transaction Rejected by Wallet</span>
          </div>
        )}
      </div>
    </div>
  );
}
