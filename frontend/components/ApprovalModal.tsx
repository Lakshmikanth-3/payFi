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
      background: 'oklch(0.06 0.015 260 / 0.85)', backdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div
        className="card-shadow glow-subtle"
        style={{
          background: 'oklch(0.08 0.015 260)',
          border: '2px solid oklch(0.85 0.2 130)',
          borderRadius: '28px',
          padding: '32px',
          maxWidth: '480px',
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <AlertTriangle style={{ color: 'oklch(0.85 0.2 130)' }} size={20} />
            <span style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'oklch(0.85 0.2 130)' }}>
              Payment Approval Required
            </span>
          </div>
          {programId && (
            <p style={{ fontSize: '11px', color: 'oklch(0.55 0.03 240)', margin: 0 }}>
              Program #{programId?.slice(0, 8)} · Mode: MANUAL APPROVAL
            </p>
          )}
        </div>

        {/* Payment breakdown */}
        <div style={{ background: 'oklch(0.18 0.02 260 / 0.3)', borderRadius: '16px', padding: '16px', marginBottom: '20px', border: '1px solid oklch(0.25 0.02 260)' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'oklch(0.55 0.03 240)', marginBottom: '12px' }}>
            Payment Breakdown
          </div>
          {rules.map((rule, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < rules.length - 1 ? '1px solid oklch(0.25 0.02 260 / 0.5)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'oklch(0.85 0.2 130)', fontSize: '12px' }}>→</span>
                <span style={{ fontSize: '12px', color: 'oklch(0.6 0.03 240)', fontFamily: 'var(--font-jetbrains), monospace' }}>
                  {rule.recipient.slice(0, 6)}...{rule.recipient.slice(-4)}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'oklch(0.96 0.005 240)' }}>{rule.amount}</span>
                <span style={{ fontSize: '11px', color: 'oklch(0.55 0.03 240)', fontWeight: 700 }}>{rule.token}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Network info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', padding: '12px', background: 'oklch(0.18 0.02 260 / 0.3)', borderRadius: '12px', border: '1px solid oklch(0.25 0.02 260)' }}>
          <div>
            <div style={{ fontSize: '10px', color: 'oklch(0.55 0.03 240)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>Network</div>
            <div style={{ fontSize: '12px', color: 'oklch(0.96 0.005 240)', fontWeight: 600 }}>HashKey Chain Testnet</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: 'oklch(0.55 0.03 240)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>Chain ID</div>
            <div style={{ fontSize: '12px', color: 'oklch(0.96 0.005 240)', fontWeight: 600 }}>0x85 (133)</div>
          </div>
        </div>

        {/* Countdown */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: 'oklch(0.55 0.03 240)' }}>Auto-rejects in</span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: countdown < 10 ? 'oklch(0.55 0.22 25)' : 'oklch(0.85 0.18 90)' }}>{countdown}s</span>
          </div>
          <div style={{ height: '3px', background: 'oklch(0.18 0.02 260)', borderRadius: '2px' }}>
            <div style={{
              height: '100%', borderRadius: '2px',
              background: countdown < 10 ? 'oklch(0.55 0.22 25)' : 'oklch(0.85 0.18 90)',
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
              className="premium-button"
              style={{
                width: '100%', padding: '16px',
                borderRadius: '14px',
                fontSize: '13px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Confirm & Execute
            </button>
            <button
              onClick={handleReject}
              style={{
                width: '100%', padding: '16px',
                background: 'oklch(0.55 0.22 25 / 0.08)', border: '1.5px solid oklch(0.55 0.22 25 / 0.2)',
                borderRadius: '14px', fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'oklch(0.55 0.22 25)', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Reject
            </button>
          </div>
        )}

        {status === 'sending' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '24px', color: 'oklch(0.55 0.03 240)' }}>
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', color: 'oklch(0.85 0.2 130)' }} />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Waiting for wallet confirmation...</span>
          </div>
        )}

        {status === 'success' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '24px', color: 'oklch(0.85 0.2 130)' }}>
            <CheckCircle size={20} />
            <span style={{ fontSize: '13px', fontWeight: 700 }}>Transaction Submitted!</span>
          </div>
        )}

        {status === 'rejected' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '24px', color: 'oklch(0.55 0.22 25)' }}>
            <X size={20} />
            <span style={{ fontSize: '13px', fontWeight: 700 }}>Transaction Rejected by Wallet</span>
          </div>
        )}
      </div>
    </div>
  );
}
