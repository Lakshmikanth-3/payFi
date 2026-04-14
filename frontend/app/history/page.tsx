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
  SUCCESS: { bg: 'rgba(163,245,66,0.1)', color: '#a3f542' },
  PENDING: { bg: 'rgba(255,204,0,0.1)', color: '#ffcc00' },
  FAILED:  { bg: 'rgba(255,77,77,0.1)', color: '#ff4d4d' },
};

const TYPE_STYLE: Record<string, string> = {
  MANUAL: '#a3f542', AUTO: '#00e5c4', SCHEDULED: '#3b82f6',
};

export default function HistoryPage() {
  const [txs, setTxs] = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'MANUAL' | 'AUTO' | 'SCHEDULED'>('ALL');
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    const eth = (window as any).ethereum;
    if (eth && eth.selectedAddress) {
      setWalletAddress(eth.selectedAddress);
    }
  }, []);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('payfi_txs') || '[]') as TxRow[];
    setTxs(stored);
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
    { label: 'Total Value Sent', value: `${txs.filter(t => t.status === 'SUCCESS').reduce((a, t) => a + parseFloat(t.value || '0'), 0).toFixed(4)} HSK`, color: '#a3f542' },
    { label: 'Total Transactions', value: txs.length.toString(), color: '#00e5c4' },
    { label: 'Success Rate', value: txs.length ? `${Math.round((txs.filter(t => t.status==='SUCCESS').length / txs.length)*100)}%` : '0%', color: '#3b82f6' },
    { label: "Explorer Sync", value: loading ? 'Syncing...' : 'Live', color: '#ffcc00' },
  ];

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: '6px' }}>
          Transaction History
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
          Real on-chain history and HSP settlement logs
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: '#1a1c24', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>{s.label}</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {(['ALL', 'MANUAL', 'AUTO', 'SCHEDULED'] as const).map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(0); }}
            style={{
              padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              background: filter === f ? '#a3f542' : 'rgba(255,255,255,0.05)',
              color: filter === f ? '#000' : 'rgba(255,255,255,0.5)',
              fontWeight: 800, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase',
              transition: 'all 0.2s',
            }}
          >{f}</button>
        ))}
      </div>

      <div style={{ background: '#1a1c24', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr 1fr 1fr 1fr 0.7fr', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', gap: '12px' }}>
          {['Date/Time', 'Type', 'Recipient', 'Amount', 'Token', 'Status', 'Tx'].map(h => (
            <div key={h} style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{h}</div>
          ))}
        </div>

        {paginated.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
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
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                transition: 'background 0.15s',
                background: expanded === tx.hash ? 'rgba(255,255,255,0.02)' : 'transparent',
              }}
            >
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                {new Date(tx.timestamp).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </div>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 800, color: TYPE_STYLE[tx.type], background: `${TYPE_STYLE[tx.type]}18`, padding: '3px 8px', borderRadius: '6px' }}>
                  {tx.type}
                </span>
              </div>
              <div style={{ fontSize: '12px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.6)' }}>
                {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{tx.value}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>{tx.token}</div>
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
                  style={{ fontSize: '11px', color: '#00e5c4', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}
                >
                  View <ExternalLink size={11} />
                </a>
              </div>
            </div>
            {expanded === tx.hash && (
              <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.015)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  {[
                    { label: 'Full Tx Hash', value: tx.hash },
                    { label: 'Block', value: tx.blockNumber || 'N/A' },
                    { label: 'Sender', value: tx.from },
                  ].map((item, i) => (
                    <div key={i}>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>{item.label}</div>
                      <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)', wordBreak: 'break-all' }}>{item.value}</div>
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
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ padding: '8px 20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: page === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)', cursor: page === 0 ? 'default' : 'pointer', fontWeight: 700, fontSize: '12px' }}>← Previous</button>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Page {page + 1} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} style={{ padding: '8px 20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: page === totalPages - 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)', cursor: page === totalPages - 1 ? 'default' : 'pointer', fontWeight: 700, fontSize: '12px' }}>Next →</button>
        </div>
      )}
    </div>
  );
}
