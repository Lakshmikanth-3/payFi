'use client';
import { useState, useEffect } from 'react';
import { Send, Clock, Shield, Zap, AlertTriangle, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'PAYMENT_SENT' | 'PROGRAM_DEPLOYED' | 'KYC_CHECK' | 'AUTO_EXECUTION' | 'APPROVAL_REQUIRED' | 'TX_REJECTED' | 'PROGRAM_PAUSED';
  title: string;
  description: string;
  timestamp: number;
  txHash?: string;
  read?: boolean;
}

const ICONS: Record<ActivityItem['type'], React.ReactNode> = {
  PAYMENT_SENT: <Send size={15} />,
  PROGRAM_DEPLOYED: <Zap size={15} />,
  KYC_CHECK: <Shield size={15} />,
  AUTO_EXECUTION: <Zap size={15} />,
  APPROVAL_REQUIRED: <AlertTriangle size={15} />,
  TX_REJECTED: <XCircle size={15} />,
  PROGRAM_PAUSED: <Clock size={15} />,
};

const COLORS: Record<ActivityItem['type'], string> = {
  PAYMENT_SENT: 'oklch(0.85 0.2 130)',
  PROGRAM_DEPLOYED: 'oklch(0.7 0.18 170)',
  KYC_CHECK: 'oklch(0.6 0.12 200)',
  AUTO_EXECUTION: 'oklch(0.7 0.18 170)',
  APPROVAL_REQUIRED: 'oklch(0.85 0.18 90)',
  TX_REJECTED: 'oklch(0.55 0.22 25)',
  PROGRAM_PAUSED: 'oklch(0.85 0.18 90)',
};

function timeAgo(ts: number): string {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ActivityPage() {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [, forceUpdate] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    localStorage.setItem('payfi_activity_last_read', Date.now().toString());
    const stored = JSON.parse(localStorage.getItem('payfi_activity') || '[]') as ActivityItem[];
    const sorted = stored.sort((a, b) => b.timestamp - a.timestamp);
    setActivity(sorted);
    setTimeout(() => setVisible(true), 100);
    const interval = setInterval(() => forceUpdate(n => n + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid-pattern noise-bg" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ marginBottom: '32px' }}>
        <h1 className="text-gradient" style={{ fontSize: '32px', letterSpacing: '-0.02em', marginBottom: '8px' }}>
          Activity Feed
        </h1>
        <p style={{ color: 'oklch(0.55 0.03 240)', fontSize: '14px' }}>
          All FlowScript events in real-time
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {activity.map((item, i) => {
          const color = COLORS[item.type];
          return (
            <div
              key={item.id}
              className={`transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{
                display: 'flex', gap: '16px', padding: '18px 0',
                borderBottom: i < activity.length - 1 ? '1px solid oklch(0.25 0.02 260 / 0.5)' : 'none',
                alignItems: 'flex-start',
                transitionDelay: `${(i + 1) * 60}ms`,
              }}
            >
              {/* Icon & timeline line */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                <div className="glow-subtle" style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: `${color}15`, border: `1px solid ${color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: color, flexShrink: 0,
                }}>
                  {ICONS[item.type]}
                </div>
                {i < activity.length - 1 && (
                  <div style={{ width: '1px', height: '20px', background: 'oklch(0.25 0.02 260 / 0.5)' }} />
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'oklch(0.96 0.005 240)' }}>{item.title}</span>
                  <span style={{ fontSize: '11px', color: 'oklch(0.55 0.03 240)', flexShrink: 0, marginLeft: '12px' }}>
                    {timeAgo(item.timestamp)}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'oklch(0.6 0.03 240)', margin: 0, lineHeight: 1.5 }}>
                  {item.description}
                </p>
                {item.txHash && (
                  <a
                    href={`https://testnet-explorer.hsk.xyz/tx/${item.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px',
                      fontSize: '11px', color: color, fontWeight: 700, textDecoration: 'none',
                    }}
                  >
                    <ExternalLink size={11} />
                    {item.txHash.slice(0, 10)}...{item.txHash.slice(-8)}
                  </a>
                )}
              </div>
            </div>
          );
        })}

        {activity.length === 0 && (
          <div style={{ padding: '64px', textAlign: 'center', color: 'oklch(0.55 0.03 240)', fontSize: '14px' }}>
            No activity yet. Start sending payments!
          </div>
        )}
      </div>
    </div>
  );
}

// Helper to add activity from anywhere
export function addActivity(item: Omit<ActivityItem, 'id' | 'timestamp'>) {
  const current = JSON.parse(localStorage.getItem('payfi_activity') || '[]');
  const newItem = { ...item, id: Math.random().toString(36).slice(2), timestamp: Date.now() };
  localStorage.setItem('payfi_activity', JSON.stringify([newItem, ...current].slice(0, 50)));
}
