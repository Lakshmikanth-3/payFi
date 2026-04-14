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
    <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={onClose}>
      <div style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '28px', maxWidth: '420px', width: '100%', boxShadow: '0 40px 80px rgba(0,0,0,0.7)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#fff', margin: 0 }}>Add Contact</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        {[
          { label: 'Name', value: name, setter: setName, placeholder: 'Alice' },
          { label: 'Wallet Address', value: address, setter: setAddress, placeholder: '0x...', mono: true },
          { label: 'Notes (optional)', value: notes, setter: setNotes, placeholder: 'e.g. Team payments' },
        ].map((field) => (
          <div key={field.label} style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>{field.label}</label>
            <input
              value={field.value}
              onChange={e => { field.setter(e.target.value); setError(''); }}
              placeholder={field.placeholder}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.03)', color: '#fff',
                fontSize: '13px', fontFamily: field.mono ? 'monospace' : undefined,
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        ))}

        {error && <div style={{ fontSize: '12px', color: '#ff4d4d', marginBottom: '12px' }}>{error}</div>}

        <button
          onClick={submit}
          style={{
            width: '100%', padding: '14px', background: 'linear-gradient(135deg,#a3f542,#6fcd00)',
            border: 'none', borderRadius: '12px', fontWeight: 900, fontSize: '13px',
            letterSpacing: '0.08em', textTransform: 'uppercase', color: '#000', cursor: 'pointer',
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

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('payfi_contacts') || '[]') as Contact[];
    setContacts(stored);
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
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: '6px' }}>Address Book</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Your frequent recipients and payment profiles</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'linear-gradient(135deg,#a3f542,#6fcd00)',
            border: 'none', borderRadius: '12px', padding: '10px 18px',
            fontWeight: 800, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase',
            color: '#000', cursor: 'pointer',
          }}
        ><Plus size={15} /> Add Contact</button>
      </div>

      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or address..."
          style={{
            width: '100%', padding: '12px 14px 12px 40px', borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)',
            color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {filtered.map(contact => (
          <div
            key={contact.id}
            style={{
              background: '#1a1c24', borderRadius: '20px', padding: '20px',
              border: '1px solid rgba(255,255,255,0.05)',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
            }}
            onClick={() => setSelected(contact)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <Blockie address={contact.address} size={44} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff', marginBottom: '2px' }}>{contact.name}</div>
                <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {contact.address.slice(0, 10)}...{contact.address.slice(-6)}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Total Sent</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#a3f542' }}>{contact.totalSent}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Last Payment</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>{contact.lastPayment || 'Never'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
              <button
                onClick={() => quickSend(contact)}
                style={{
                  flex: 1, padding: '9px', background: 'rgba(163,245,66,0.1)', border: '1px solid rgba(163,245,66,0.2)',
                  borderRadius: '10px', color: '#a3f542', fontWeight: 800, fontSize: '11px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  transition: 'all 0.2s',
                }}
              ><Send size={13} /> Send</button>
              <button
                onClick={() => copyAddress(contact.address)}
                style={{
                  padding: '9px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px', color: copied === contact.address ? '#a3f542' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
              >
                {copied === contact.address ? <Check size={14} /> : <Copy size={14} />}
              </button>
              <button
                onClick={() => removeContact(contact.id)}
                style={{
                  padding: '9px 12px', background: 'rgba(255,77,77,0.04)', border: '1px solid rgba(255,77,77,0.08)',
                  borderRadius: '10px', color: '#ff4d4d', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', padding: '64px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
            No contacts found. Add your first contact!
          </div>
        )}
      </div>

      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setSelected(null)}>
          <div style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '28px', maxWidth: '480px', width: '100%', boxShadow: '0 40px 80px rgba(0,0,0,0.7)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#fff', margin: 0 }}>{selected.name} profile</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
              <Blockie address={selected.address} size={60} />
              <div>
                <div style={{ fontSize: '12px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.6)', marginBottom: '4px', wordBreak: 'break-all' }}>{selected.address}</div>
                {selected.notes && <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>{selected.notes}</div>}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '5px' }}>Total Sent</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#a3f542' }}>{selected.totalSent} HSK</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '5px' }}>Last Payment</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>{selected.lastPayment || 'Never'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { quickSend(selected); setSelected(null); }} style={{ flex: 1, padding: '13px', background: 'linear-gradient(135deg,#a3f542,#6fcd00)', border: 'none', borderRadius: '12px', fontWeight: 900, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#000', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Send size={15} /> Send Now
              </button>
              <button onClick={() => copyAddress(selected.address)} style={{ padding: '13px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '12px' }}>
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
