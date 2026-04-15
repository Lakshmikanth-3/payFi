'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';

const LIME = 'oklch(0.85 0.2 130)';
const TEAL = 'oklch(0.7 0.18 170)';
const BLUE = 'oklch(0.6 0.12 200)';

interface TxRow {
  hash: string;
  timestamp: string;
  type: string;
  value: string;
  token: string;
  to: string;
  status: string;
}

function FlowDiagram() {
  return (
    <svg viewBox="0 0 500 240" style={{ width: '100%', height: '200px' }}>
      <defs>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={TEAL} />
        </marker>
        <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={LIME} stopOpacity="0.8" />
          <stop offset="100%" stopColor={TEAL} stopOpacity="0.8" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <line x1="130" y1="120" x2="205" y2="120" stroke="url(#flowGrad)" strokeWidth="2" markerEnd="url(#arr)" />
      <line x1="305" y1="110" x2="380" y2="70" stroke={TEAL} strokeWidth="1.5" strokeDasharray="4 2" markerEnd="url(#arr)" opacity="0.7" />
      <line x1="305" y1="120" x2="380" y2="120" stroke={TEAL} strokeWidth="1.5" strokeDasharray="4 2" markerEnd="url(#arr)" opacity="0.7" />
      <line x1="305" y1="130" x2="380" y2="170" stroke={TEAL} strokeWidth="1.5" strokeDasharray="4 2" markerEnd="url(#arr)" opacity="0.7" />

      <rect x="20" y="98" width="110" height="44" rx="10" fill={`${LIME}15`} stroke={LIME} strokeWidth="1.5" filter="url(#glow)" />
      <text x="75" y="116" textAnchor="middle" fill={LIME} fontSize="9" fontWeight="800" letterSpacing="1">YOUR</text>
      <text x="75" y="130" textAnchor="middle" fill={LIME} fontSize="9" fontWeight="800" letterSpacing="1">WALLET</text>

      <rect x="205" y="96" width="100" height="48" rx="10" fill={`${TEAL}15`} stroke={TEAL} strokeWidth="1.5" filter="url(#glow)" />
      <text x="255" y="116" textAnchor="middle" fill={TEAL} fontSize="9" fontWeight="800" letterSpacing="0.5">FlowScript</text>
      <text x="255" y="132" textAnchor="middle" fill={TEAL} fontSize="9" fontWeight="800" letterSpacing="0.5">#ENGINE</text>

      {[{ y: 55, label: 'Recipient A' }, { y: 112, label: 'Recipient B' }, { y: 159, label: 'Recipient C' }].map((r, i) => (
        <g key={i}>
          <rect x="380" y={r.y} width="105" height="30" rx="8" fill="oklch(0.18 0.02 260)" stroke="oklch(0.25 0.02 260)" strokeWidth="1" />
          <text x="432" y={r.y + 19} textAnchor="middle" fill="oklch(0.6 0.03 240)" fontSize="9" fontFamily="monospace">{r.label}</text>
        </g>
      ))}

      {[0, 1, 2].map(i => (
        <circle key={i} r="4" fill={LIME} opacity="0.9" filter="url(#glow)">
          <animateMotion
            dur={`${1.5 + i * 0.3}s`}
            begin={`${i * 0.4}s`}
            repeatCount="indefinite"
            path="M130,120 L205,120"
          />
        </circle>
      ))}
    </svg>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'oklch(0.12 0.02 260)', border: '1px solid oklch(0.25 0.02 260)', borderRadius: '10px', padding: '10px 14px' }}>
      <div style={{ fontSize: '11px', color: 'oklch(0.55 0.03 240)', marginBottom: '6px' }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ fontSize: '12px', fontWeight: 700, color: p.color }}>
          {p.name}: {p.value} HSK
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [txs, setTxs] = useState<TxRow[]>([]);
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const historical = JSON.parse(localStorage.getItem('payfi_txs') || '[]') as TxRow[];
    setTxs(historical);
    setTimeout(() => setVisible(true), 100);
  }, []);

  const dailyData = useMemo(() => {
    const map: Record<string, { date: string, manual: number, auto: number }> = {};
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (29 - i));
      const key = `${d.getMonth() + 1}/${d.getDate()}`;
      return key;
    });

    last30Days.forEach(day => map[day] = { date: day, manual: 0, auto: 0 });

    txs.forEach(tx => {
      const d = new Date(tx.timestamp);
      const key = `${d.getMonth() + 1}/${d.getDate()}`;
      if (map[key] && tx.status === 'SUCCESS') {
        const val = parseFloat(tx.value) || 0;
        if (tx.type === 'AUTO') map[key].auto += val;
        else map[key].manual += val;
      }
    });

    return last30Days.map(day => map[day]);
  }, [txs]);

  const recipientData = useMemo(() => {
    const map: Record<string, number> = {};
    txs.forEach(tx => {
      if (tx.status === 'SUCCESS') {
        const addr = `${tx.to.slice(0, 6)}...${tx.to.slice(-4)}`;
        map[addr] = (map[addr] || 0) + parseFloat(tx.value);
      }
    });
    const colors = [LIME, TEAL, BLUE, '#8b5cf6', '#ec4899', '#f97316'];
    return Object.entries(map).map(([name, value], i) => ({
      name, value: parseFloat(value.toFixed(4)), color: colors[i % colors.length]
    })).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [txs]);

  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const map: Record<string, number> = {};
    txs.forEach(tx => {
      if (tx.status === 'SUCCESS') {
        const m = months[new Date(tx.timestamp).getMonth()];
        map[m] = (map[m] || 0) + parseFloat(tx.value);
      }
    });
    return months.map(m => ({ month: m, spend: parseFloat((map[m] || 0).toFixed(4)) })).filter(m => m.spend > 0);
  }, [txs]);

  const stats = useMemo(() => {
    if (txs.length === 0) return [
      { label: 'Biggest Single Payment', value: '0', color: LIME },
      { label: 'Most Paid Recipient', value: 'None', color: TEAL },
      { label: 'Average Payment Size', value: '0', color: BLUE },
      { label: 'Total Gas Spent', value: '0', color: 'oklch(0.85 0.18 90)' },
    ];

    const successful = txs.filter(t => t.status === 'SUCCESS');
    const values = successful.map(t => parseFloat(t.value));
    const max = values.length ? Math.max(...values).toFixed(4) : '0';
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = values.length ? (sum / values.length).toFixed(4) : '0';

    const rMap: Record<string, number> = {};
    successful.forEach(t => rMap[t.to] = (rMap[t.to] || 0) + 1);
    const mostPaid = Object.entries(rMap).sort((a, b) => b[1] - a[1])[0];
    const mostPaidLabel = mostPaid ? `${mostPaid[0].slice(0, 6)}...${mostPaid[0].slice(-4)}` : 'None';

    return [
      { label: 'Biggest Single Payment', value: `${max} HSK`, color: LIME },
      { label: 'Most Paid Recipient', value: mostPaidLabel, color: TEAL },
      { label: 'Average Payment Size', value: `${avg} HSK`, color: BLUE },
      { label: 'Total Gas Spent', value: 'N/A', color: 'oklch(0.85 0.18 90)' },
    ];
  }, [txs]);

  return (
    <div className="grid-pattern noise-bg" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ marginBottom: '32px' }}>
        <h1 className="text-gradient" style={{ fontSize: '32px', letterSpacing: '-0.02em', marginBottom: '8px' }}>Spend Analytics</h1>
        <p style={{ color: 'oklch(0.55 0.03 240)', fontSize: '14px' }}>Real visual breakdown of your FlowScript payment activity</p>
      </div>

      <div className={`transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '32px' }}>
        {stats.map((s, i) => (
          <div key={i} className="card-shadow" style={{ background: 'oklch(0.12 0.02 260)', borderRadius: '16px', padding: '20px', border: '1px solid oklch(0.25 0.02 260)' }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: 'oklch(0.55 0.03 240)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>{s.label}</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: s.color, fontFamily: s.label.includes('Recipient') ? 'var(--font-jetbrains), monospace' : undefined }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className={`transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} card-shadow`} style={{ background: 'oklch(0.12 0.02 260)', borderRadius: '20px', padding: '24px', border: '1px solid oklch(0.25 0.02 260)', marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', fontWeight: 800, color: 'oklch(0.96 0.005 240)', marginBottom: '20px', letterSpacing: '0.05em' }}>Daily Spend — Last 30 Days</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={dailyData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.02 260 / 0.5)" />
            <XAxis dataKey="date" stroke="oklch(0.25 0.02 260)" tick={{ fontSize: 10, fill: 'oklch(0.55 0.03 240)' }} interval={4} />
            <YAxis stroke="oklch(0.25 0.02 260)" tick={{ fontSize: 10, fill: 'oklch(0.55 0.03 240)' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px', color: 'oklch(0.55 0.03 240)', paddingTop: '12px' }} />
            <Line type="monotone" dataKey="manual" stroke={LIME} strokeWidth={2} dot={false} name="Manual" />
            <Line type="monotone" dataKey="auto" stroke={TEAL} strokeWidth={2} dot={false} name="Auto" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className={`transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div className="card-shadow" style={{ background: 'oklch(0.12 0.02 260)', borderRadius: '20px', padding: '24px', border: '1px solid oklch(0.25 0.02 260)' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: 'oklch(0.96 0.005 240)', marginBottom: '16px' }}>Spending by Recipient</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={recipientData}
                  cx="50%" cy="50%"
                  innerRadius={45} outerRadius={70}
                  dataKey="value"
                  onMouseEnter={(_, i) => setHoveredSlice(i)}
                  onMouseLeave={() => setHoveredSlice(null)}
                >
                  {recipientData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} opacity={hoveredSlice === null || hoveredSlice === i ? 1 : 0.4} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => [`${v} HSK`, 'Amount']} contentStyle={{ background: 'oklch(0.12 0.02 260)', border: '1px solid oklch(0.25 0.02 260)', borderRadius: '10px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {recipientData.length > 0 ? recipientData.map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', padding: '6px', borderRadius: '8px', background: hoveredSlice === i ? 'oklch(0.18 0.02 260 / 0.5)' : 'transparent' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '11px', color: 'oklch(0.6 0.03 240)', fontFamily: 'var(--font-jetbrains), monospace' }}>{r.name}</span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: r.color }}>{r.value} HSK</span>
                </div>
              )) : <div style={{ fontSize: '11px', color: 'oklch(0.55 0.03 240)', textAlign: 'center' }}>No recipient data</div>}
            </div>
          </div>
        </div>

        <div className="card-shadow" style={{ background: 'oklch(0.12 0.02 260)', borderRadius: '20px', padding: '24px', border: '1px solid oklch(0.25 0.02 260)' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: 'oklch(0.96 0.005 240)', marginBottom: '16px' }}>Monthly Spend Breakdown</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={monthlyData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.02 260 / 0.5)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'oklch(0.55 0.03 240)' }} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'oklch(0.55 0.03 240)' }} axisLine={false} />
              <Tooltip contentStyle={{ background: 'oklch(0.12 0.02 260)', border: '1px solid oklch(0.25 0.02 260)', borderRadius: '10px', fontSize: '12px' }} />
              <Bar dataKey="spend" fill={TEAL} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`transition-all duration-700 delay-400 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} card-shadow`} style={{ background: 'oklch(0.12 0.02 260)', borderRadius: '20px', padding: '24px', border: '1px solid oklch(0.25 0.02 260)' }}>
        <div style={{ fontSize: '13px', fontWeight: 800, color: 'oklch(0.96 0.005 240)', marginBottom: '8px' }}>Payment Flow Diagram</div>
        <div style={{ fontSize: '11px', color: 'oklch(0.55 0.03 240)', marginBottom: '16px' }}>Visualization of your real FlowScript routing</div>
        <FlowDiagram />
      </div>
    </div>
  );
}
