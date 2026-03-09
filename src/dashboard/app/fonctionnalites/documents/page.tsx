'use client';

import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import Link from 'next/link';
import { useState } from 'react';

const STEPS = [
  {
    icon: 'description',
    title: 'Choisissez un template',
    desc: '25 modèles professionnels prêts à l\'emploi : emails, contrats, factures, CV et plus.',
  },
  {
    icon: 'edit_note',
    title: 'Décrivez votre besoin',
    desc: 'En quelques mots, expliquez le contexte. L\'IA comprend et rédige pour vous.',
  },
  {
    icon: 'download',
    title: 'Téléchargez le document',
    desc: 'Relisez, ajustez si besoin, puis exportez en PDF ou Markdown.',
  },
];

const FEATURES = [
  {
    icon: 'folder_open',
    title: '25 templates professionnels',
    desc: 'Email, contrat, facture, CV, proposition commerciale, rapport, lettre de motivation, procès-verbal... Tout y est.',
  },
  {
    icon: 'picture_as_pdf',
    title: 'Export PDF & Markdown',
    desc: 'Téléchargez vos documents au format PDF prêt à envoyer ou en Markdown pour l\'intégrer à vos outils.',
  },
  {
    icon: 'auto_awesome',
    title: 'Rédaction IA intelligente',
    desc: 'L\'IA adapte le ton, la structure et le vocabulaire au type de document. Résultat professionnel garanti.',
  },
  {
    icon: 'tune',
    title: 'Personnalisation automatique',
    desc: 'Vos coordonnées, votre logo, le nom du destinataire : tout est pré-rempli automatiquement.',
  },
  {
    icon: 'history',
    title: 'Historique des documents',
    desc: 'Retrouvez tous vos documents générés. Dupliquez, modifiez et renvoyez en un clic.',
  },
  {
    icon: 'translate',
    title: 'Multi-langues',
    desc: 'Générez vos documents en français, anglais, espagnol, allemand ou italien.',
  },
];

const TEMPLATES = [
  { icon: 'mail', name: 'Email pro', color: '#5b6cf7' },
  { icon: 'gavel', name: 'Contrat', color: '#7c3aed' },
  { icon: 'receipt_long', name: 'Facture', color: '#06b6d4' },
  { icon: 'person', name: 'CV', color: '#22c55e' },
  { icon: 'handshake', name: 'Proposition', color: '#f59e0b' },
  { icon: 'assessment', name: 'Rapport', color: '#ef4444' },
  { icon: 'draft', name: 'Lettre', color: '#ec4899' },
  { icon: 'groups', name: 'PV réunion', color: '#8b5cf6' },
];

const FAQS = [
  {
    q: 'Quels formats de document sont disponibles ?',
    a: 'Vous pouvez exporter en PDF (mis en page, prêt à envoyer) ou en Markdown (pour intégration dans vos outils, sites web ou systèmes internes).',
  },
  {
    q: 'Peut-on modifier un document après génération ?',
    a: 'Bien sûr. Le document généré est entièrement éditable. Vous pouvez ajuster le texte, le ton ou la mise en page avant de l\'exporter.',
  },
  {
    q: 'Puis-je créer mes propres templates ?',
    a: 'Oui. En plus des 25 templates inclus, vous pouvez enregistrer vos propres modèles personnalisés pour les réutiliser à volonté.',
  },
  {
    q: 'Les documents peuvent-ils inclure une signature ?',
    a: 'Vous pouvez ajouter un bloc signature dans vos documents. Pour la signature électronique certifiée, nous recommandons d\'exporter le PDF puis d\'utiliser un outil dédié.',
  },
  {
    q: 'Mes données sont-elles protégées (RGPD) ?',
    a: 'Absolument. Vos documents sont chiffrés, stockés en Europe et ne sont jamais partagés. Vous pouvez les supprimer à tout moment.',
  },
];

