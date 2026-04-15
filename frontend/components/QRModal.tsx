'use client';
import { useState, useEffect, useRef } from 'react';
import { X, QrCode, Copy, Download, Camera, Check } from 'lucide-react';

interface QRModalProps {
  walletAddress?: string;
  onClose: () => void;
  onAddressScanned?: (address: string) => void;
}

export function QRModal({ walletAddress, onClose, onAddressScanned }: QRModalProps) {
  const [tab, setTab] = useState<'MY_QR' | 'SCAN'>('MY_QR');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [scanning, setScanning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (tab === 'MY_QR' && walletAddress) {
      generateQR(walletAddress);
    }
  }, [tab, walletAddress]);

  const generateQR = async (address: string) => {
    try {
      const QRCode = (await import('qrcode')).default;
      const url = await QRCode.toDataURL(`hashkey:${address}`, {
        width: 240,
        margin: 2,
        color: { dark: 'oklch(0.85 0.2 130)', light: 'oklch(0.06 0.015 260)' },
      });
      setQrDataUrl(url);
    } catch (e) {
      console.error('QR generation failed', e);
    }
  };

  const handleCopy = async () => {
    if (!walletAddress) return;
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = 'payfi-qr.png';
    a.click();
  };

  const startScan = async () => {
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setTimeout(() => {
          stream.getTracks().forEach(t => t.stop());
          setScanning(false);
        }, 10000);
      }
    } catch {
      setScanning(false);
      alert('Camera access denied');
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      background: 'oklch(0.06 0.015 260 / 0.8)', backdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }} onClick={onClose}>
      <div
        className="card-shadow"
        style={{
          background: 'oklch(0.12 0.02 260)',
          border: '1px solid oklch(0.25 0.02 260)',
          borderRadius: '24px',
          padding: '28px',
          maxWidth: '380px',
          width: '100%',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'oklch(0.55 0.03 240)', cursor: 'pointer' }}>
          <X size={18} />
        </button>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', background: 'oklch(0.18 0.02 260)', borderRadius: '12px', padding: '4px' }}>
          {(['MY_QR', 'SCAN'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '8px', border: 'none', borderRadius: '9px', cursor: 'pointer',
                background: tab === t ? 'oklch(0.85 0.2 130)' : 'transparent',
                color: tab === t ? 'oklch(0.06 0.015 260)' : 'oklch(0.55 0.03 240)',
                fontWeight: 800, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {t === 'MY_QR' ? 'My QR' : 'Scan'}
            </button>
          ))}
        </div>

        {tab === 'MY_QR' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'oklch(0.6 0.03 240)', textAlign: 'center' }}>
              Scan to send to your wallet
            </div>
            {qrDataUrl ? (
              <div style={{
                background: 'oklch(0.06 0.015 260)', borderRadius: '16px', padding: '16px',
                border: '1px solid oklch(0.85 0.2 130 / 0.2)',
                boxShadow: '0 0 30px oklch(0.85 0.2 130 / 0.1)',
                position: 'relative',
              }}>
                <img src={qrDataUrl} alt="QR Code" style={{ display: 'block', width: 200, height: 200 }} />
                {/* FS Logo overlay */}
                <div style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                  background: 'oklch(0.06 0.015 260)', borderRadius: '8px', padding: '4px 6px',
                  fontSize: '12px', fontWeight: 900, color: 'oklch(0.85 0.2 130)', letterSpacing: '0.1em',
                }}>FS</div>
              </div>
            ) : (
              <div style={{ width: 200, height: 200, background: 'oklch(0.18 0.02 260)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <QrCode size={48} style={{ color: 'oklch(0.25 0.02 260)' }} />
              </div>
            )}
            {walletAddress && (
              <div style={{
                background: 'oklch(0.18 0.02 260)', borderRadius: '10px', padding: '10px 14px',
                fontSize: '11px', fontFamily: 'var(--font-jetbrains), monospace', color: 'oklch(0.6 0.03 240)', textAlign: 'center',
                wordBreak: 'break-all',
              }}>
                {walletAddress}
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <button onClick={handleCopy} style={{
                flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid oklch(0.25 0.02 260)',
                background: copied ? 'oklch(0.85 0.2 130 / 0.1)' : 'oklch(0.18 0.02 260)',
                color: copied ? 'oklch(0.85 0.2 130)' : 'oklch(0.6 0.03 240)',
                fontWeight: 700, fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                transition: 'all 0.2s',
              }}>
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={handleDownload} style={{
                flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid oklch(0.25 0.02 260)',
                background: 'oklch(0.18 0.02 260)', color: 'oklch(0.6 0.03 240)',
                fontWeight: 700, fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}>
                <Download size={13} /> Download
              </button>
            </div>
          </div>
        )}

        {tab === 'SCAN' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'oklch(0.6 0.03 240)', textAlign: 'center' }}>
              Scan a wallet QR to auto-fill recipient
            </div>
            {!scanning ? (
              <button
                onClick={startScan}
                style={{
                  width: 200, height: 200, borderRadius: '16px',
                  background: 'oklch(0.18 0.02 260)', border: '1.5px dashed oklch(0.25 0.02 260)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px',
                  cursor: 'pointer', color: 'oklch(0.55 0.03 240)',
                }}
              >
                <Camera size={32} />
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Tap to Open Camera</span>
              </button>
            ) : (
              <div style={{ position: 'relative', width: 200, height: 200, borderRadius: '16px', overflow: 'hidden' }}>
                <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, border: '2px solid oklch(0.85 0.2 130)', borderRadius: '16px' }} />
              </div>
            )}
            <p style={{ fontSize: '11px', color: 'oklch(0.55 0.03 240)', textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
              Point camera at a wallet QR code. The address will auto-fill in the chat.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
