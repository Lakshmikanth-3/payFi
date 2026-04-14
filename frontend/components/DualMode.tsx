'use client';
import { useState, useEffect } from 'react';
import { Zap, User } from 'lucide-react';

interface DualModeProps {
  mode: 'MANUAL' | 'AUTO';
  onChange: (mode: 'MANUAL' | 'AUTO') => void;
}

export function DualMode({ mode, onChange }: DualModeProps) {
  const [animating, setAnimating] = useState(false);

  const handleChange = (newMode: 'MANUAL' | 'AUTO') => {
    if (newMode === mode) return;
    setAnimating(true);
    onChange(newMode);
    setTimeout(() => setAnimating(false), 400);
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '20px',
      padding: '16px',
      marginTop: '16px',
    }}>
      <div style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '12px' }}>
        Execution Mode
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {/* MANUAL card */}
        <button
          onClick={() => handleChange('MANUAL')}
          style={{
            background: mode === 'MANUAL' ? 'rgba(163,245,66,0.08)' : 'rgba(255,255,255,0.02)',
            border: mode === 'MANUAL' ? '1.5px solid #a3f542' : '1.5px solid rgba(255,255,255,0.08)',
            boxShadow: mode === 'MANUAL' ? '0 0 20px rgba(163,245,66,0.15)' : 'none',
            borderRadius: '14px',
            padding: '14px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.3s cubic-bezier(0.34,1.2,0.64,1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: mode === 'MANUAL' ? 'rgba(163,245,66,0.15)' : 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: mode === 'MANUAL' ? '#a3f542' : 'rgba(255,255,255,0.3)',
            }}>
              <User size={14} />
            </div>
            <span style={{
              fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: mode === 'MANUAL' ? '#a3f542' : 'rgba(255,255,255,0.5)',
            }}>Manual</span>
          </div>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.4, margin: 0 }}>
            You confirm every transaction
          </p>
          {mode === 'MANUAL' && (
            <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(163,245,66,0.15)', borderRadius: '6px', padding: '3px 8px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#a3f542' }} />
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#a3f542', letterSpacing: '0.1em' }}>SELECTED</span>
            </div>
          )}
        </button>

        {/* AUTO card */}
        <button
          onClick={() => handleChange('AUTO')}
          style={{
            background: mode === 'AUTO' ? 'rgba(0,229,196,0.08)' : 'rgba(255,255,255,0.02)',
            border: mode === 'AUTO' ? '1.5px solid #00e5c4' : '1.5px solid rgba(255,255,255,0.08)',
            boxShadow: mode === 'AUTO' ? '0 0 20px rgba(0,229,196,0.15)' : 'none',
            borderRadius: '14px',
            padding: '14px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.3s cubic-bezier(0.34,1.2,0.64,1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: mode === 'AUTO' ? 'rgba(0,229,196,0.15)' : 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: mode === 'AUTO' ? '#00e5c4' : 'rgba(255,255,255,0.3)',
            }}>
              <Zap size={14} />
            </div>
            <span style={{
              fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: mode === 'AUTO' ? '#00e5c4' : 'rgba(255,255,255,0.5)',
            }}>Auto</span>
          </div>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.4, margin: 0 }}>
            Agent executes automatically
          </p>
          {mode === 'AUTO' && (
            <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(0,229,196,0.15)', borderRadius: '6px', padding: '3px 8px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00e5c4', animation: 'ping 1s cubic-bezier(0,0,0.2,1) infinite' }} />
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#00e5c4', letterSpacing: '0.1em' }}>AUTONOMOUS</span>
            </div>
          )}
        </button>
      </div>

      {mode === 'AUTO' && (
        <div style={{
          marginTop: '12px', background: 'rgba(255,204,0,0.06)',
          border: '1px solid rgba(255,204,0,0.2)', borderRadius: '10px', padding: '10px 12px',
        }}>
          <p style={{ fontSize: '11px', color: 'rgba(255,204,0,0.9)', margin: 0, lineHeight: 1.5 }}>
            ⚡ AUTO MODE: This program will send funds automatically without asking you. Make sure your wallet is funded.
          </p>
        </div>
      )}
    </div>
  );
}
