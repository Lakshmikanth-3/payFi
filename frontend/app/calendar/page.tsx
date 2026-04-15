'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Clock } from 'lucide-react';

interface CalendarPayment {
  id: string;
  programId: string;
  recipient: string;
  amount: string;
  token: string;
  status: string;
  txHash?: string;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function countdown(ms: number): string {
  if (ms < 0) return "Due";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const STATUS_DOT: Record<string, string> = {
  SUCCESS: 'oklch(0.85 0.2 130)',
  COMPLETED: 'oklch(0.85 0.2 130)',
  SCHEDULED: 'oklch(0.85 0.18 90)',
  PENDING: 'oklch(0.85 0.18 90)',
  FAILED: 'oklch(0.55 0.22 25)'
};

export default function CalendarPage() {
  const [viewDate, setViewDate] = useState(new Date());
  const [selected, setSelected] = useState<string | null>(null);
  const [paymentsMap, setPaymentsMap] = useState<Record<string, CalendarPayment[]>>({});
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [, tick] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const txs = JSON.parse(localStorage.getItem('payfi_txs') || '[]') as any[];
      const map: Record<string, CalendarPayment[]> = {};
      txs.forEach(tx => {
        const date = new Date(tx.timestamp);
        const key = dateKey(date);
        if (!map[key]) map[key] = [];
        map[key].push({
          id: tx.hash,
          programId: tx.programId || 'User',
          recipient: tx.to,
          amount: tx.value,
          token: tx.token,
          status: tx.status.toUpperCase(),
          txHash: tx.hash
        });
      });
      setPaymentsMap(map);

      const programs = JSON.parse(localStorage.getItem('payfi_programs') || '[]');
      setUpcoming(programs.filter((p: any) => p.status === 'ACTIVE'));
    } catch { }
    setTimeout(() => setVisible(true), 100);
  }, []);

  useEffect(() => {
    const t = setInterval(() => tick(n => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  let startDay = new Date(firstDay);
  const dow = (firstDay.getDay() + 6) % 7;
  startDay.setDate(firstDay.getDate() - dow);

  const weeks: Date[][] = [];
  let cur = new Date(startDay);
  while (cur <= lastDay || weeks.flat().length < 35) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
    if (weeks.length >= 6) break;
  }

  const selectedPayments = selected ? (paymentsMap[selected] || []) : [];

  return (
    <div className="grid-pattern noise-bg" style={{ padding: '40px', maxWidth: '1100px', margin: '0 auto' }}>
      <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ marginBottom: '32px' }}>
        <h1 className="text-gradient" style={{ fontSize: '32px', letterSpacing: '-0.02em', marginBottom: '8px' }}>Payment Calendar</h1>
        <p style={{ color: 'oklch(0.55 0.03 240)', fontSize: '14px' }}>Real record of past and monitored upcoming FlowScript executions</p>
      </div>

      <div className={`transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        <div className="card-shadow" style={{ background: 'oklch(0.12 0.02 260)', borderRadius: '20px', padding: '24px', border: '1px solid oklch(0.25 0.02 260)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <button
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              style={{ background: 'oklch(0.18 0.02 260)', border: '1px solid oklch(0.25 0.02 260)', borderRadius: '10px', width: '36px', height: '36px', cursor: 'pointer', color: 'oklch(0.96 0.005 240)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
            >
              <ChevronLeft size={16} />
            </button>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'oklch(0.96 0.005 240)' }}>{MONTHS[month]} {year}</h2>
            <button
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              style={{ background: 'oklch(0.18 0.02 260)', border: '1px solid oklch(0.25 0.02 260)', borderRadius: '10px', width: '36px', height: '36px', cursor: 'pointer', color: 'oklch(0.96 0.005 240)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: '8px' }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '10px', fontWeight: 800, color: 'oklch(0.55 0.03 240)', letterSpacing: '0.1em', padding: '6px 0' }}>{d}</div>
            ))}
          </div>

          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px', marginBottom: '4px' }}>
              {week.map((day, di) => {
                const key = dateKey(day);
                const payments = paymentsMap[key] || [];
                const isCurrentMonth = day.getMonth() === month;
                const isToday = key === dateKey(new Date());
                const isSelected = selected === key;
                return (
                  <button
                    key={di}
                    onClick={() => setSelected(isSelected ? null : key)}
                    style={{
                      background: isSelected ? 'oklch(0.85 0.2 130 / 0.1)' : isToday ? 'oklch(0.18 0.02 260)' : 'transparent',
                      border: isSelected ? '1.5px solid oklch(0.85 0.2 130)' : isToday ? '1.5px solid oklch(0.25 0.02 260)' : '1.5px solid transparent',
                      borderRadius: '10px', padding: '8px 4px', cursor: 'pointer',
                      minHeight: '56px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                      transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: isToday ? 800 : 500, color: isCurrentMonth ? 'oklch(0.96 0.005 240)' : 'oklch(0.25 0.02 260)' }}>
                      {day.getDate()}
                    </span>
                    <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      {payments.map((p, pi) => (
                        <div key={pi} style={{ width: '6px', height: '6px', borderRadius: '50%', background: STATUS_DOT[p.status] || 'oklch(0.96 0.005 240)', boxShadow: `0 0 4px ${STATUS_DOT[p.status] || 'oklch(0.96 0.005 240)'}60` }} />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}

          <div style={{ display: 'flex', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid oklch(0.25 0.02 260)', justifyContent: 'center' }}>
            {[{ color: 'oklch(0.85 0.2 130)', label: 'Success' }, { color: 'oklch(0.85 0.18 90)', label: 'Pending' }, { color: 'oklch(0.55 0.22 25)', label: 'Failed' }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: l.color }} />
                <span style={{ fontSize: '11px', color: 'oklch(0.55 0.03 240)', fontWeight: 600 }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {selected && (
            <div className="card-shadow" style={{ background: 'oklch(0.12 0.02 260)', borderRadius: '20px', padding: '20px', border: '1px solid oklch(0.85 0.2 130 / 0.2)' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'oklch(0.85 0.2 130)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
                {new Date(selected).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
              {selectedPayments.length > 0 ? selectedPayments.map((p, i) => (
                <div key={i} style={{ background: 'oklch(0.18 0.02 260 / 0.3)', borderRadius: '12px', padding: '12px', marginBottom: '8px', border: '1px solid oklch(0.25 0.02 260 / 0.5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', color: 'oklch(0.55 0.03 240)' }}>FlowScript #{p.programId}</span>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: STATUS_DOT[p.status] || 'oklch(0.96 0.005 240)' }}>{p.status}</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'oklch(0.96 0.005 240)' }}>{p.amount} {p.token}</div>
                  <div style={{ fontSize: '11px', color: 'oklch(0.6 0.03 240)', fontFamily: 'var(--font-jetbrains), monospace', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.recipient}</div>
                  {p.txHash && (
                    <a href={`https://testnet-explorer.hsk.xyz/tx/${p.txHash}`} target="_blank" rel="noopener noreferrer" style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'oklch(0.7 0.18 170)', textDecoration: 'none', fontWeight: 700 }}>
                      <ExternalLink size={11} /> View Tx
                    </a>
                  )}
                </div>
              )) : (
                <p style={{ fontSize: '12px', color: 'oklch(0.55 0.03 240)', textAlign: 'center', padding: '20px 0' }}>No activity recorded</p>
              )}
            </div>
          )}

          <div className="card-shadow" style={{ background: 'oklch(0.12 0.02 260)', borderRadius: '20px', padding: '20px', border: '1px solid oklch(0.25 0.02 260)' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: 'oklch(0.7 0.18 170)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Upcoming Programs
            </div>
            {upcoming.length > 0 ? upcoming.map((u, i) => (
              <div key={i} style={{ padding: '12px 0', borderBottom: i < upcoming.length - 1 ? '1px solid oklch(0.25 0.02 260 / 0.5)' : 'none' }}>
                <div style={{ fontSize: '11px', color: 'oklch(0.6 0.03 240)', marginBottom: '4px', fontWeight: 600 }}>
                  FlowScript #{u.id?.slice(0, 8)}...{u.id?.slice(-8)}
                </div>
                <div style={{ fontSize: '10px', color: 'oklch(0.85 0.2 130)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{u.trigger}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={11} style={{ color: u.trigger === 'MANUAL' ? 'oklch(0.96 0.005 240)' : 'oklch(0.85 0.18 90)' }} />
                  <span style={{ fontSize: '11px', fontWeight: 800, color: u.trigger === 'MANUAL' ? 'oklch(0.96 0.005 240)' : 'oklch(0.85 0.18 90)' }}>
                    {u.trigger === 'MANUAL' ? 'Awaiting Action' : 'Monitoring Trigger...'}
                  </span>
                </div>
              </div>
            )) : <p style={{ fontSize: '12px', color: 'oklch(0.55 0.03 240)', textAlign: 'center' }}>No active background programs</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
