'use client';
import { useEffect, useState, useCallback } from 'react';
import { X, CheckCircle, Clock, AlertTriangle, Zap, Info, Bell } from 'lucide-react';

export type ToastType = 'SUCCESS' | 'PENDING' | 'FAILED' | 'AUTO_RUN' | 'INFO' | 'APPROVAL';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  subtitle: string;
  link?: string;
  duration?: number;
}

declare global {
  interface Window {
    showToast: (type: ToastType, title: string, subtitle: string, link?: string, duration?: number) => void;
  }
}

const TOAST_COLORS: Record<ToastType, { border: string; bg: string; icon: string }> = {
  SUCCESS:  { border: '#a3f542', bg: 'rgba(163,245,66,0.08)',  icon: '#a3f542' },
  PENDING:  { border: '#ffcc00', bg: 'rgba(255,204,0,0.08)',   icon: '#ffcc00' },
  FAILED:   { border: '#ff4d4d', bg: 'rgba(255,77,77,0.08)',   icon: '#ff4d4d' },
  AUTO_RUN: { border: '#00e5c4', bg: 'rgba(0,229,196,0.08)',   icon: '#00e5c4' },
  INFO:     { border: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  icon: '#3b82f6' },
  APPROVAL: { border: '#ffcc00', bg: 'rgba(255,204,0,0.10)',   icon: '#ffcc00' },
};

const TOAST_ICONS: Record<ToastType, React.ReactNode> = {
  SUCCESS:  <CheckCircle size={18} />,
  PENDING:  <Clock size={18} />,
  FAILED:   <AlertTriangle size={18} />,
  AUTO_RUN: <Zap size={18} />,
  INFO:     <Info size={18} />,
  APPROVAL: <Bell size={18} />,
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [exiting, setExiting] = useState(false);
  const duration = toast.duration ?? 4000;
  const colors = TOAST_COLORS[toast.type];

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  }, [toast.id, onDismiss]);

  useEffect(() => {
    const t = setTimeout(dismiss, duration);
    return () => clearTimeout(t);
  }, [dismiss, duration]);

  return (
    <div
      className={exiting ? 'toast-exit' : 'toast-enter'}
      style={{
        background: 'rgba(10,15,26,0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.06)',
        borderLeft: `3px solid ${colors.border}`,
        padding: '14px 16px',
        minWidth: '320px',
        maxWidth: '380px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ color: colors.icon, marginTop: '1px', flexShrink: 0 }}>
          {TOAST_ICONS[toast.type]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>
            {toast.title}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>
            {toast.subtitle}
          </div>
          {toast.link && (
            <a
              href={toast.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '11px', color: colors.border, fontWeight: 700, textDecoration: 'underline', marginTop: '4px', display: 'inline-block' }}
            >
              View on Explorer ↗
            </a>
          )}
        </div>
        <button
          onClick={dismiss}
          style={{ color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0 }}
        >
          <X size={14} />
        </button>
      </div>
      {/* Progress bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.05)' }}>
        <div
          className="drain-bar"
          style={{
            height: '100%',
            background: colors.border,
            animationDuration: `${duration}ms`,
          }}
        />
      </div>
      {toast.type === 'APPROVAL' && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '16px',
          border: `1px solid ${colors.border}`,
          animation: 'pulse 1.5s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
      )}
    </div>
  );
}

export function ToastSystem() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, title: string, subtitle: string, link?: string, duration?: number) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => {
      const next = [{ id, type, title, subtitle, link, duration }, ...prev];
      return next.slice(0, 4);
    });
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    window.showToast = addToast;
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      alignItems: 'flex-end',
    }}>
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
}
