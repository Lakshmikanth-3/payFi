'use client';
import { useState, useEffect } from 'react';
import { Grid, Zap, Clock, Terminal } from 'lucide-react';
import Link from 'next/link';

interface Program {
  id: string;
  trigger: string;
  status: 'ACTIVE' | 'PAUSED' | 'STOPPED';
  rulesCount: number;
  created: string;
  lastRun: string;
  totalRuns: number;
}

const STATUS_COLOR: Record<string, string> = { ACTIVE: '#a3f542', PAUSED: '#ffcc00', STOPPED: '#ff4d4d' };
const TRIGGER_COLOR: Record<string, string> = { MANUAL: '#a3f542', CRON: '#00e5c4', ON_RECEIVE: '#3b82f6', SCHEDULED: '#3b82f6' };

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('payfi_programs') || '[]') as any[];
      setPrograms(stored);
    } catch {}
  }, []);

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: '6px' }}>Programs</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Monitoring your deployed FlowScript logic</p>
        </div>
        <Link href="/create" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'linear-gradient(135deg,#a3f542,#6fcd00)', border: 'none',
          borderRadius: '12px', padding: '10px 18px', fontWeight: 800,
          fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase',
          color: '#000', textDecoration: 'none',
        }}>+ Create New</Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {programs.length > 0 ? programs.map(p => (
          <div key={p.id} style={{ background: '#1a1c24', borderRadius: '16px', padding: '20px 24px', border: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: 'minmax(100px,1fr) 1fr 1fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Program</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff', fontFamily: 'monospace' }}>#{p.id.slice(0,6)}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Trigger</div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: TRIGGER_COLOR[p.trigger] || '#fff', background: `${TRIGGER_COLOR[p.trigger] || '#fff'}15`, padding: '3px 10px', borderRadius: '6px' }}>{p.trigger}</span>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Status</div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: STATUS_COLOR[p.status], background: `${STATUS_COLOR[p.status]}15`, padding: '3px 10px', borderRadius: '6px' }}>{p.status}</span>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Runs</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>{p.totalRuns || 0}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Created</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{p.created || '—'}</div>
            </div>
          </div>
        )) : (
          <div style={{ padding: '80px', textAlign: 'center', background: '#1a1c24', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <Terminal size={40} style={{ color: 'rgba(255,255,255,0.1)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>No Programs Deployed</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', maxWidth: '300px', margin: '0 auto' }}>Deploy your first FlowScript program to start automating your HashKey Chain payments.</p>
            <Link href="/create" style={{ display: 'inline-block', marginTop: '24px', color: '#a3f542', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>Get Started →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
