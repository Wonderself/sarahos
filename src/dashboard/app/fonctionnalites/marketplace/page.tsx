'use client';

import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import Link from 'next/link';
import { useState } from 'react';

const STEPS = [
  {
    icon: 'search',
    title: 'Parcourez le catalogue',
    desc: '50+ modules class\u00e9s par cat\u00e9gorie et m\u00e9tier. Trouvez exactement ce qu\u2019il vous faut en quelques secondes.',
  },
  {
    icon: 'download',
    title: 'Installez en un clic',
    desc: 'Activez un module instantan\u00e9ment, z\u00e9ro configuration. Il est pr\u00eat \u00e0 utiliser imm\u00e9diatement.',
  },
  {
    icon: 'tune',
    title: 'Personnalisez',
    desc: 'Adaptez chaque module \u00e0 votre contexte professionnel. Modifiez les prompts, les param\u00e8tres et les workflows.',
  },
];

const CATEGORIES = [
  {
    icon: 'restaurant',
    title: 'Restauration',
    desc: 'Menus, r\u00e9servations, gestion fournisseurs.',
    color: '#f59e0b',
  },
  {
    icon: 'account_balance',
    title: 'Comptabilit\u00e9',
    desc: 'Factures, d\u00e9clarations, rapports financiers.',
    color: '#22c55e',
  },
  {
    icon: 'apartment',
    title: 'Immobilier',
    desc: 'Mandats, compromis, suivi acqu\u00e9reurs.',
    color: '#06b6d4',
  },
  {
    icon: 'local_hospital',
    title: 'Sant\u00e9',
    desc: 'Comptes rendus, ordonnances, dossiers patients.',
    color: '#ef4444',
  },
  {
    icon: 'gavel',
    title: 'Juridique',
    desc: 'Contrats, mises en demeure, statuts soci\u00e9t\u00e9.',
    color: '#8b5cf6',
  },
  {
    icon: 'school',
    title: 'Formation',
    desc: 'Supports de cours, \u00e9valuations, certifications.',
    color: '#ec4899',
  },
];

const FEATURED_MODULES = [
  {
    icon: 'restaurant_menu',
    title: 'Pack Restaurant Complet',
    desc: 'Menus IA, r\u00e9servations, gestion stocks, fiches fournisseurs et alertes DLUO inclus.',
    installs: '2.4k',
    color: '#f59e0b',
  },
  {
    icon: 'calculate',
    title: 'Kit Comptable Premium',
    desc: 'G\u00e9n\u00e9ration factures, rapprochement bancaire, d\u00e9clarations TVA et bilans automatis\u00e9s.',
    installs: '1.8k',
    color: '#22c55e',
  },
  {
    icon: 'real_estate_agent',
    title: 'Pipeline Immobilier',
    desc: 'Mandats, compromis, suivi acqu\u00e9reurs, relances automatiques et estimations IA.',
    installs: '1.2k',
    color: '#06b6d4',
  },
];

const FAQS = [
  {
    q: 'Les modules sont-ils compatibles entre eux ?',
    a: 'Oui. Tous les modules sont con\u00e7us pour fonctionner ensemble. Vous pouvez combiner plusieurs modules et ils partageront les m\u00eames donn\u00e9es et workflows sans conflit.',
  },
  {
    q: 'Puis-je cr\u00e9er et partager mes propres modules ?',
    a: 'Absolument. Vous pouvez cr\u00e9er vos propres modules personnalis\u00e9s et les publier sur la marketplace pour les partager avec la communaut\u00e9.',
  },
  {
    q: 'Combien co\u00fbtent les modules premium ?',
    a: 'Les modules de base sont gratuits. Les modules premium co\u00fbtent entre 5 et 20 cr\u00e9dits selon leur complexit\u00e9. Une fois install\u00e9, le module est disponible sans co\u00fbt r\u00e9current.',
  },
  {
    q: 'Comment sont v\u00e9rifi\u00e9s les modules communautaires ?',
    a: 'Chaque module soumis passe par un processus de v\u00e9rification : qualit\u00e9 des prompts, s\u00e9curit\u00e9 des donn\u00e9es et conformit\u00e9 RGPD. Seuls les modules valid\u00e9s sont publi\u00e9s.',
  },
  {
    q: 'Puis-je d\u00e9sinstaller un module \u00e0 tout moment ?',
    a: 'Oui. Vous pouvez d\u00e9sactiver ou supprimer un module en un clic depuis votre tableau de bord. Vos donn\u00e9es restent accessibles m\u00eame apr\u00e8s d\u00e9sinstallation.',
  },
];

