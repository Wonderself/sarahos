import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #fff)', color: 'var(--text-primary, #111)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 500 }}>
        <div style={{ fontSize: 80, fontWeight: 800, color: 'var(--accent, #0EA5E9)', marginBottom: 16 }}>
          404
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
          Page introuvable
        </h1>
        <p style={{ color: 'var(--text-secondary, #6b7280)', fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
          La page que vous cherchez n&apos;existe pas ou a &eacute;t&eacute; d&eacute;plac&eacute;e.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--accent, #0EA5E9)', color: '#fff',
            padding: '12px 28px', borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: 'none',
          }}>
            Retour &agrave; l&apos;accueil
          </Link>
          <Link href="/demo" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--bg-secondary, #f8f9fa)', border: '1px solid var(--border-primary, #e5e7eb)',
            color: 'var(--text-primary, #111)', padding: '12px 28px', borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: 'none',
          }}>
            Voir la d&eacute;mo
          </Link>
        </div>
      </div>
    </div>
  );
}
