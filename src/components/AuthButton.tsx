import { useAuth } from '../hooks/useAuth';

export function AuthButton() {
  const { user, loading, signInWithGitHub, signOut } = useAuth();

  if (loading) return null;

  if (!user) {
    return (
      <button
        onClick={signInWithGitHub}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          width: '100%', padding: '8px 10px',
          background: 'var(--paper-2)', border: '1.4px solid var(--line)',
          fontFamily: 'var(--label)', fontSize: 13, cursor: 'pointer',
          borderRadius: 3, color: 'var(--ink)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
        Iniciar sesión
      </button>
    );
  }

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
          {user.user_metadata?.user_name ?? user.email}
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
