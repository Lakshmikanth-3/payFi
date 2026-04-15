'use client';
import { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, LogOut, Shield, Wifi, WifiOff } from 'lucide-react';

interface WalletButtonProps {
  onAddressChange?: (address: string) => void;
}

const HSK_CHAIN = {
  chainId: '0x85',
  chainName: 'HashKey Chain Testnet',
  rpcUrls: ['https://testnet.hsk.xyz'],
  nativeCurrency: { name: 'HSK', symbol: 'HSK', decimals: 18 },
  blockExplorerUrls: ['https://testnet-explorer.hsk.xyz'],
};

const KYC_COLORS: Record<string, string> = {
  NONE: 'oklch(0.55 0.22 25)', BASIC: 'oklch(0.85 0.18 90)', ADVANCED: 'oklch(0.6 0.12 200)',
  PREMIUM: 'oklch(0.85 0.2 130)', ULTIMATE: '#c084fc',
};

export function WalletButton({ onAddressChange }: WalletButtonProps) {
  const [address, setAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [chainId, setChainId] = useState<string>('');
  const [kycLevel, setKycLevel] = useState<string>('NONE');
  const [copied, setCopied] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isCorrectChain = chainId === '0x85' || chainId === '133';

  useEffect(() => {
    const eth = (window as any).ethereum;
    if (!eth) return;

    const checkConnected = async () => {
      try {
        const accounts = await eth.request({ method: 'eth_accounts' });
        if (accounts[0]) {
          await afterConnect(accounts[0]);
        }
      } catch { }
    };
    checkConnected();

    eth.on('accountsChanged', (accounts: string[]) => {
      if (accounts[0]) afterConnect(accounts[0]);
      else setAddress('');
    });
    eth.on('chainChanged', (cid: string) => setChainId(cid));

    return () => { eth.removeAllListeners?.(); };
  }, []);

  const afterConnect = async (addr: string) => {
    setAddress(addr);
    onAddressChange?.(addr);
    const eth = (window as any).ethereum;
    try {
      const cid = await eth.request({ method: 'eth_chainId' });
      setChainId(cid);
      const bal = await eth.request({ method: 'eth_getBalance', params: [addr, 'latest'] });
      const balHsk = (parseInt(bal, 16) / 1e18).toFixed(4);
      setBalance(balHsk);
    } catch { }
  };

  const connect = async () => {
    const eth = (window as any).ethereum;
    if (!eth) { alert('No wallet detected. Please install MetaMask or OKX Wallet.'); return; }
    setConnecting(true);
    try {
      const accounts = await eth.request({ method: 'eth_requestAccounts' });
      await afterConnect(accounts[0]);
    } catch (e: any) {
      if (e.code !== 4001) alert('Connection failed: ' + e.message);
    } finally {
      setConnecting(false);
    }
  };

  const switchChain = async () => {
    const eth = (window as any).ethereum;
    try {
      await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x85' }] });
    } catch (e: any) {
      if (e.code === 4902) {
        await eth.request({ method: 'wallet_addEthereumChain', params: [HSK_CHAIN] });
      }
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const disconnect = () => {
    setAddress(''); setBalance(''); setChainId(''); setShowMenu(false);
  };

  if (!address) {
    return (
      <button
        onClick={connect}
        disabled={connecting}
        className="premium-button"
        style={{
          borderRadius: '12px',
          padding: '10px 20px',
          fontSize: '12px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          cursor: connecting ? 'wait' : 'pointer',
          opacity: connecting ? 0.7 : 1,
        }}
      >
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    );
  }

  if (!isCorrectChain) {
    return (
      <button
        onClick={switchChain}
        style={{
          background: 'oklch(0.55 0.22 25 / 0.1)', border: '1px solid oklch(0.55 0.22 25 / 0.3)',
          color: 'oklch(0.55 0.22 25)', borderRadius: '12px', padding: '10px 16px',
          fontWeight: 800, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
        }}
      >
        <WifiOff size={14} /> Wrong Network — Switch to HSK
      </button>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        style={{
          background: 'oklch(0.18 0.02 260)', border: '1px solid oklch(0.25 0.02 260)',
          borderRadius: '12px', padding: '8px 14px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '10px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'oklch(0.85 0.2 130)', boxShadow: '0 0 8px oklch(0.85 0.2 130 / 0.6)' }} />
        <span style={{ fontSize: '12px', fontFamily: 'var(--font-jetbrains), monospace', color: 'oklch(0.96 0.005 240)', fontWeight: 600 }}>
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <span style={{ fontSize: '11px', color: 'oklch(0.55 0.03 240)', fontWeight: 600 }}>
          {balance} HSK
        </span>
      </button>

      {showMenu && (
        <div className="card-shadow" style={{
          position: 'absolute', top: '100%', right: 0, marginTop: '8px',
          background: 'oklch(0.12 0.02 260)', border: '1px solid oklch(0.25 0.02 260)',
          borderRadius: '16px', padding: '8px', minWidth: '240px', zIndex: 100,
        }}>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid oklch(0.25 0.02 260)', marginBottom: '6px' }}>
            <div style={{ fontSize: '10px', color: 'oklch(0.55 0.03 240)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Connected Wallet</div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-jetbrains), monospace', color: 'oklch(0.6 0.03 240)', wordBreak: 'break-all' }}>{address}</div>
          </div>

          {[
            { icon: <Copy size={14} />, label: copied ? 'Copied!' : 'Copy Address', action: handleCopy, color: copied ? 'oklch(0.85 0.2 130)' : undefined },
            {
              icon: <ExternalLink size={14} />, label: 'View on Explorer',
              action: () => window.open(`https://testnet-explorer.hsk.xyz/address/${address}`, '_blank'),
            },
            { icon: <LogOut size={14} />, label: 'Disconnect', action: disconnect, color: 'oklch(0.55 0.22 25)' },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => { item.action(); if (item.label !== 'Copy Address') setShowMenu(false); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '10px', border: 'none',
                background: 'none', cursor: 'pointer', color: item.color || 'oklch(0.6 0.03 240)',
                fontSize: '12px', fontWeight: 600, textAlign: 'left',
              }}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
