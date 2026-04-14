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
      } catch {}
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
    <aside style={{
      width: '220px', minHeight: '100vh', flexShrink: 0,
      background: 'rgba(11,12,15,0.95)',
      borderRight: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0, height: '100vh',
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #a3f542, #00e5c4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 900, color: '#000',
          }}>FS</div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#fff', letterSpacing: '0.05em' }}>FlowScript</div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>PayFi Protocol</div>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        <div style={{ marginBottom: '4px' }}>
          {NAV_ITEMS.map(({ href, icon: Icon, label, badge }) => {
            const active = pathname === href || (href === '/create' && pathname === '/');
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 12px', borderRadius: '10px', marginBottom: '2px',
                  background: active ? 'rgba(163,245,66,0.08)' : 'transparent',
                  borderLeft: active ? '2px solid #a3f542' : '2px solid transparent',
                  color: active ? '#a3f542' : 'rgba(255,255,255,0.5)',
                  textDecoration: 'none', fontSize: '13px', fontWeight: active ? 700 : 500,
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
              >
                <Icon size={16} />
                <span>{label}</span>
                {badge && unread > 0 && (
                  <div style={{
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    background: '#ff4d4d', color: '#fff', borderRadius: '10px',
                    fontSize: '9px', fontWeight: 900, padding: '2px 6px', minWidth: '18px', textAlign: 'center',
                  }}>{unread > 9 ? '9+' : unread}</div>
                )}
              </Link>
            );
          })}
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '10px 0' }} />

        {BOTTOM_NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', borderRadius: '10px', marginBottom: '2px',
                background: active ? 'rgba(163,245,66,0.08)' : 'transparent',
                borderLeft: active ? '2px solid #a3f542' : '2px solid transparent',
                color: active ? '#a3f542' : 'rgba(255,255,255,0.5)',
                textDecoration: 'none', fontSize: '13px', fontWeight: active ? 700 : 500,
                transition: 'all 0.2s',
              }}
            >
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Chain indicator */}
      <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a3f542', boxShadow: '0 0 6px rgba(163,245,66,0.6)' }} />
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>HashKey Testnet</span>
        </div>
      </div>
    </aside>
  );
}
