'use client';
import { useState } from 'react';
import { Settings, Bell, Shield, Globe, Palette, Save } from 'lucide-react';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [autoReject, setAutoReject] = useState(true);
  const [timeout, setTimeout_] = useState(60);
  const [saved, setSaved] = useState(false);
  const [visible, setVisible] = useState(false);

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
        background: value ? 'oklch(0.85 0.2 130)' : 'oklch(0.25 0.02 260)',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: '3px',
        left: value ? '23px' : '3px',
        width: '18px', height: '18px', borderRadius: '50%', background: 'oklch(0.96 0.005 240)',
        transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      }} />
    </div>
  );

  const sections = [
    {
      icon: <Bell size={16} />,
      title: 'Notifications',
      color: 'oklch(0.85 0.2 130)',
      items: [
        { label: 'Toast Notifications', desc: 'Show toast alerts for all payment events', control: <Toggle value={notifications} onChange={setNotifications} /> },
      ],
    },
    {
      icon: <Shield size={16} />,
      title: 'Security',
      color: 'oklch(0.7 0.18 170)',
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
                style={{ width: '64px', padding: '6px 10px', borderRadius: '8px', border: '1px solid oklch(0.25 0.02 260)', background: 'oklch(0.18 0.02 260)', color: 'oklch(0.96 0.005 240)', fontSize: '13px', fontWeight: 700, outline: 'none', textAlign: 'center' }}
              />
              <span style={{ fontSize: '12px', color: 'oklch(0.55 0.03 240)' }}>sec</span>
            </div>
          ),
        },
      ],
    },
    {
      icon: <Globe size={16} />,
      title: 'Network',
      color: 'oklch(0.6 0.12 200)',
      items: [
        { label: 'Network', desc: 'HashKey Chain Testnet (Chain ID 133)', control: <span style={{ fontSize: '12px', fontWeight: 700, color: 'oklch(0.6 0.12 200)', padding: '4px 10px', borderRadius: '8px', background: 'oklch(0.6 0.12 200 / 0.1)' }}>Testnet</span> },
        { label: 'RPC Endpoint', desc: 'https://testnet.hsk.xyz', control: null },
        { label: 'Explorer', desc: 'https://testnet-explorer.hsk.xyz', control: null },
      ],
    },
  ];

  return (
    <div className="grid-pattern noise-bg" style={{ padding: '40px', maxWidth: '700px', margin: '0 auto' }}>
      <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ marginBottom: '32px' }}>
        <h1 className="text-gradient" style={{ fontSize: '32px', letterSpacing: '-0.02em', marginBottom: '8px' }}>Settings</h1>
        <p style={{ color: 'oklch(0.55 0.03 240)', fontSize: '14px' }}>Configure your PayFi experience</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {sections.map((section, si) => (
          <div
            key={section.title}
            className={`card-shadow transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{
              background: 'oklch(0.12 0.02 260)',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid oklch(0.25 0.02 260)',
              transitionDelay: `${(si + 1) * 100}ms`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid oklch(0.25 0.02 260)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: `${section.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: section.color }}>
                {section.icon}
              </div>
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'oklch(0.96 0.005 240)' }}>{section.title}</span>
            </div>
            {section.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < section.items.length - 1 ? '1px solid oklch(0.25 0.02 260 / 0.5)' : 'none' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'oklch(0.96 0.005 240)', marginBottom: '3px' }}>{item.label}</div>
                  <div style={{ fontSize: '11px', color: 'oklch(0.55 0.03 240)', lineHeight: 1.4 }}>{item.desc}</div>
                </div>
                {item.control}
              </div>
            ))}
          </div>
        ))}
      </div>

      <button
        onClick={save}
        className="premium-button"
        style={{
          marginTop: '24px', width: '100%', padding: '14px',
          borderRadius: '14px',
          color: saved ? 'oklch(0.85 0.2 130)' : undefined,
          fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase',
          cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          background: saved ? 'oklch(0.85 0.2 130 / 0.15)' : undefined,
          border: saved ? '1px solid oklch(0.85 0.2 130 / 0.3)' : undefined,
        }}
      >
        <Save size={15} />
        {saved ? 'Saved!' : 'Save Settings'}
      </button>
    </div>
  );
}
