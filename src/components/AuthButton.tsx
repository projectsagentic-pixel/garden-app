import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function AuthButton() {
  const { user, loading, sendMagicLink, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  if (loading) return null;

  if (user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
          {user.user_metadata?.avatar_url && (
            <img
              src={user.user_metadata.avatar_url}
              alt=""
              width={24}
              height={24}
              style={{ borderRadius: '50%', border: '1.4px solid var(--line)' }}
            />
          )}
          <span style={{ fontFamily: 'var(--label)', fontSize: 12, color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>
            {user.email}
          </span>
        </div>
        <button
          onClick={signOut}
          style={{
            padding: '5px 10px',
            background: 'none', border: '1.4px solid var(--line)',
            fontFamily: 'var(--label)', fontSize: 12, cursor: 'pointer',
            borderRadius: 3, color: 'var(--ink-soft)', textAlign: 'left',
          }}
        >
          Cerrar sesión
        </button>
      </div>
    );
  }

  if (sent) {
    return (
      <div style={{ fontFamily: 'var(--label)', fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
        Revisa tu email — te enviamos un enlace de acceso.
        <button
          onClick={() => setSent(false)}
          style={{ display: 'block', marginTop: 6, background: 'none', border: 'none', padding: 0, fontFamily: 'var(--label)', fontSize: 12, color: 'var(--ink-soft)', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Usar otro email
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    await sendMagicLink(email.trim());
    setBusy(false);
    setSent(true);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="tu@email.com"
        required
        style={{
          width: '100%', padding: '7px 9px', boxSizing: 'border-box',
          background: 'var(--paper-2)', border: '1.4px solid var(--line)',
          fontFamily: 'var(--label)', fontSize: 12, borderRadius: 3,
          color: 'var(--ink)', outline: 'none',
        }}
      />
      <button
        type="submit"
        disabled={busy}
        style={{
          padding: '7px 10px',
          background: 'var(--paper-2)', border: '1.4px solid var(--line)',
          fontFamily: 'var(--label)', fontSize: 12, cursor: busy ? 'default' : 'pointer',
          borderRadius: 3, color: 'var(--ink)', opacity: busy ? 0.6 : 1,
        }}
      >
        {busy ? 'Enviando…' : 'Enviar enlace'}
      </button>
    </form>
  );
}
