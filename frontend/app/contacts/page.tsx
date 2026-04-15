'use client';
import { useState, useEffect } from 'react';
import { Plus, Copy, Send, ExternalLink, X, Check, Search } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  address: string;
  notes: string;
  totalSent: number;
  lastPayment: string;
  createdAt: number;
}

function blockieColor(address: string): string[] {
  const h1 = parseInt(address.slice(2, 8), 16) % 360;
  const h2 = (h1 + 137) % 360;
  return [`hsl(${h1},70%,50%)`, `hsl(${h2},60%,40%)`];
}

function Blockie({ address, size = 40 }: { address: string; size?: number }) {
  const [c1, c2] = blockieColor(address);
  const cells = address.slice(2, 18).split('').map(ch => parseInt(ch, 16) > 7);
  return (
    <div style={{ width: size, height: size, borderRadius: '10px', overflow: 'hidden', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', flexShrink: 0, background: c2 }}>
      {cells.map((on, i) => (
        <div key={i} style={{ background: on ? c1 : 'transparent' }} />
      ))}
    </div>
  );
}

interface AddContactModalProps {
  onClose: () => void;
  onAdd: (c: Contact) => void;
}

function AddContactModal({ onClose, onAdd }: AddContactModalProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const validate = () => {
    if (!name.trim()) { setError('Name is required'); return false; }
    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) { setError('Invalid address (must be 0x + 40 hex chars)'); return false; }
    return true;
  };

  const submit = () => {
    if (!validate()) return;
    onAdd({ id: Math.random().toString(36).slice(2), name, address, notes, totalSent: 0, lastPayment: '', createdAt: Date.now() });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'oklch(0.06 0.015 260 / 0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={onClose}>
      <div className="card-shadow" style={{ background: 'oklch(0.12 0.02 260)', border: '1px solid oklch(0.25 0.02 260)', borderRadius: '24px', padding: '28px', maxWidth: '420px', width: '100%' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 900, color: 'oklch(0.96 0.005 240)', margin: 0 }}>Add Contact</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'oklch(0.55 0.03 240)', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        {[
          { label: 'Name', value: name, setter: setName, placeholder: 'Alice' },
          { label: 'Wallet Address', value: address, setter: setAddress, placeholder: '0x...', mono: true },
          { label: 'Notes (optional)', value: notes, setter: setNotes, placeholder: 'e.g. Team payments' },
        ].map((field) => (
          <div key={field.label} style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '11px', fontWeight: 800, color: 'oklch(0.55 0.03 240)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>{field.label}</label>
            <input
              value={field.value}
              onChange={e => { field.setter(e.target.value); setError(''); }}
              placeholder={field.placeholder}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid oklch(0.25 0.02 260)',
                background: 'oklch(0.18 0.02 260)', color: 'oklch(0.96 0.005 240)',
                fontSize: '13px', fontFamily: field.mono ? 'var(--font-jetbrains), monospace' : undefined,
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        ))}

        {error && <div style={{ fontSize: '12px', color: 'oklch(0.55 0.22 25)', marginBottom: '12px' }}>{error}</div>}

        <button
          onClick={submit}
          className="premium-button"
          style={{
            width: '100%', padding: '14px',
            borderRadius: '12px',
            fontSize: '13px',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >Save Contact</button>
      </div>
    </div>
  );
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('payfi_contacts') || '[]') as Contact[];
    setContacts(stored);
    setTimeout(() => setVisible(true), 100);
  }, []);

  const saveContacts = (c: Contact[]) => {
    localStorage.setItem('payfi_contacts', JSON.stringify(c));
    setContacts(c);
  };

  const addContact = (c: Contact) => saveContacts([...contacts, c]);
  const removeContact = (id: string) => saveContacts(contacts.filter(c => c.id !== id));

  const copyAddress = async (address: string) => {
    await navigator.clipboard.writeText(address);
    setCopied(address);
    setTimeout(() => setCopied(null), 2000);
  };

  const quickSend = (contact: Contact) => {
    const q = encodeURIComponent(`Send 0.0001 HSK to ${contact.address}`);
    window.location.href = `/create?q=${q}`;
  };

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid-pattern noise-bg" style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
      <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '32px', letterSpacing: '-0.02em', marginBottom: '8px' }}>Address Book</h1>
          <p style={{ color: 'oklch(0.55 0.03 240)', fontSize: '14px' }}>Your frequent recipients and payment profiles</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="premium-button"
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            borderRadius: '12px', padding: '10px 18px',
            fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        ><Plus size={15} /> Add Contact</button>
      </div>

      <div className={`transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ position: 'relative', marginBottom: '24px' }}>
        <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'oklch(0.55 0.03 240)' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or address..."
          style={{
            width: '100%', padding: '12px 14px 12px 40px', borderRadius: '12px',
            border: '1px solid oklch(0.25 0.02 260)', background: 'oklch(0.12 0.02 260)',
            color: 'oklch(0.96 0.005 240)', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      <div className={`transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {filtered.map(contact => (
          <div
            key={contact.id}
            className="card-shadow"
            style={{
              background: 'oklch(0.12 0.02 260)', borderRadius: '20px', padding: '20px',
              border: '1px solid oklch(0.25 0.02 260)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
            }}
            onClick={() => setSelected(contact)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <Blockie address={contact.address} size={44} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'oklch(0.96 0.005 240)', marginBottom: '2px' }}>{contact.name}</div>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-jetbrains), monospace', color: 'oklch(0.55 0.03 240)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {contact.address.slice(0, 10)}...{contact.address.slice(-6)}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div style={{ background: 'oklch(0.18 0.02 260)', borderRadius: '10px', padding: '10px' }}>
                <div style={{ fontSize: '10px', color: 'oklch(0.55 0.03 240)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Total Sent</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'oklch(0.85 0.2 130)' }}>{contact.totalSent}</div>
              </div>
              <div style={{ background: 'oklch(0.18 0.02 260)', borderRadius: '10px', padding: '10px' }}>
                <div style={{ fontSize: '10px', color: 'oklch(0.55 0.03 240)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Last Payment</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'oklch(0.6 0.03 240)' }}>{contact.lastPayment || 'Never'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
              <button
                onClick={() => quickSend(contact)}
                style={{
                  flex: 1, padding: '9px', background: 'oklch(0.85 0.2 130 / 0.1)', border: '1px solid oklch(0.85 0.2 130 / 0.2)',
                  borderRadius: '10px', color: 'oklch(0.85 0.2 130)', fontWeight: 800, fontSize: '11px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              ><Send size={13} /> Send</button>
              <button
                onClick={() => copyAddress(contact.address)}
                style={{
                  padding: '9px 12px', background: 'oklch(0.18 0.02 260)', border: '1px solid oklch(0.25 0.02 260)',
                  borderRadius: '10px', color: copied === contact.address ? 'oklch(0.85 0.2 130)' : 'oklch(0.55 0.03 240)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {copied === contact.address ? <Check size={14} /> : <Copy size={14} />}
              </button>
              <button
                onClick={() => removeContact(contact.id)}
                style={{
                  padding: '9px 12px', background: 'oklch(0.55 0.22 25 / 0.1)', border: '1px solid oklch(0.55 0.22 25 / 0.2)',
                  borderRadius: '10px', color: 'oklch(0.55 0.22 25)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', padding: '64px', textAlign: 'center', color: 'oklch(0.55 0.03 240)', fontSize: '14px' }}>
            No contacts found. Add your first contact!
          </div>
        )}
      </div>

      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'oklch(0.06 0.015 260 / 0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setSelected(null)}>
          <div className="card-shadow" style={{ background: 'oklch(0.12 0.02 260)', border: '1px solid oklch(0.25 0.02 260)', borderRadius: '24px', padding: '28px', maxWidth: '480px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'oklch(0.96 0.005 240)', margin: 0 }}>{selected.name} profile</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'oklch(0.55 0.03 240)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
              <Blockie address={selected.address} size={60} />
              <div>
                <div style={{ fontSize: '12px', fontFamily: 'var(--font-jetbrains), monospace', color: 'oklch(0.6 0.03 240)', marginBottom: '4px', wordBreak: 'break-all' }}>{selected.address}</div>
                {selected.notes && <div style={{ fontSize: '12px', color: 'oklch(0.55 0.03 240)', fontStyle: 'italic' }}>{selected.notes}</div>}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'oklch(0.18 0.02 260)', borderRadius: '12px', padding: '14px', border: '1px solid oklch(0.25 0.02 260)' }}>
                <div style={{ fontSize: '10px', color: 'oklch(0.55 0.03 240)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '5px' }}>Total Sent</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: 'oklch(0.85 0.2 130)' }}>{selected.totalSent} HSK</div>
              </div>
              <div style={{ background: 'oklch(0.18 0.02 260)', borderRadius: '12px', padding: '14px', border: '1px solid oklch(0.25 0.02 260)' }}>
                <div style={{ fontSize: '10px', color: 'oklch(0.55 0.03 240)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '5px' }}>Last Payment</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'oklch(0.6 0.03 240)' }}>{selected.lastPayment || 'Never'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { quickSend(selected); setSelected(null); }} className="premium-button" style={{ flex: 1, padding: '13px', borderRadius: '12px', fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Send size={15} /> Send Now
              </button>
              <button onClick={() => copyAddress(selected.address)} style={{ padding: '13px 18px', background: 'oklch(0.18 0.02 260)', border: '1px solid oklch(0.25 0.02 260)', borderRadius: '12px', color: 'oklch(0.6 0.03 240)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '12px' }}>
                <Copy size={14} /> Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {showAdd && <AddContactModal onClose={() => setShowAdd(false)} onAdd={addContact} />}
    </div>
  );
}
