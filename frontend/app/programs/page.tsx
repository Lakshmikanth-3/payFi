'use client';
import { useState, useEffect } from 'react';
import { Terminal, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Program {
  id: string;
  trigger: string;
  status: 'ACTIVE' | 'PAUSED' | 'STOPPED';
  rulesCount: number;
  created: string;
  lastRun: string;
  totalRuns: number;
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'oklch(0.85 0.2 130)',
  PAUSED: 'oklch(0.85 0.18 90)',
  STOPPED: 'oklch(0.55 0.22 25)',
};
const TRIGGER_COLOR: Record<string, string> = {
  MANUAL: 'oklch(0.85 0.2 130)',
  CRON: 'oklch(0.7 0.18 170)',
  ON_RECEIVE: 'oklch(0.6 0.12 200)',
  SCHEDULED: 'oklch(0.6 0.12 200)',
};

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('payfi_programs') || '[]') as any[];
      setPrograms(stored);
    } catch { }
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <div className="grid-pattern noise-bg" style={{ padding: '40px', maxWidth: '1100px', margin: '0 auto' }}>
      <div
        className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}
      >
        <div>
          <h1 className="text-gradient" style={{ fontSize: '32px', letterSpacing: '-0.02em', marginBottom: '8px' }}>Programs</h1>
          <p style={{ color: 'oklch(0.55 0.03 240)', fontSize: '14px' }}>Monitoring your deployed FlowScript logic</p>
        </div>
        <Link href="/create">
          <Button className="premium-button flex items-center gap-2">
            <Plus size={16} />
            Create New
          </Button>
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {programs.length > 0 ? programs.map((p, idx) => (
          <div
            key={p.id}
            className="card-shadow border rounded-xl p-6 hover:border-primary/50 transition-all duration-300"
            style={{
              background: 'oklch(0.12 0.02 260)',
              borderColor: 'oklch(0.25 0.02 260)',
              display: 'grid',
              gridTemplateColumns: 'minmax(100px,1fr) 1fr 1fr 1fr 1fr',
              gap: '16px',
              alignItems: 'center',
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              transitionDelay: `${idx * 80}ms`,
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(12px)',
            }}
          >
            <div>
              <div style={{ fontSize: '10px', color: 'oklch(0.55 0.03 240)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Program</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'oklch(0.96 0.005 240)', fontFamily: 'var(--font-jetbrains), monospace' }}>#{p.id.slice(0, 6)}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'oklch(0.55 0.03 240)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Trigger</div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: TRIGGER_COLOR[p.trigger] || 'oklch(0.96 0.005 240)', background: `${TRIGGER_COLOR[p.trigger] || 'oklch(0.96 0.005 240)'}15`, padding: '3px 10px', borderRadius: '6px' }}>{p.trigger}</span>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'oklch(0.55 0.03 240)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Status</div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: STATUS_COLOR[p.status], background: `${STATUS_COLOR[p.status]}15`, padding: '3px 10px', borderRadius: '6px' }}>{p.status}</span>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'oklch(0.55 0.03 240)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Runs</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'oklch(0.96 0.005 240)' }}>{p.totalRuns || 0}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'oklch(0.55 0.03 240)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Created</div>
              <div style={{ fontSize: '12px', color: 'oklch(0.55 0.03 240)' }}>{p.created || '—'}</div>
            </div>
          </div>
        )) : (
          <div
            className="card-shadow fade-in-up border-2 border-dashed rounded-2xl p-20 text-center"
            style={{ 
              background: 'oklch(0.12 0.02 260)', 
              borderColor: 'oklch(0.25 0.02 260)' 
            }}
          >
            <Terminal size={40} style={{ color: 'oklch(0.25 0.02 260)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'oklch(0.96 0.005 240)', marginBottom: '8px' }}>No Programs Deployed</h3>
            <p style={{ color: 'oklch(0.55 0.03 240)', fontSize: '14px', maxWidth: '320px', margin: '0 auto' }}>Deploy your first FlowScript program to start automating your HashKey Chain payments.</p>
            <Link href="/create" style={{ display: 'inline-block', marginTop: '24px' }}>
              <Button variant="outline">
                Get Started
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
