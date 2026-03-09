import { COOKIES_SECTIONS, LEGAL_LAST_UPDATED } from '../../../lib/legal-content';

export const metadata = {
  title: 'Politique de Cookies | Freenzy.io',
  description: 'Politique de cookies de la plateforme Freenzy.io.',
};

export default function CookiesPage() {
  return (
    <article>
      <div style={{ marginBottom: 36, paddingBottom: 24, borderBottom: '1px solid #f0f0f0' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a0e3a', marginBottom: 8, letterSpacing: -0.5 }}>
          Politique de Cookies
        </h1>
        <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
          Dernière mise à jour : {LEGAL_LAST_UPDATED}
        </p>
      </div>

      {COOKIES_SECTIONS.map((section, i) => (
        <section key={section.id} id={section.id} style={{ marginBottom: 36 }}>
          <h2 style={{
            fontSize: 15, fontWeight: 700, color: '#1a0e3a', marginBottom: 12,
            paddingLeft: 12, borderLeft: '3px solid #7c3aed',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, minWidth: 24 }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            {section.title}
          </h2>
          <div style={{ fontSize: 14, lineHeight: 1.8, color: '#4b5563', whiteSpace: 'pre-line', paddingLeft: 12 }}>
            {section.content}
          </div>
        </section>
      ))}
    </article>
  );
}
