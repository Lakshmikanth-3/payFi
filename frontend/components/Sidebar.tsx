'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, Clock, Zap, Calendar, BarChart2, Users, Grid, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { href: '/create', icon: MessageSquare, label: 'Chat & Send' },
  { href: '/history', icon: Clock, label: 'History' },
  { href: '/activity', icon: Zap, label: 'Activity', badge: true },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/analytics', icon: BarChart2, label: 'Analytics' },
  { href: '/contacts', icon: Users, label: 'Contacts' },
];

const BOTTOM_NAV = [
  { href: '/', icon: Grid, label: 'Programs' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const checkUnread = () => {
      try {
        const activity = JSON.parse(localStorage.getItem('payfi_activity') || '[]');
        const lastRead = parseInt(localStorage.getItem('payfi_activity_last_read') || '0');
        const count = activity.filter((a: any) => a.timestamp > lastRead).length;
        setUnread(count);
      } catch { }
    };
    checkUnread();
    const interval = setInterval(checkUnread, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (pathname === '/activity') {
      localStorage.setItem('payfi_activity_last_read', Date.now().toString());
      setUnread(0);
    }
  }, [pathname]);

  return (
    <aside className="card-shadow" style={{
      width: '240px',
      minHeight: '100vh',
      flexShrink: 0,
      background: 'oklch(0.08 0.015 260 / 0.98)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid oklch(0.25 0.02 260)',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      height: '100vh',
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid oklch(0.25 0.02 260)',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div className="glow-subtle" style={{
            width: '36px', height: '36px', borderRadius: '12px',
            background: 'oklch(0.08 0.015 260)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            <img 
              src="/logo.png" 
              alt="PayFi" 
              className="w-7 h-7 object-cover rounded-lg"
            />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 900, color: 'oklch(0.96 0.005 240)', letterSpacing: '0.05em' }}>PayFi</div>
            <div style={{ fontSize: '9px', color: 'oklch(0.55 0.03 240)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Natural Language Payments</div>
          </div>
        </Link>
      </div>

      {/* Main Nav */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {NAV_ITEMS.map(({ href, icon: Icon, label, badge }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="group"
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 14px', borderRadius: '12px', marginBottom: '4px',
                background: active ? 'oklch(0.85 0.2 130 / 0.08)' : 'transparent',
                border: `1px solid ${active ? 'oklch(0.85 0.2 130 / 0.2)' : 'transparent'}`,
                color: active ? 'oklch(0.85 0.2 130)' : 'oklch(0.55 0.03 240)',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: active ? 700 : 500,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'oklch(0.18 0.02 260 / 0.5)';
                  e.currentTarget.style.color = 'oklch(0.96 0.005 240)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'oklch(0.55 0.03 240)';
                }
              }}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              <span>{label}</span>
              {badge && unread > 0 && (
                <div style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'oklch(0.55 0.22 25)',
                  color: 'oklch(0.96 0.005 240)',
                  borderRadius: '10px',
                  fontSize: '10px', fontWeight: 900,
                  padding: '2px 6px',
                  minWidth: '18px',
                  textAlign: 'center',
                  boxShadow: '0 0 8px oklch(0.55 0.22 25 / 0.4)',
                }}>{unread > 9 ? '9+' : unread}</div>
              )}
            </Link>
          );
        })}

        <div style={{ height: '1px', background: 'oklch(0.25 0.02 260)', margin: '16px 0' }} />

        {BOTTOM_NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 14px', borderRadius: '12px', marginBottom: '4px',
                background: active ? 'oklch(0.85 0.2 130 / 0.08)' : 'transparent',
                border: `1px solid ${active ? 'oklch(0.85 0.2 130 / 0.2)' : 'transparent'}`,
                color: active ? 'oklch(0.85 0.2 130)' : 'oklch(0.55 0.03 240)',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: active ? 700 : 500,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'oklch(0.18 0.02 260 / 0.5)';
                  e.currentTarget.style.color = 'oklch(0.96 0.005 240)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'oklch(0.55 0.03 240)';
                }
              }}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Chain indicator */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid oklch(0.25 0.02 260)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: 'oklch(0.85 0.2 130)',
            boxShadow: '0 0 8px oklch(0.85 0.2 130 / 0.6)',
          }} />
          <span style={{
            fontSize: '10px',
            color: 'oklch(0.55 0.03 240)',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>HashKey Testnet</span>
        </div>
      </div>
    </aside>
  );
}