export default function DocumentsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTemplate, setActiveTemplate] = useState(0);

  const sectionStyle: React.CSSProperties = {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '80px 24px',
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: '32px 28px',
  };

  const accentGradient = 'linear-gradient(135deg, #7c3aed, #06b6d4)';

  return (
    <div style={{ background: '#0a0a0f', color: '#fff', minHeight: '100vh' }}>
      <PublicNav />

      {/* Hero */}
      <section style={{ paddingTop: 140, paddingBottom: 80, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -200, left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 100, padding: '8px 20px', marginBottom: 28, fontSize: 14, color: '#a78bfa' }}>
            <span className="material-symbols-rounded" style={{ fontSize: 18 }}>description</span>
            Documents IA
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 20px' }}>
            Créez vos documents<br />
            <span style={{ background: accentGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>en quelques secondes</span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: 'rgba(255,255,255,0.7)', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.6 }}>
            25 templates professionnels générés par IA. Emails, contrats, factures, CV : décrivez votre besoin et téléchargez le résultat.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: accentGradient, color: '#fff', padding: '14px 32px', borderRadius: 10, fontWeight: 600, fontSize: 16, textDecoration: 'none' }}>
              Essayer gratuitement
              <span className="material-symbols-rounded" style={{ fontSize: 20 }}>arrow_forward</span>
            </Link>
            <Link href="/demo" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '14px 32px', borderRadius: 10, fontWeight: 600, fontSize: 16, textDecoration: 'none' }}>
              Voir la démo
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Steps */}
      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Comment ça marche ?
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 56, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Trois étapes pour un document professionnel prêt à envoyer.
        </p>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{ ...cardStyle, flex: '1 1 280px', maxWidth: 340, textAlign: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', width: 36, height: 36, borderRadius: '50%', background: accentGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 }}>
                {i + 1}
              </div>
              <span className="material-symbols-rounded" style={{ fontSize: 40, color: '#5b6cf7', marginBottom: 16, display: 'block', marginTop: 12 }}>{step.icon}</span>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{step.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6 Features */}
      <section style={{ ...sectionStyle, paddingTop: 40 }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Des documents pro en un clic
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 56, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          L&apos;IA rédige, vous validez. Simple, rapide, professionnel.
        </p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {FEATURES.map((feat, i) => (
            <div key={i} style={{ ...cardStyle, flex: '1 1 320px', maxWidth: 360 }}>
              <span className="material-symbols-rounded" style={{ fontSize: 32, color: '#5b6cf7', marginBottom: 14, display: 'block' }}>{feat.icon}</span>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{feat.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14.5, lineHeight: 1.65 }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo: Template Selector + Preview */}
      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Aperçu des templates
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 48, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Cliquez sur un template pour voir l&apos;aperçu.
        </p>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          {/* Template grid */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
            {TEMPLATES.map((tpl, i) => (
              <button key={i} onClick={() => setActiveTemplate(i)} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: activeTemplate === i ? 'rgba(91,108,247,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${activeTemplate === i ? 'rgba(91,108,247,0.4)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 10, padding: '10px 18px', cursor: 'pointer', color: '#fff', fontSize: 14, fontWeight: 600,
                transition: 'all 0.2s',
              }}>
                <span className="material-symbols-rounded" style={{ fontSize: 20, color: tpl.color }}>{tpl.icon}</span>
                {tpl.name}
              </button>
            ))}
          </div>
          {/* Preview card */}
          <div style={{ ...cardStyle, padding: '28px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="material-symbols-rounded" style={{ fontSize: 28, color: TEMPLATES[activeTemplate].color }}>{TEMPLATES[activeTemplate].icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{TEMPLATES[activeTemplate].name}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Généré par Freenzy IA</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <div style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600 }}>PDF</div>
                <div style={{ background: 'rgba(91,108,247,0.1)', color: '#5b6cf7', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600 }}>MD</div>
              </div>
            </div>
            {/* Mock document content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ height: 14, background: 'rgba(255,255,255,0.12)', borderRadius: 4, width: '60%' }} />
              <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 4, width: '100%' }} />
              <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 4, width: '90%' }} />
              <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 4, width: '95%' }} />
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />
              <div style={{ height: 12, background: 'rgba(255,255,255,0.1)', borderRadius: 4, width: '40%' }} />
              <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 4, width: '100%' }} />
              <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 4, width: '85%' }} />
              <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 4, width: '70%' }} />
            </div>
            <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: accentGradient, padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                <span className="material-symbols-rounded" style={{ fontSize: 16 }}>download</span>
                Télécharger PDF
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                <span className="material-symbols-rounded" style={{ fontSize: 16 }}>edit</span>
                Modifier
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={sectionStyle}>
        <div style={{ ...cardStyle, textAlign: 'center', maxWidth: 600, margin: '0 auto', background: 'rgba(91,108,247,0.06)', border: '1px solid rgba(91,108,247,0.15)' }}>
          <span className="material-symbols-rounded" style={{ fontSize: 40, color: '#5b6cf7', marginBottom: 12, display: 'block' }}>payments</span>
          <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 700, marginBottom: 12 }}>
            Tarification simple
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>
            Environ <strong style={{ color: '#fff' }}>14 documents</strong> pour 50 crédits offerts à l&apos;inscription.
            <br />Chaque document coûte entre 2 et 5 crédits selon sa complexité.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#5b6cf7' }}>~3.5</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>crédits / doc</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#5b6cf7' }}>50</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>crédits offerts</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#5b6cf7' }}>0 €</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>pour commencer</div>
            </div>
          </div>
          <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: accentGradient, color: '#fff', padding: '14px 32px', borderRadius: 10, fontWeight: 600, fontSize: 16, textDecoration: 'none' }}>
            Créer mon compte gratuit
            <span className="material-symbols-rounded" style={{ fontSize: 20 }}>arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Questions fréquentes
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 48, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Tout savoir sur le générateur de documents.
        </p>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ ...cardStyle, padding: '0', overflow: 'hidden', cursor: 'pointer' }} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px' }}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{faq.q}</span>
                <span className="material-symbols-rounded" style={{ fontSize: 22, color: 'rgba(255,255,255,0.4)', transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
              </div>
              {openFaq === i && (
                <div style={{ padding: '0 24px 20px', color: 'rgba(255,255,255,0.65)', fontSize: 14.5, lineHeight: 1.65 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ ...sectionStyle, textAlign: 'center', paddingBottom: 100 }}>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Prêt à gagner du temps sur vos documents ?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 32, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          50 crédits offerts — aucune carte bancaire requise.
        </p>
        <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: accentGradient, color: '#fff', padding: '16px 40px', borderRadius: 10, fontWeight: 700, fontSize: 17, textDecoration: 'none' }}>
          Commencer gratuitement
          <span className="material-symbols-rounded" style={{ fontSize: 22 }}>rocket_launch</span>
        </Link>
      </section>

      <PublicFooter />
    </div>
  );
}
