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
    <div className="card-shadow" style={{
      background: 'oklch(0.12 0.02 260)',
      border: '1px solid oklch(0.25 0.02 260)',
      borderRadius: '20px',
      padding: '20px',
      marginTop: '16px',
    }}>
      <div style={{ fontSize: '10px', fontWeight: 800, color: 'oklch(0.55 0.03 240)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '12px' }}>
        Execution Mode
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {/* MANUAL card */}
        <button
          onClick={() => handleChange('MANUAL')}
          style={{
            background: mode === 'MANUAL' ? 'oklch(0.85 0.2 130 / 0.08)' : 'oklch(0.18 0.02 260 / 0.3)',
            border: `1.5px solid ${mode === 'MANUAL' ? 'oklch(0.85 0.2 130)' : 'oklch(0.25 0.02 260)'}`,
            boxShadow: mode === 'MANUAL' ? '0 0 20px oklch(0.85 0.2 130 / 0.15)' : 'none',
            borderRadius: '14px',
            padding: '16px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.3s cubic-bezier(0.34,1.2,0.64,1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: mode === 'MANUAL' ? 'oklch(0.85 0.2 130 / 0.15)' : 'oklch(0.18 0.02 260)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: mode === 'MANUAL' ? 'oklch(0.85 0.2 130)' : 'oklch(0.55 0.03 240)',
            }}>
              <User size={14} />
            </div>
            <span style={{
              fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: mode === 'MANUAL' ? 'oklch(0.85 0.2 130)' : 'oklch(0.55 0.03 240)',
            }}>Manual</span>
          </div>
          <p style={{ fontSize: '11px', color: 'oklch(0.55 0.03 240)', lineHeight: 1.5, margin: 0 }}>
            You confirm every transaction
          </p>
          {mode === 'MANUAL' && (
            <div style={{ marginTop: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'oklch(0.85 0.2 130 / 0.15)', borderRadius: '6px', padding: '3px 8px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'oklch(0.85 0.2 130)' }} />
              <span style={{ fontSize: '9px', fontWeight: 800, color: 'oklch(0.85 0.2 130)', letterSpacing: '0.1em' }}>SELECTED</span>
            </div>
          )}
        </button>

        {/* AUTO card */}
        <button
          onClick={() => handleChange('AUTO')}
          style={{
            background: mode === 'AUTO' ? 'oklch(0.7 0.18 170 / 0.08)' : 'oklch(0.18 0.02 260 / 0.3)',
            border: `1.5px solid ${mode === 'AUTO' ? 'oklch(0.7 0.18 170)' : 'oklch(0.25 0.02 260)'}`,
            boxShadow: mode === 'AUTO' ? '0 0 20px oklch(0.7 0.18 170 / 0.15)' : 'none',
            borderRadius: '14px',
            padding: '16px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.3s cubic-bezier(0.34,1.2,0.64,1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: mode === 'AUTO' ? 'oklch(0.7 0.18 170 / 0.15)' : 'oklch(0.18 0.02 260)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: mode === 'AUTO' ? 'oklch(0.7 0.18 170)' : 'oklch(0.55 0.03 240)',
            }}>
              <Zap size={14} />
            </div>
            <span style={{
              fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: mode === 'AUTO' ? 'oklch(0.7 0.18 170)' : 'oklch(0.55 0.03 240)',
            }}>Auto</span>
          </div>
          <p style={{ fontSize: '11px', color: 'oklch(0.55 0.03 240)', lineHeight: 1.5, margin: 0 }}>
            Agent executes automatically
          </p>
          {mode === 'AUTO' && (
            <div style={{ marginTop: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'oklch(0.7 0.18 170 / 0.15)', borderRadius: '6px', padding: '3px 8px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'oklch(0.7 0.18 170)' }} />
              <span style={{ fontSize: '9px', fontWeight: 800, color: 'oklch(0.7 0.18 170)', letterSpacing: '0.1em' }}>AUTONOMOUS</span>
            </div>
          )}
        </button>
      </div>

      {mode === 'AUTO' && (
        <div style={{
          marginTop: '12px', background: 'oklch(0.85 0.18 90 / 0.06)',
          border: '1px solid oklch(0.85 0.18 90 / 0.2)', borderRadius: '10px', padding: '10px 12px',
        }}>
          <p style={{ fontSize: '11px', color: 'oklch(0.85 0.18 90 / 0.9)', margin: 0, lineHeight: 1.5 }}>
            AUTO MODE: This program will execute automatically without asking. Make sure your wallet is funded.
          </p>
        </div>
      )}
    </div>
  );
}
