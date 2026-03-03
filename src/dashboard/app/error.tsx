'use client';

import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
          maxWidth: 520,
          width: '100%',
        }}
      >
        {/* Error icon */}
        <div
          style={{
            fontSize: 56,
            marginBottom: 16,
            lineHeight: 1,
          }}
        >
          <span role="img" aria-label="Erreur">&#9888;&#65039;</span>
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
          Une erreur est survenue
        </h1>

        {/* Subtitle */}
        <p
          className="text-base text-tertiary"
          style={{
            lineHeight: 1.6,
            marginBottom: 24,
            maxWidth: 400,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Quelque chose ne s&apos;est pas pass&eacute; comme pr&eacute;vu. Vous pouvez r&eacute;essayer ou revenir &agrave; l&apos;accueil.
        </p>

        {/* Error message code block */}
        <div
          className="code-block"
          style={{
            marginBottom: 28,
            textAlign: 'left',
            maxWidth: 460,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <pre>
            <code style={{ color: 'var(--danger)', wordBreak: 'break-word' }}>
              {error.message || 'Erreur inconnue'}
            </code>
          </pre>
          {error.digest && (
            <div
              className="text-xs text-muted"
              style={{ marginTop: 8 }}
            >
              Digest: {error.digest}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div
          className="flex-center"
          style={{ gap: 12, flexWrap: 'wrap' }}
        >
          <button
            onClick={reset}
            className="btn btn-primary rounded-md"
            style={{ padding: '10px 24px', fontSize: 14 }}
          >
            R&eacute;essayer
          </button>
          <Link
            href="/"
            className="btn btn-ghost rounded-md"
            style={{
              textDecoration: 'none',
              padding: '10px 24px',
              fontSize: 14,
              border: '1px solid var(--border-secondary)',
            }}
          >
            Retour &agrave; l&apos;accueil
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
