'use client';
import { useState } from 'react';
import { Settings, Bell, Shield, Globe, Palette, Save } from 'lucide-react';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [autoReject, setAutoReject] = useState(true);
  const [timeout, setTimeout_] = useState(60);
  const [saved, setSaved] = useState(false);

  const save = () => {
    localStorage.setItem('payfi_settings', JSON.stringify({ notifications, autoReject, timeout }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: '44px', height: '24px', borderRadius: '12px', cursor: 'pointer',
        background: value ? '#a3f542' : 'rgba(255,255,255,0.1)',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: '3px',
        left: value ? '23px' : '3px',
        width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      }} />
    </div>
  );

  const sections = [
    {
      icon: <Bell size={16} />,
      title: 'Notifications',
      color: '#a3f542',
      items: [
        { label: 'Toast Notifications', desc: 'Show toast alerts for all payment events', control: <Toggle value={notifications} onChange={setNotifications} /> },
      ],
    },
    {
      icon: <Shield size={16} />,
      title: 'Security',
      color: '#00e5c4',
      items: [
        { label: 'Auto-Reject on Timeout', desc: 'Reject manual approvals after countdown expires', control: <Toggle value={autoReject} onChange={setAutoReject} /> },
        {
          label: 'Approval Timeout (seconds)',
          desc: 'Time before auto-rejecting a pending manual approval',
          control: (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number" min={10} max={300} value={timeout}
                onChange={e => setTimeout_(parseInt(e.target.value))}
                style={{ width: '64px', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: '13px', fontWeight: 700, outline: 'none', textAlign: 'center' }}
              />
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>sec</span>
            </div>
          ),
        },
      ],
    },
    {
      icon: <Globe size={16} />,
      title: 'Network',
      color: '#3b82f6',
      items: [
        { label: 'Network', desc: 'HashKey Chain Testnet (Chain ID 133)', control: <span style={{ fontSize: '12px', fontWeight: 700, color: '#3b82f6', padding: '4px 10px', borderRadius: '8px', background: 'rgba(59,130,246,0.1)' }}>Testnet</span> },
        { label: 'RPC Endpoint', desc: 'https://testnet.hsk.xyz', control: null },
        { label: 'Explorer', desc: 'https://testnet-explorer.hsk.xyz', control: null },
      ],
    },
  ];

  return (
    <div style={{ padding: '40px', maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: '6px' }}>Settings</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Configure your PayFi experience</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {sections.map((section) => (
          <div key={section.title} style={{ background: '#1a1c24', borderRadius: '20px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: `${section.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: section.color }}>
                {section.icon}
              </div>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>{section.title}</span>
            </div>
            {section.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < section.items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '3px' }}>{item.label}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>{item.desc}</div>
                </div>
                {item.control}
              </div>
            ))}
          </div>
        ))}
      </div>

      <button
        onClick={save}
        style={{
          marginTop: '24px', width: '100%', padding: '14px',
          background: saved ? 'rgba(163,245,66,0.15)' : 'linear-gradient(135deg,#a3f542,#6fcd00)',
          border: saved ? '1px solid rgba(163,245,66,0.3)' : 'none',
          borderRadius: '14px', color: saved ? '#a3f542' : '#000',
          fontWeight: 900, fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase',
          cursor: 'pointer', transition: 'all 0.3s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}
      >
        <Save size={15} />
        {saved ? 'Saved!' : 'Save Settings'}
      </button>
    </div>
  );
}
