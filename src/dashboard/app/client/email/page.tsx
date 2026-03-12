'use client';

import { useState, useEffect } from 'react';
import { useIsMobile } from '../../../lib/use-media-query';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';

// ═══════════════════════════════════════════════════
//  Freenzy.io — Email IA
//  Composez des emails parfaits avec l'aide de l'IA
// ═══════════════════════════════════════════════════

interface GeneratedEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  tone: string;
  language: string;
  createdAt: string;
}

interface EmailTemplate {
  id: string;
  title: string;
  emoji: string;
  subject: string;
  body: string;
  tone: string;
}

const STORAGE_KEY = 'fz_emails';

const TONES = ['Professionnel', 'Amical', 'Formel', 'Commercial', 'Décontracté'] as const;
const LANGUAGES = ['Français', 'English', 'Español', 'Deutsch', 'العربية'] as const;

const TEMPLATES: EmailTemplate[] = [
  { id: 't1', title: 'Candidature', emoji: '📋', tone: 'Formel', subject: 'Candidature au poste de [Poste]', body: 'Madame, Monsieur,\n\nJe me permets de vous adresser ma candidature pour le poste de [Poste] publié sur [Source].\n\nFort(e) de [X] années d\'expérience dans [Domaine], je suis convaincu(e) que mon profil correspond à vos attentes.\n\nJe reste à votre disposition pour un entretien.\n\nCordialement,\n[Votre nom]' },
  { id: 't2', title: 'Relance client', emoji: '🔄', tone: 'Professionnel', subject: 'Suivi de notre proposition — [Projet]', body: 'Bonjour [Nom],\n\nJe me permets de revenir vers vous concernant la proposition que nous vous avons envoyée le [Date].\n\nAvez-vous eu l\'occasion de l\'examiner ? Je reste disponible pour en discuter.\n\nBien cordialement,\n[Votre nom]' },
  { id: 't3', title: 'Remerciement', emoji: '🙏', tone: 'Amical', subject: 'Merci pour votre aide !', body: 'Bonjour [Nom],\n\nJe tenais à vous remercier sincèrement pour [Raison]. Votre aide a été précieuse et a fait une vraie différence.\n\nN\'hésitez pas si je peux vous rendre la pareille !\n\nChaleureusement,\n[Votre nom]' },
  { id: 't4', title: 'Invitation', emoji: '🎉', tone: 'Amical', subject: 'Invitation — [Événement]', body: 'Bonjour [Nom],\n\nJ\'ai le plaisir de vous inviter à [Événement] qui aura lieu le [Date] à [Lieu].\n\nAu programme : [Description]. Merci de confirmer votre présence avant le [Date limite].\n\nAu plaisir de vous y retrouver !\n[Votre nom]' },
  { id: 't5', title: 'Réclamation', emoji: '⚠️', tone: 'Formel', subject: 'Réclamation — Commande [Numéro]', body: 'Madame, Monsieur,\n\nJe me permets de vous contacter au sujet de ma commande [Numéro] du [Date].\n\n[Description du problème]\n\nJe vous saurais gré de bien vouloir [Action souhaitée] dans les meilleurs délais.\n\nDans l\'attente de votre retour,\n[Votre nom]' },
  { id: 't6', title: 'Partenariat', emoji: '🤝', tone: 'Professionnel', subject: 'Proposition de partenariat', body: 'Bonjour [Nom],\n\nJe suis [Votre nom], [Poste] chez [Entreprise]. Nous sommes spécialisés dans [Domaine] et je pense qu\'un partenariat entre nos structures serait mutuellement bénéfique.\n\nSeriez-vous disponible pour un appel de 15 minutes cette semaine ?\n\nCordialement,\n[Votre nom]' },
  { id: 't7', title: 'Newsletter intro', emoji: '📰', tone: 'Décontracté', subject: 'Les nouvelles de [Entreprise] — [Mois]', body: 'Hey [Prénom] !\n\nVoici les dernières nouvelles de [Entreprise] :\n\n1. [Nouveauté 1]\n2. [Nouveauté 2]\n3. [Nouveauté 3]\n\nOn a hâte de vous montrer la suite.\n\nÀ très vite !\nL\'équipe [Entreprise]' },
  { id: 't8', title: 'Demande de devis', emoji: '💰', tone: 'Professionnel', subject: 'Demande de devis — [Service/Produit]', body: 'Bonjour,\n\nNous recherchons un prestataire pour [Description du besoin].\n\nPourriez-vous nous faire parvenir un devis détaillé incluant :\n- [Critère 1]\n- [Critère 2]\n- Délais de livraison\n\nMerci d\'avance pour votre retour.\n\nCordialement,\n[Votre nom]' },
];

