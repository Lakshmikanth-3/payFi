'use client';
import { useState, useEffect } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, Filter } from 'lucide-react';

const EXPLORERBASE = 'https://testnet-explorer.hsk.xyz';
const PAGE_SIZE = 10;

interface TxRow {
  hash: string;
  timestamp: string;
  type: 'MANUAL' | 'AUTO' | 'SCHEDULED';
  from: string;
  to: string;
  value: string;
  token: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  gasUsed?: string;
  blockNumber?: string;
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  SUCCESS: { bg: 'oklch(0.85 0.2 130 / 0.1)', color: 'oklch(0.85 0.2 130)' },
  PENDING: { bg: 'oklch(0.85 0.18 90 / 0.1)', color: 'oklch(0.85 0.18 90)' },
  FAILED: { bg: 'oklch(0.55 0.22 25 / 0.1)', color: 'oklch(0.55 0.22 25)' },
};

const TYPE_STYLE: Record<string, string> = {
  MANUAL: 'oklch(0.85 0.2 130)',
  AUTO: 'oklch(0.7 0.18 170)',
  SCHEDULED: 'oklch(0.6 0.12 200)',
};

export default function HistoryPage() {
  const [txs, setTxs] = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'MANUAL' | 'AUTO' | 'SCHEDULED'>('ALL');
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const eth = (window as any).ethereum;
    if (eth && eth.selectedAddress) {
      setWalletAddress(eth.selectedAddress);
    }
  }, []);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('payfi_txs') || '[]') as TxRow[];
    setTxs(stored);
    setTimeout(() => setVisible(true), 100);
  }, []);

  useEffect(() => {
    if (!walletAddress) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`${EXPLORERBASE}/api/v2/addresses/${walletAddress}/transactions`)
      .then(r => r.json())
      .then(data => {
        if (data?.items?.length) {
          const mapped: TxRow[] = data.items.map((tx: any) => ({
            hash: tx.hash,
            timestamp: tx.timestamp,
            type: 'MANUAL' as const,
            from: tx.from?.hash || '',
            to: tx.to?.hash || '',
            value: (parseInt(tx.value || '0') / 1e18).toFixed(6),
            token: 'HSK',
            status: tx.status === 'ok' ? 'SUCCESS' as const : 'FAILED' as const,
            gasUsed: tx.gas_used,
            blockNumber: tx.block?.toString(),
          }));

          setTxs(prev => {
            const combined = [...prev, ...mapped];
            const unique = Array.from(new Map(combined.map(item => [item.hash, item])).values());
            return unique.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          });
        }
      })
      .catch((err) => console.error("Explorer fetch failed", err))
      .finally(() => setLoading(false));
  }, [walletAddress]);

  const filtered = txs.filter(t => filter === 'ALL' || t.type === filter);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const stats = [
    { label: 'Total Value Sent', value: `${txs.filter(t => t.status === 'SUCCESS').reduce((a, t) => a + parseFloat(t.value || '0'), 0).toFixed(4)} HSK`, color: 'oklch(0.85 0.2 130)' },
    { label: 'Total Transactions', value: txs.length.toString(), color: 'oklch(0.7 0.18 170)' },
    { label: 'Success Rate', value: txs.length ? `${Math.round((txs.filter(t => t.status === 'SUCCESS').length / txs.length) * 100)}%` : '0%', color: 'oklch(0.6 0.12 200)' },
    { label: "Explorer Sync", value: loading ? 'Syncing...' : 'Live', color: 'oklch(0.85 0.18 90)' },
  ];

  return (
    <div className="grid-pattern noise-bg" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ marginBottom: '32px' }}>
        <h1 className="text-gradient" style={{ fontSize: '32px', letterSpacing: '-0.02em', marginBottom: '8px' }}>
          Transaction History
        </h1>
        <p style={{ color: 'oklch(0.55 0.03 240)', fontSize: '14px' }}>
          Real on-chain history and HSP settlement logs
        </p>
      </div>

      <div
        className={`transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}
      >
        {stats.map((s, i) => (
          <div key={i} className="card-shadow" style={{ background: 'oklch(0.12 0.02 260)', borderRadius: '16px', padding: '20px', border: '1px solid oklch(0.25 0.02 260)' }}>
            <div style={{ fontSize: '11px', color: 'oklch(0.55 0.03 240)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>{s.label}</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div
        className={`transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}
      >
        {(['ALL', 'MANUAL', 'AUTO', 'SCHEDULED'] as const).map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(0); }}
            style={{
              padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              background: filter === f ? 'oklch(0.85 0.2 130)' : 'oklch(0.18 0.02 260)',
              color: filter === f ? 'oklch(0.06 0.015 260)' : 'oklch(0.55 0.03 240)',
              fontWeight: 800, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >{f}</button>
        ))}
      </div>

      <div
        className={`transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} card-shadow`}
        style={{ background: 'oklch(0.12 0.02 260)', borderRadius: '20px', border: '1px solid oklch(0.25 0.02 260)', overflow: 'hidden' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr 1fr 1fr 1fr 0.7fr', padding: '14px 20px', borderBottom: '1px solid oklch(0.25 0.02 260)', gap: '12px' }}>
          {['Date/Time', 'Type', 'Recipient', 'Amount', 'Token', 'Status', 'Tx'].map(h => (
            <div key={h} style={{ fontSize: '10px', fontWeight: 800, color: 'oklch(0.55 0.03 240)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{h}</div>
          ))}
        </div>

        {paginated.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: 'oklch(0.55 0.03 240)', fontSize: '14px' }}>
            {loading ? 'Fetching from HashKey Explorer...' : 'No transactions found'}
          </div>
        )}

        {paginated.map((tx) => (
          <div key={tx.hash}>
            <div
              onClick={() => setExpanded(expanded === tx.hash ? null : tx.hash)}
              style={{
                display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr 1fr 1fr 1fr 0.7fr',
                padding: '14px 20px', gap: '12px', cursor: 'pointer', alignItems: 'center',
                borderBottom: '1px solid oklch(0.25 0.02 260 / 0.5)',
                transition: 'background 0.15s',
                background: expanded === tx.hash ? 'oklch(0.18 0.02 260 / 0.5)' : 'transparent',
              }}
            >
              <div style={{ fontSize: '12px', color: 'oklch(0.55 0.03 240)' }}>
                {new Date(tx.timestamp).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </div>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 800, color: TYPE_STYLE[tx.type], background: `${TYPE_STYLE[tx.type]}18`, padding: '3px 8px', borderRadius: '6px' }}>
                  {tx.type}
                </span>
              </div>
              <div style={{ fontSize: '12px', fontFamily: 'var(--font-jetbrains), monospace', color: 'oklch(0.6 0.03 240)' }}>
                {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'oklch(0.96 0.005 240)' }}>{tx.value}</div>
              <div style={{ fontSize: '11px', color: 'oklch(0.55 0.03 240)', fontWeight: 700 }}>{tx.token}</div>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 800, color: STATUS_STYLE[tx.status].color, background: STATUS_STYLE[tx.status].bg, padding: '3px 8px', borderRadius: '6px' }}>
                  {tx.status}
                </span>
              </div>
              <div>
                <a
                  href={`${EXPLORERBASE}/tx/${tx.hash}`}
                  target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  style={{ fontSize: '11px', color: 'oklch(0.7 0.18 170)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}
                >
                  View <ExternalLink size={11} />
                </a>
              </div>
            </div>
            {expanded === tx.hash && (
              <div style={{ padding: '16px 20px', background: 'oklch(0.18 0.02 260 / 0.3)', borderBottom: '1px solid oklch(0.25 0.02 260)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  {[
                    { label: 'Full Tx Hash', value: tx.hash },
                    { label: 'Block', value: tx.blockNumber || 'N/A' },
                    { label: 'Sender', value: tx.from },
                  ].map((item, i) => (
                    <div key={i}>
                      <div style={{ fontSize: '10px', color: 'oklch(0.55 0.03 240)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>{item.label}</div>
                      <div style={{ fontSize: '11px', fontFamily: 'var(--font-jetbrains), monospace', color: 'oklch(0.6 0.03 240)', wordBreak: 'break-all' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ padding: '8px 20px', borderRadius: '10px', border: '1px solid oklch(0.25 0.02 260)', background: 'transparent', color: page === 0 ? 'oklch(0.25 0.02 260)' : 'oklch(0.6 0.03 240)', cursor: page === 0 ? 'default' : 'pointer', fontWeight: 700, fontSize: '12px' }}>← Previous</button>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: 'oklch(0.55 0.03 240)' }}>Page {page + 1} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} style={{ padding: '8px 20px', borderRadius: '10px', border: '1px solid oklch(0.25 0.02 260)', background: 'transparent', color: page === totalPages - 1 ? 'oklch(0.25 0.02 260)' : 'oklch(0.6 0.03 240)', cursor: page === totalPages - 1 ? 'default' : 'pointer', fontWeight: 700, fontSize: '12px' }}>Next →</button>
        </div>
      )}
    </div>
  );
}
