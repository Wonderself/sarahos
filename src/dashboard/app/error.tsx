'use client';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0f0720', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 500 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>
          <span className="material-symbols-rounded" style={{ fontSize: 64, color: '#f59e0b' }}>warning</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
          Une erreur est survenue
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
          Quelque chose s&apos;est mal pass&eacute;. Veuillez r&eacute;essayer ou revenir &agrave; l&apos;accueil.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={reset}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', color: '#fff',
              padding: '12px 28px', borderRadius: 10, fontWeight: 600, fontSize: 15,
              border: 'none', cursor: 'pointer',
            }}
          >
            R&eacute;essayer
          </button>
          <a href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            color: '#fff', padding: '12px 28px', borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: 'none',
          }}>
            Accueil
          </a>
        </div>
      </div>
    </div>
  );
}
