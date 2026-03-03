import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      className="flex-center"
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        padding: '24px',
      }}
    >
      <div
        className="animate-in"
        style={{
          textAlign: 'center',
          maxWidth: 480,
          width: '100%',
        }}
      >
        {/* Large 404 with gradient */}
        <div
          style={{
            fontSize: 120,
            fontWeight: 900,
            letterSpacing: '-0.06em',
            lineHeight: 1,
            background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 16,
            userSelect: 'none',
          }}
        >
          404
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            marginBottom: 8,
          }}
        >
          Page introuvable
        </h1>

        {/* Description */}
        <p
          className="text-base text-tertiary"
          style={{
            lineHeight: 1.6,
            marginBottom: 32,
            maxWidth: 360,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          La page que vous cherchez n&apos;existe pas ou a&eacute;t&eacute; d&eacute;plac&eacute;e.
        </p>

        {/* CTA Buttons */}
        <div
          className="flex-center"
          style={{ gap: 12, flexWrap: 'wrap' }}
        >
          <Link
            href="/"
            className="btn btn-primary rounded-md"
            style={{ textDecoration: 'none', padding: '10px 24px', fontSize: 14 }}
          >
            Retour &agrave; l&apos;accueil
          </Link>
          <Link
            href="/client/dashboard"
            className="btn btn-ghost rounded-md"
            style={{
              textDecoration: 'none',
              padding: '10px 24px',
              fontSize: 14,
              border: '1px solid var(--border-secondary)',
            }}
          >
            Tableau de bord
          </Link>
        </div>

        {/* Subtle branding */}
        <div
          className="text-xs text-muted"
          style={{ marginTop: 48, opacity: 0.6 }}
        >
          SARAH OS
        </div>
      </div>
    </div>
  );
}
