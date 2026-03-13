'use client';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #fff)', color: 'var(--text-primary, #111)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 500 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
          Une erreur est survenue
        </h1>
        <p style={{ color: 'var(--text-secondary, #6b7280)', fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
          Quelque chose s&apos;est mal pass&eacute;. Veuillez r&eacute;essayer ou revenir &agrave; l&apos;accueil.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={reset}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'var(--accent, #0EA5E9)', color: '#fff',
              padding: '12px 28px', borderRadius: 10, fontWeight: 600, fontSize: 15,
              border: 'none', cursor: 'pointer',
            }}
          >
            R&eacute;essayer
          </button>
          <a href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--bg-secondary, #f8f9fa)', border: '1px solid var(--border-primary, #e5e7eb)',
            color: 'var(--text-primary, #111)', padding: '12px 28px', borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: 'none',
          }}>
            Accueil
          </a>
        </div>
      </div>
    </div>
  );
}