const TONE_GREETINGS: Record<string, { opening: string; closing: string }> = {
  'Professionnel': { opening: 'Bonjour', closing: 'Cordialement' },
  'Amical': { opening: 'Salut', closing: 'À bientôt' },
  'Formel': { opening: 'Madame, Monsieur', closing: 'Veuillez agréer mes salutations distinguées' },
  'Commercial': { opening: 'Bonjour', closing: 'Bien à vous' },
  'Décontracté': { opening: 'Hey', closing: 'Ciao' },
};

function generateEmailBody(subject: string, tone: string, lang: string): string {
  const g = TONE_GREETINGS[tone] || TONE_GREETINGS['Professionnel'];
  const langTag = lang !== 'Français' ? `[${lang}] ` : '';
  return `${langTag}${g.opening},\n\nJe vous écris au sujet de : "${subject}".\n\n[Contenu généré par l'IA — connectez l'API Anthropic pour une génération réelle]\n\nCe message a été rédigé en ton ${tone.toLowerCase()}.\n\n${g.closing},\n[Votre nom]`;
}

function seedDemoEmails(): GeneratedEmail[] {
  return [
    {
      id: 'demo-1',
      to: 'client@example.com',
      subject: 'Suivi de notre réunion du 10 mars',
      body: 'Bonjour,\n\nSuite à notre réunion du 10 mars, je vous envoie le récapitulatif des points abordés et des actions à mener.\n\n1. Validation du budget Q2\n2. Lancement de la campagne marketing\n3. Recrutement d\'un développeur senior\n\nN\'hésitez pas à revenir vers moi si vous avez des questions.\n\nCordialement,\nAlexandre',
      tone: 'Professionnel',
      language: 'Français',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'demo-2',
      to: 'partenaire@startup.io',
      subject: 'Proposition de collaboration',
      body: 'Madame, Monsieur,\n\nJe me permets de vous contacter car notre entreprise développe une solution complémentaire à la vôtre.\n\nJe suis convaincu qu\'un partenariat serait mutuellement bénéfique. Seriez-vous disponible pour un appel cette semaine ?\n\nVeuillez agréer mes salutations distinguées,\nMarie Dupont',
      tone: 'Formel',
      language: 'Français',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ];
}

export default function EmailPage() {
  const isMobile = useIsMobile();
  const meta = PAGE_META.email;

  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [tone, setTone] = useState<string>('Professionnel');
  const [language, setLanguage] = useState<string>('Français');
  const [emails, setEmails] = useState<GeneratedEmail[]>([]);
  const [activeTab, setActiveTab] = useState<'composer' | 'templates' | 'history'>('composer');
  const [copied, setCopied] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<GeneratedEmail | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setEmails(JSON.parse(stored));
      } else {
        const demo = seedDemoEmails();
        setEmails(demo);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
      }
    } catch { /* */ }
  }, []);

  function saveEmails(list: GeneratedEmail[]) {
    setEmails(list);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { /* */ }
  }

  function handleGenerate() {
    if (!subject.trim()) return;
    const generated = generateEmailBody(subject, tone, language);
    const email: GeneratedEmail = {
      id: `email-${Date.now()}`,
      to: to || 'destinataire@email.com',
      subject,
      body: generated,
      tone,
      language,
      createdAt: new Date().toISOString(),
    };
    setBody(generated);
    saveEmails([email, ...emails]);
  }

  function handleCopy() {
    const text = previewEmail ? previewEmail.body : body;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleTemplateClick(t: EmailTemplate) {
    setSubject(t.subject);
    setBody(t.body);
    setTone(t.tone);
    setActiveTab('composer');
  }

  function handleDelete(id: string) {
    saveEmails(emails.filter(e => e.id !== id));
  }

  const TABS = [
    { id: 'composer' as const, label: 'Composer', emoji: '✍️' },
    { id: 'templates' as const, label: 'Templates', emoji: '📋' },
    { id: 'history' as const, label: 'Historique', emoji: '📜' },
  ];

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-secondary)', borderRadius: 12, padding: isMobile ? 16 : 20,
    border: '1px solid var(--border-primary)',
  };

  return (
    <div style={{ padding: isMobile ? '16px 12px' : '24px 20px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: isMobile ? 22 : 28, fontWeight: 800, color: 'var(--text-primary)',
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
        }}>
          <span style={{ fontSize: isMobile ? 26 : 32 }}>{meta?.emoji}</span>
          {meta?.title}
          <HelpBubble text={meta?.helpText || ''} />
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{meta?.subtitle}</p>
      </div>
      <PageExplanation pageId="email" text={PAGE_META.email?.helpText} />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border-primary)',
            background: activeTab === tab.id ? 'var(--accent)' : 'var(--bg-secondary)',
            color: activeTab === tab.id ? '#fff' : 'var(--text-primary)',
            cursor: 'pointer', fontWeight: 600, fontSize: 13,
          }}>
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {/* Composer */}
      {activeTab === 'composer' && (
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 16 }}>
          <div style={{ flex: 1, ...cardStyle }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
              ✍️ Nouveau email
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input type="email" placeholder="Destinataire (To)" value={to} onChange={e => setTo(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-primary)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14 }} />
              <input type="text" placeholder="Objet de l'email" value={subject} onChange={e => setSubject(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-primary)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14 }} />

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <select value={tone} onChange={e => setTone(e.target.value)}
                  style={{ flex: 1, minWidth: 140, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-primary)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13 }}>
                  {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={language} onChange={e => setLanguage(e.target.value)}
                  style={{ flex: 1, minWidth: 140, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-primary)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13 }}>
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <textarea placeholder="Corps du message (optionnel — l'IA le génère pour vous)" value={body}
                onChange={e => setBody(e.target.value)} rows={8}
                style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-primary)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14, resize: 'vertical', fontFamily: 'inherit' }} />

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleGenerate} style={{
                  flex: 1, padding: '10px 16px', borderRadius: 8, border: 'none',
                  background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                }}>
                  ✨ Générer avec l'IA
                </button>
                <button onClick={handleCopy} style={{
                  padding: '10px 16px', borderRadius: 8, border: '1px solid var(--border-primary)',
                  background: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                }}>
                  {copied ? '✅ Copié' : '📋 Copier'}
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          {body && (
            <div style={{ flex: 1, ...cardStyle }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                👁️ Aperçu
              </h3>
              <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: 16, border: '1px solid var(--border-primary)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  <strong>À :</strong> {to || 'destinataire@email.com'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  <strong>Objet :</strong> {subject || '(sans objet)'}
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {body}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Templates */}
      {activeTab === 'templates' && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 12 }}>
          {TEMPLATES.map(t => (
            <div key={t.id} onClick={() => handleTemplateClick(t)} style={{
              ...cardStyle, cursor: 'pointer', transition: 'box-shadow 0.15s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 24 }}>{t.emoji}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Ton : {t.tone}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t.subject}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {emails.length === 0 && (
            <div style={{ ...cardStyle, textAlign: 'center', padding: 40 }}>
              <span style={{ fontSize: 40 }}>📭</span>
              <p style={{ color: 'var(--text-secondary)', marginTop: 12 }}>Aucun email généré pour le moment</p>
            </div>
          )}
          {emails.map(e => (
            <div key={e.id} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{e.subject}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    À : {e.to} — {e.tone} — {e.language} — {new Date(e.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setPreviewEmail(e)} style={{
                    padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border-primary)',
                    background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 12, cursor: 'pointer',
                  }}>👁️</button>
                  <button onClick={() => handleDelete(e.id)} style={{
                    padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border-primary)',
                    background: 'var(--bg-primary)', color: '#ef4444', fontSize: 12, cursor: 'pointer',
                  }}>🗑️</button>
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', maxHeight: 80, overflow: 'hidden' }}>
                {e.body}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewEmail && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: 20,
        }} onClick={() => setPreviewEmail(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--bg-primary)', borderRadius: 16, padding: 24,
            maxWidth: 600, width: '100%', maxHeight: '80vh', overflow: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>✉️ {previewEmail.subject}</h3>
              <button onClick={() => setPreviewEmail(null)} style={{
                background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-secondary)',
              }}>✕</button>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
              À : {previewEmail.to} | Ton : {previewEmail.tone} | Langue : {previewEmail.language}
            </div>
            <div style={{
              background: 'var(--bg-secondary)', borderRadius: 8, padding: 16,
              fontSize: 14, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.6,
            }}>
              {previewEmail.body}
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <button onClick={handleCopy} style={{
                padding: '8px 16px', borderRadius: 8, border: 'none',
                background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
              }}>
                {copied ? '✅ Copié' : '📋 Copier le texte'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