export default function MarketplacePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
    <div style={{ background: '#0f0720', color: '#fff', minHeight: '100vh' }}>
      <PublicNav />

      {/* Hero */}
      <section style={{ paddingTop: 140, paddingBottom: 80, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -200, left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 100, padding: '8px 20px', marginBottom: 28, fontSize: 14, color: '#a78bfa' }}>
            <span className="material-symbols-rounded" style={{ fontSize: 18 }}>storefront</span>
            Marketplace &mdash; 50+ Templates
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 20px' }}>
            Des modules pr&ecirc;ts &agrave; l&apos;emploi<br />
            <span style={{ background: accentGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>pour chaque besoin</span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: 'rgba(255,255,255,0.7)', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.6 }}>
            Une marketplace de templates et modules propuls&eacute;s par l&apos;IA. Installez, personnalisez et automatisez vos workflows m&eacute;tier en quelques clics.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/client/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: accentGradient, color: '#fff', padding: '14px 32px', borderRadius: 10, fontWeight: 600, fontSize: 16, textDecoration: 'none' }}>
              Explorer la marketplace
              <span className="material-symbols-rounded" style={{ fontSize: 20 }}>arrow_forward</span>
            </Link>
            <Link href="/demo" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '14px 32px', borderRadius: 10, fontWeight: 600, fontSize: 16, textDecoration: 'none' }}>
              Voir la d&eacute;mo
            </Link>
          </div>
        </div>
      </section>

      {/* Comment ca marche */}
      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Comment &ccedil;a marche ?
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 56, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Trois &eacute;tapes pour automatiser votre m&eacute;tier.
        </p>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{ ...cardStyle, flex: '1 1 280px', maxWidth: 340, textAlign: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', width: 36, height: 36, borderRadius: '50%', background: accentGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 }}>
                {i + 1}
              </div>
              <span className="material-symbols-rounded" style={{ fontSize: 40, color: '#7c3aed', marginBottom: 16, display: 'block', marginTop: 12 }}>{step.icon}</span>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{step.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories showcase */}
      <section style={{ ...sectionStyle, paddingTop: 40 }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Des modules pour chaque secteur
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 56, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          6 cat&eacute;gories m&eacute;tier, 50+ modules sp&eacute;cialis&eacute;s.
        </p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {CATEGORIES.map((cat, i) => (
            <div key={i} style={{ ...cardStyle, flex: '1 1 320px', maxWidth: 360 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${cat.color}15`, border: `1px solid ${cat.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <span className="material-symbols-rounded" style={{ fontSize: 26, color: cat.color }}>{cat.icon}</span>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{cat.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14.5, lineHeight: 1.65, margin: 0 }}>{cat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured modules */}
      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Modules les plus populaires
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 48, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Install&eacute;s par des milliers de professionnels.
        </p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {FEATURED_MODULES.map((mod, i) => (
            <div key={i} style={{ ...cardStyle, flex: '1 1 300px', maxWidth: 360, position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${mod.color}15`, border: `1px solid ${mod.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 28, color: mod.color }}>{mod.icon}</span>
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{mod.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 15 }}>download</span>
                    {mod.installs} installations
                  </div>
                </div>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14.5, lineHeight: 1.65, margin: '0 0 20px' }}>{mod.desc}</p>
              <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa', padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                <span className="material-symbols-rounded" style={{ fontSize: 16 }}>add</span>
                Installer
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Create your own */}
      <section style={sectionStyle}>
        <div style={{ ...cardStyle, maxWidth: 800, margin: '0 auto', background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.12)', textAlign: 'center', padding: '48px 40px' }}>
          <span className="material-symbols-rounded" style={{ fontSize: 48, color: '#7c3aed', marginBottom: 16, display: 'block' }}>build</span>
          <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 700, marginBottom: 12 }}>
            Cr&eacute;ez vos propres modules
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.7, maxWidth: 560, margin: '0 auto 28px' }}>
            Concevez des modules sur mesure pour votre activit&eacute;, puis partagez-les avec la communaut&eacute;.
            Chaque module publi&eacute; vous rapporte des cr&eacute;dits &agrave; chaque installation.
          </p>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
            {[
              { icon: 'code', label: '\u00c9diteur visuel int\u00e9gr\u00e9' },
              { icon: 'share', label: 'Publication en un clic' },
              { icon: 'monetization_on', label: 'Gagnez des cr\u00e9dits' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 600 }}>
                <span className="material-symbols-rounded" style={{ fontSize: 20, color: '#a78bfa' }}>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
          <Link href="/client/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: accentGradient, color: '#fff', padding: '14px 32px', borderRadius: 10, fontWeight: 600, fontSize: 16, textDecoration: 'none' }}>
            Commencer &agrave; cr&eacute;er
            <span className="material-symbols-rounded" style={{ fontSize: 20 }}>arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* Pricing */}
      <section style={sectionStyle}>
        <div style={{ ...cardStyle, textAlign: 'center', maxWidth: 600, margin: '0 auto', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}>
          <span className="material-symbols-rounded" style={{ fontSize: 40, color: '#7c3aed', marginBottom: 12, display: 'block' }}>payments</span>
          <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 700, marginBottom: 12 }}>
            Tarification simple
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>
            Les modules de base sont <strong style={{ color: '#fff' }}>gratuits et inclus</strong> dans votre compte.
            <br />Les modules premium co&ucirc;tent entre 5 et 20 cr&eacute;dits selon leur complexit&eacute;.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#7c3aed' }}>0</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>modules gratuits</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#7c3aed' }}>5-20</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>cr&eacute;dits / premium</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#7c3aed' }}>50</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>cr&eacute;dits offerts</div>
            </div>
          </div>
          <Link href="/client/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: accentGradient, color: '#fff', padding: '14px 32px', borderRadius: 10, fontWeight: 600, fontSize: 16, textDecoration: 'none' }}>
            Cr&eacute;er mon compte gratuit
            <span className="material-symbols-rounded" style={{ fontSize: 20 }}>arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Questions fr&eacute;quentes
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 48, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Tout savoir sur la marketplace de modules.
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
          Pr&ecirc;t &agrave; explorer la marketplace ?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 32, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          50 cr&eacute;dits offerts &mdash; acc&eacute;dez &agrave; tous les modules gratuits d&egrave;s maintenant.
        </p>
        <Link href="/client/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: accentGradient, color: '#fff', padding: '16px 40px', borderRadius: 10, fontWeight: 700, fontSize: 17, textDecoration: 'none' }}>
          Accéder à Freenzy
          <span className="material-symbols-rounded" style={{ fontSize: 22 }}>rocket_launch</span>
        </Link>
      </section>

      <PublicFooter />
    </div>
  );
}
