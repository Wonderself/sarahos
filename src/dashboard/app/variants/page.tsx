'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import PublicNav from '../../components/PublicNav';
import PublicFooter from '../../components/PublicFooter';

/* ═══════════════════════════════════════════════════════════
   DATA — 15 variantes de landing (1 prod + 8 design + 6 copy-test)
   ═══════════════════════════════════════════════════════════ */

interface Variant {
  id: string;
  name: string;
  category: 'production' | 'design' | 'copy-test';
  route: string;
  icon: string;
  color: string;
  score: number;
  summary: string;
  badge?: string;
  bestFor?: string;
}

const VARIANTS: Variant[] = [
  {
    id: 'main-v11',
    name: 'Landing V11 (Production)',
    category: 'production',
    route: '/',
    icon: 'rocket_launch',
    color: '#7c3aed',
    score: 71,
    badge: 'EN PROD',
    bestFor: 'Version actuelle en production',
    summary: `Version en production. Audience switcher Particulier / Freelance / Entreprise qui adapte tout le contenu (hero, FAQ, sections). GA4 Consent Mode v2 avec bandeau RGPD. FAQ de 103 questions reordonnees dynamiquement selon le profil selectionne. URL params pour tracking campagnes (?audience=freelance&utm_source=...).

Hero adaptatif avec titre, sous-titre et CTA qui changent selon l'audience. 13 sections completes : hero, ticker partenaires, demo interactive 4 onglets, ecosysteme IA, 24 agents, WhatsApp mockup, creation sur mesure, marketplace, tarifs, temoignages, FAQ, CTA final, footer.

Design blue-violet #7c3aed, Material Symbols Rounded, dark theme #0f0720. Section Enterprise conditionnelle (visible uniquement en mode Entreprise). ~1028 lignes, ~65KB. C'est la version la plus complete et la plus testee. Score 71/100 : solide mais perfectible sur le copywriting et les temoignages (encore fictifs).`,
  },
  {
    id: 'original',
    name: 'Original (V8 freeze)',
    category: 'design',
    route: '/variants/original',
    icon: 'history',
    color: '#7c3aed',
    score: 55,
    bestFor: 'Temoin A/B (sans audience switcher)',
    summary: `Snapshot fige de la V8, avant l'ajout du switcher audience et de GA4. Meme structure que la production mais hero generique identique pour tous les visiteurs. Section Enterprise toujours visible (pas de filtre audience).

Sert de reference A/B pour mesurer l'impact du switcher audience sur les conversions. Meme palette blue-violet #7c3aed, Material Icons, dark theme. Pas de cookie consent RGPD, pas de tracking GA4.

Utile pour comparer : est-ce que la personnalisation par audience ameliore vraiment le taux de conversion ? A garder comme temoin experimental. Score 55/100 : fonctionnel mais depasse par les evolutions V9-V11.`,
  },
  {
    id: 'original-v2',
    name: 'Original V2',
    category: 'design',
    route: '/variants/original-v2',
    icon: 'content_copy',
    color: '#7c3aed',
    score: 71,
    bestFor: 'Backup stable de la V11',
    summary: `Copie quasi-identique de la production V11. Meme audience switcher, GA4 Consent Mode v2, FAQ reordonnees par audience. Hero adaptatif, 13 sections completes. Existe pour comparaison historique et comme base pour les copy-tests.

Les 6 variantes copy-test (ROI, FOMO, Simplicite, etc.) ont ete creees a partir de cette base. C'est la "version propre" avant modifications de copywriting.

Score identique a la prod (71/100). Garde comme reference stable pendant que la prod continue d'evoluer. Si la prod casse, on peut revenir sur cette version.`,
  },
  {
    id: 'bold-disrupteur',
    name: 'Bold Disrupteur',
    category: 'design',
    route: '/variants/bold-disrupteur',
    icon: 'flash_on',
    color: '#ff3b30',
    score: 25,
    bestFor: 'Campagnes Facebook Ads agressives',
    summary: `Design polarisant : rouge vif #ff3b30 + jaune #ffe600 sur fond sombre #1a1a2e. Typographie XXL surdimensionnee, messaging provocateur et direct ("Facebook c'est fini", "Arretez de perdre du temps").

Style inspire de Y Combinator et des pages de vente americaines. Audience switcher + GA4 integres. CTA agressifs avec urgence implicite.

VERDICT : Trop agressif pour le marche francais des PME. L'esthetique "promo/soldes" nuit a la credibilite d'un produit SaaS premium. Le rouge + jaune evoque le discount, pas l'innovation. Score 25/100 : a eviter comme landing principale. Peut servir pour des campagnes Facebook Ads tres ciblees court terme.`,
  },
  {
    id: 'gradient-wave',
    name: 'Gradient Wave',
    category: 'design',
    route: '/variants/gradient-wave',
    icon: 'waves',
    color: '#7c3aed',
    score: 72,
    badge: 'TOP DESIGN',
    bestFor: 'Candidat #1 pour remplacer la prod',
    summary: `Degrades fluides purple #7c3aed vers cyan #06b6d4. Glassmorphism avec cartes semi-transparentes et backdrop-blur. Style inspire de Linear, Vercel, Raycast — les references du design SaaS moderne.

Messaging equilibre : "Le futur est arrive" — ambitieux sans etre agressif. Audience switcher + GA4 + FAQ reordonnees integres. Animations douces, transitions fluides.

VERDICT : Le plus equilibre de toutes les variantes design. Moderne, professionnel, accessible. Le meilleur candidat pour remplacer la landing production actuelle. Le degrade purple-cyan est distinctif sans etre fatiguant. Score 72/100 : meilleur score parmi les variantes design. A considerer serieusement pour la prochaine iteration.`,
  },
  {
    id: 'minimal-luxe',
    name: 'Minimal Luxe',
    category: 'design',
    route: '/variants/minimal-luxe',
    icon: 'diamond',
    color: '#c8a97e',
    score: 52,
    bestFor: 'Professions liberales haut de gamme',
    summary: `Tons creme #e8ddd0 et or #c8a97e sur fond chaud #1a1715. Typographie fine et elegante, espacement genereux, beaucoup de blanc (enfin, de beige). Style Apple Store / Notion.

Messaging calme et pose : "Tout. Simplifie." — minimaliste dans le ton comme dans le design. Ideal pour professions liberales, cabinets, consultants haut de gamme.

VERDICT : Beau mais problematique. Le fond clair cree un clash visuel violent avec le dark dashboard apres login. Le style "luxe" peut contredire le message "gratuit / 0% commission". Score 52/100 : esthetiquement reussi mais deconnecte du reste du produit.`,
  },
  {
    id: 'neon-futuriste',
    name: 'Neon Futuriste',
    category: 'design',
    route: '/variants/neon-futuriste',
    icon: 'blur_on',
    color: '#00f0ff',
    score: 42,
    bestFor: 'Landing Product Hunt',
    summary: `Neons cyan #00f0ff et vert acide #b8ff00 sur fond ultra-sombre #0a001a. Esthetique cyberpunk assumee, effets de glow, textes luminescents. Messaging agressif : "Une seule app. Pour tout."

Audience switcher + GA4 integres. Animations neon pulsantes. Visuellement memorable et distinctif — on ne confond avec aucun autre SaaS.

VERDICT : Trop niche. Les PME traditionnelles (coeur de cible) seront rebutees par l'esthetique "jeu video". Fatigue visuelle rapide sur mobile a cause des contrastes extremes. Score 42/100 : garde pour le fun mais pas pour la conversion. Pourrait servir pour une landing Product Hunt.`,
  },
  {
    id: 'v019-mercredi',
    name: 'v0.19 Mercredi',
    category: 'design',
    route: '/variants/v019-mercredi',
    icon: 'calendar_today',
    color: '#6366f1',
    score: 30,
    bestFor: 'Archive historique (1er deploy)',
    summary: `Premier deploy sur Coolify le 5 mars (mercredi). Snapshot historique de la toute premiere version mise en ligne. Emojis partout (avant la migration vers Material Icons), compteur "72 agents", indigo #6366f1.

Pas de responsive optimise, pas de cookie consent RGPD, pas de segmentation audience. Structure basique sans les 3 jours de polish V3-V11.

VERDICT : Valeur historique uniquement. Montre le chemin parcouru en 3 jours. A garder comme souvenir du premier deploy mais jamais a reutiliser. Score 30/100.`,
  },
  {
    id: 'v019-mercredi-v2',
    name: 'v0.19 Mercredi V2',
    category: 'design',
    route: '/variants/v019-mercredi-v2',
    icon: 'update',
    color: '#6366f1',
    score: 38,
    bestFor: 'Test audience switcher sur vieille base',
    summary: `Version mercredi (1er deploy) avec audience switcher + GA4 + FAQ reordonnees ajoutes par dessus. Test : est-ce que le switcher ameliore meme une vieille version ?

Meme structure emojis + indigo que la V1 mercredi, mais contenu personnalise par audience. Le switcher fonctionne mais parait visuellement deconnecte du style global (emojis + Material Icons melanges).

VERDICT : Experience interessante. Prouve que le switcher audience apporte de la valeur meme sur une base mediocre. Mais pas utilisable en production. Score 38/100 : amelioration vs v1 (+8 points) grace au switcher.`,
  },
  {
    id: 'roi-economie',
    name: 'ROI / Economies',
    category: 'copy-test',
    route: '/variants/copy-tests/roi-economie',
    icon: 'savings',
    color: '#22c55e',
    score: 68,
    bestFor: 'Freelances et TPE sensibles au prix',
    summary: `Angle copywriting : chiffres et economies. Hero percutant "Remplacez 5 employes pour le prix d'un cafe". Comparaison systematique cout IA vs salaire humain pour chaque agent.

Section tarifs/credits promue en 3e position (au lieu de 8e). Remplacement de la section "Pourquoi Freenzy" par "Les chiffres, rien que les chiffres". CTA principal : "Calculer mes economies".

VERDICT : Tres efficace pour freelances et TPE sensibles au prix. L'argument economique est le plus rationnel et le plus verifiable. Risque : peut paraitre "cheap" pour les entreprises qui cherchent de la qualite avant le prix. Score 68/100 : solide angle commercial. Base design Original V2 avec audience switcher.`,
  },
  {
    id: 'urgence-fomo',
    name: 'Urgence / FOMO',
    category: 'copy-test',
    route: '/variants/copy-tests/urgence-fomo',
    icon: 'timer',
    color: '#ef4444',
    score: 62,
    bestFor: 'Campagnes growth hacking 7-14 jours',
    summary: `Angle copywriting : peur de manquer. Hero anxiogene "Vos concurrents automatisent deja". Strip urgence avec compteurs animes (nombre d'inscrits, places restantes). Badge dot vert anime + "5 000 places a 0% commission — ne ratez pas".

CTA principal : "Prendre ma place" (au lieu de "Commencer gratuitement"). Countdown implicite, social proof par les chiffres.

VERDICT : Efficace pour des campagnes courtes (7-14 jours) mais dangereux a long terme. Les compteurs statiques (pas de vrai backend) detruisent la credibilite si le visiteur revient. Score 62/100 : bon pour du growth hacking ponctuel, mauvais pour la confiance long terme. A utiliser avec un vrai systeme de compteurs dynamiques.`,
  },
  {
    id: 'simplicite',
    name: 'Simplicite / Anti-tech',
    category: 'copy-test',
    route: '/variants/copy-tests/simplicite',
    icon: 'touch_app',
    color: '#3b82f6',
    score: 70,
    badge: 'STRATEGIQUE',
    bestFor: 'Coeur de cible non-tech (35-55 ans)',
    summary: `Angle copywriting : zero complexite technique. Hero rassurant "Envoyez un WhatsApp. Votre IA fait le reste." WhatsApp promu en 3e section avec 6 exemples de messages concrets.

Section "3 etapes" ajoutee (1. Ecrivez 2. L'IA agit 3. Resultat). Suppression de TECH_FEATURES (specs techniques qui font peur). CTA principal : "Essayer maintenant".

VERDICT : Ideal pour le coeur de cible non-tech (artisans, commercants, professions liberales, 35-55 ans). Le message "WhatsApp = interface" est le plus differenciateur de Freenzy. Score 70/100 : tres pertinent strategiquement. Deuxieme meilleur copy-test. A combiner avec la preuve sociale pour un maximum d'impact.`,
  },
  {
    id: 'preuve-sociale',
    name: 'Preuve Sociale',
    category: 'copy-test',
    route: '/variants/copy-tests/preuve-sociale',
    icon: 'groups',
    color: '#9333ea',
    score: 65,
    bestFor: 'Marketing classique / confiance',
    summary: `Angle copywriting : confiance et autorite. Hero rassurant "Deja adopte par des milliers de professionnels." Logos partenaires technologiques (Anthropic, Twilio, ElevenLabs). 4 temoignages clients avec photo, nom, metier.

Stats panel : "2 400+ utilisateurs", "99.9% uptime", "24 agents IA". Section securite renforcee (chiffrement, RGPD, hebergement France). CTA principal : "Rejoindre la communaute".

VERDICT : L'approche la plus classique et la plus eprouvee en marketing. ATTENTION CRITIQUE : les temoignages sont fictifs — a remplacer imperativement par de vrais retours avant mise en production. Score 65/100 : bon framework mais les faux temoignages sont un risque legal et de reputation.`,
  },
  {
    id: 'probleme-solution',
    name: 'Probleme / Solution',
    category: 'copy-test',
    route: '/variants/copy-tests/probleme-solution',
    icon: 'lightbulb',
    color: '#f97316',
    score: 72,
    badge: 'TOP COPY',
    bestFor: 'Freelances surcharges (framework PAS)',
    summary: `Angle copywriting : framework PAS (Problem-Agitate-Solve). Hero empathique "Noye dans l'admin ? On a la solution." Strip de 4 problemes concrets (appels manques, devis en retard, posts non publies, compta en retard).

Transition avant/apres avec comparaison visuelle. Chaque section agite un probleme puis presente la solution Freenzy correspondante. CTA principal : "Reprendre le controle".

VERDICT : Le plus efficace en copywriting pur. Le framework PAS est prouve par des decennies de direct response marketing. Fonctionne particulierement bien pour les freelances surcharges qui se reconnaissent dans les problemes decrits. Score 72/100 : meilleur score copy-test ex aequo avec Gradient Wave. A tester en A/B contre la prod.`,
  },
  {
    id: 'vision-futuriste',
    name: 'Vision Futuriste',
    category: 'copy-test',
    route: '/variants/copy-tests/vision-futuriste',
    icon: 'auto_awesome',
    color: '#8b5cf6',
    score: 58,
    bestFor: 'Product Hunt / Hacker News / PR',
    summary: `Angle copywriting : futur du travail. Hero ambitieux "Le CEO du futur ne travaille plus seul." Showcase unique de 6 modeles IA utilises (Claude Opus, Sonnet, Haiku, etc.). Framing futuriste : "L'intelligence artificielle en action".

CTA principal : "Devenir pionnier". Ton aspirationnel et visionnaire. S'adresse aux early adopters et innovateurs.

VERDICT : Trop niche pour le marche global des PME francaises. Le positionnement "futur" ne resout pas un probleme concret et immediat. Ideal pour Product Hunt, Hacker News, communautes tech. Score 58/100 : bon pour la notoriete, mauvais pour la conversion PME. A garder pour du PR et des lancements communautaires.`,
  },
];

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */

const CATEGORY_META: Record<Variant['category'], { label: string; color: string; bg: string }> = {
  production: { label: 'EN PROD', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  design: { label: 'DESIGN', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  'copy-test': { label: 'COPY TEST', color: '#9333ea', bg: 'rgba(147,51,234,0.12)' },
};

function scoreColor(score: number) {
  if (score >= 65) return '#22c55e';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
}

type SortKey = 'score-desc' | 'score-asc' | 'name' | 'category';

function sortVariants(variants: Variant[], sort: SortKey): Variant[] {
  const sorted = [...variants];
  switch (sort) {
    case 'score-desc': return sorted.sort((a, b) => b.score - a.score);
    case 'score-asc': return sorted.sort((a, b) => a.score - b.score);
    case 'name': return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'category': {
      const order = { production: 0, design: 1, 'copy-test': 2 };
      return sorted.sort((a, b) => order[a.category] - order[b.category] || b.score - a.score);
    }
    default: return sorted;
  }
}

/* ═══════════════════════════════════════════════════════════
   STATS BAR
   ═══════════════════════════════════════════════════════════ */

function StatsBar() {
  const avgScore = Math.round(VARIANTS.reduce((s, v) => s + v.score, 0) / VARIANTS.length);
  const topVariant = [...VARIANTS].sort((a, b) => b.score - a.score)[0];
  const stats = [
    { icon: 'analytics', label: 'Score moyen', value: `${avgScore}/100`, color: scoreColor(avgScore) },
    { icon: 'emoji_events', label: 'Meilleur score', value: `${topVariant.score}/100`, color: '#22c55e' },
    { icon: 'layers', label: 'Variantes', value: String(VARIANTS.length), color: '#7c3aed' },
    { icon: 'star', label: 'Score 65+', value: String(VARIANTS.filter(v => v.score >= 65).length), color: '#f59e0b' },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 12,
      maxWidth: 1100,
      margin: '0 auto 32px',
      padding: '0 20px',
    }}>
      {stats.map(s => (
        <div key={s.label} style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12,
          padding: '16px 14px',
          textAlign: 'center',
        }}>
          <span className="material-symbols-rounded" style={{ fontSize: 20, color: s.color, marginBottom: 6, display: 'block' }}>
            {s.icon}
          </span>
          <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   COMPARE DRAWER
   ═══════════════════════════════════════════════════════════ */

function CompareDrawer({ selected, onClear }: {
  selected: Variant[];
  onClear: () => void;
}) {
  if (selected.length < 2) return null;
  const [a, b] = selected;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(15,7,32,0.95)', backdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      padding: '20px 20px 24px',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
            <span className="material-symbols-rounded" style={{ fontSize: 18, verticalAlign: -3, marginRight: 6 }}>compare</span>
            Comparaison
          </h3>
          <button onClick={onClear} style={{
            background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8,
            color: 'rgba(255,255,255,0.5)', padding: '6px 14px', fontSize: 12,
            fontWeight: 600, cursor: 'pointer',
          }}>
            Fermer
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'start' }}>
          {/* Variant A */}
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16, border: `1px solid ${a.color}30` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span className="material-symbols-rounded" style={{ fontSize: 18, color: a.color }}>{a.icon}</span>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{a.name}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: scoreColor(a.score), marginBottom: 4 }}>{a.score}/100</div>
            {a.bestFor && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{a.bestFor}</div>}
            <Link href={a.route} target="_blank" style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 10,
              fontSize: 12, color: a.color, textDecoration: 'none', fontWeight: 600,
            }}>
              <span className="material-symbols-rounded" style={{ fontSize: 14 }}>open_in_new</span> Voir
            </Link>
          </div>

          {/* VS */}
          <div style={{
            alignSelf: 'center', background: 'rgba(255,255,255,0.06)', borderRadius: 20,
            padding: '6px 14px', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.1em',
          }}>
            VS
          </div>

          {/* Variant B */}
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16, border: `1px solid ${b.color}30` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span className="material-symbols-rounded" style={{ fontSize: 18, color: b.color }}>{b.icon}</span>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{b.name}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: scoreColor(b.score), marginBottom: 4 }}>{b.score}/100</div>
            {b.bestFor && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{b.bestFor}</div>}
            <Link href={b.route} target="_blank" style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 10,
              fontSize: 12, color: b.color, textDecoration: 'none', fontWeight: 600,
            }}>
              <span className="material-symbols-rounded" style={{ fontSize: 14 }}>open_in_new</span> Voir
            </Link>
          </div>
        </div>

        {/* Score diff */}
        <div style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
          {a.score === b.score
            ? 'Scores identiques'
            : `${a.score > b.score ? a.name : b.name} a ${Math.abs(a.score - b.score)} points de plus`}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════ */

export default function VariantsRecapPage() {
  const [filter, setFilter] = useState<'all' | Variant['category']>('all');
  const [sort, setSort] = useState<SortKey>('score-desc');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const base = filter === 'all' ? VARIANTS : VARIANTS.filter(v => v.category === filter);
    return sortVariants(base, sort);
  }, [filter, sort]);

  const compareVariants = useMemo(
    () => compareIds.map(id => VARIANTS.find(v => v.id === id)!).filter(Boolean),
    [compareIds],
  );

  const toggleCompare = (id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const filters: { key: typeof filter; label: string }[] = [
    { key: 'all', label: `Toutes (${VARIANTS.length})` },
    { key: 'production', label: 'Production' },
    { key: 'design', label: `Design (${VARIANTS.filter(v => v.category === 'design').length})` },
    { key: 'copy-test', label: `Copy Test (${VARIANTS.filter(v => v.category === 'copy-test').length})` },
  ];

  const sorts: { key: SortKey; label: string; icon: string }[] = [
    { key: 'score-desc', label: 'Score', icon: 'arrow_downward' },
    { key: 'score-asc', label: 'Score', icon: 'arrow_upward' },
    { key: 'name', label: 'Nom', icon: 'sort_by_alpha' },
    { key: 'category', label: 'Type', icon: 'category' },
  ];

  return (
    <>
      <PublicNav />
      <main style={{ minHeight: '100vh', background: '#0f0720', color: '#fff', paddingTop: 56 }}>

        {/* Header */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 20px 20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em' }}>
            Recap des Versions Landing
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', maxWidth: 600, margin: '0 auto 32px' }}>
            {VARIANTS.length} variantes testees — {VARIANTS.filter(v => v.category === 'design').length} design,{' '}
            {VARIANTS.filter(v => v.category === 'copy-test').length} copy-test, 1 en production.
            Selectionnez 2 variantes pour les comparer cote a cote.
          </p>
        </section>

        {/* Stats */}
        <StatsBar />

        {/* Filters + Sort */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 12px' }}>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
            {filters.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 20,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  background: filter === f.key ? '#7c3aed' : 'rgba(255,255,255,0.06)',
                  color: filter === f.key ? '#fff' : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.2s',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort row */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', alignSelf: 'center', marginRight: 4 }}>Trier :</span>
            {sorts.map(s => (
              <button
                key={s.key}
                onClick={() => setSort(s.key)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '5px 12px', borderRadius: 14, border: 'none', cursor: 'pointer',
                  fontSize: 11, fontWeight: 600,
                  background: sort === s.key ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.03)',
                  color: sort === s.key ? '#a78bfa' : 'rgba(255,255,255,0.35)',
                  transition: 'all 0.2s',
                }}
              >
                <span className="material-symbols-rounded" style={{ fontSize: 14 }}>{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </section>

        {/* Compare hint */}
        {compareIds.length === 1 && (
          <div style={{
            textAlign: 'center', padding: '8px 20px', fontSize: 12, color: '#a78bfa',
            animation: 'lp-fade-in 0.3s ease',
          }}>
            <span className="material-symbols-rounded" style={{ fontSize: 14, verticalAlign: -2, marginRight: 4 }}>compare</span>
            1 variante selectionnee — choisissez-en une 2e pour comparer
          </div>
        )}

        {/* Cards grid */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 20px 80px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 20,
          }}>
            {filtered.map((v, idx) => {
              const cat = CATEGORY_META[v.category];
              const isComparing = compareIds.includes(v.id);
              const isExpanded = expandedId === v.id;
              const summaryLines = v.summary.split('\n\n');
              const shortSummary = summaryLines[0];

              return (
                <div
                  key={v.id}
                  style={{
                    background: isComparing ? 'rgba(124,58,237,0.06)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isComparing ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 16,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s',
                  }}
                >
                  {/* Accent stripe */}
                  <div style={{ height: 3, background: v.color }} />

                  <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Header row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span
                        className="material-symbols-rounded"
                        style={{
                          fontSize: 22,
                          color: v.color,
                          background: `${v.color}15`,
                          borderRadius: 8,
                          padding: 6,
                        }}
                      >
                        {v.icon}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>{v.name}</div>
                      </div>
                      {/* Category badge */}
                      <span style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: cat.bg,
                        color: cat.color,
                        letterSpacing: '0.05em',
                      }}>
                        {cat.label}
                      </span>
                    </div>

                    {/* Recommendation badge + bestFor */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                      {v.badge && (
                        <span style={{
                          fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 4,
                          background: v.score >= 70 ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                          color: v.score >= 70 ? '#22c55e' : '#f59e0b',
                          letterSpacing: '0.06em',
                        }}>
                          {v.badge}
                        </span>
                      )}
                      {v.bestFor && (
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>
                          {v.bestFor}
                        </span>
                      )}
                    </div>

                    {/* Score */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <div style={{
                        flex: 1,
                        height: 4,
                        borderRadius: 2,
                        background: 'rgba(255,255,255,0.06)',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${v.score}%`,
                          height: '100%',
                          borderRadius: 2,
                          background: scoreColor(v.score),
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                      <span style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: scoreColor(v.score),
                        minWidth: 40,
                        textAlign: 'right',
                      }}>
                        {v.score}/100
                      </span>
                    </div>

                    {/* Summary — collapsible */}
                    <p style={{
                      fontSize: 13,
                      lineHeight: 1.7,
                      color: 'rgba(255,255,255,0.55)',
                      whiteSpace: 'pre-line',
                      flex: 1,
                      marginBottom: 12,
                    }}>
                      {isExpanded ? v.summary : shortSummary}
                    </p>

                    {summaryLines.length > 1 && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : v.id)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 600,
                          padding: '4px 0', marginBottom: 12, textAlign: 'left',
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                        }}
                      >
                        <span className="material-symbols-rounded" style={{ fontSize: 14 }}>
                          {isExpanded ? 'expand_less' : 'expand_more'}
                        </span>
                        {isExpanded ? 'Moins' : 'Lire la suite'}
                      </button>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 'auto' }}>
                      <Link
                        href={v.route}
                        target="_blank"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '8px 16px',
                          borderRadius: 8,
                          background: `${v.color}18`,
                          color: v.color,
                          fontSize: 12,
                          fontWeight: 600,
                          textDecoration: 'none',
                          transition: 'background 0.2s',
                        }}
                      >
                        <span className="material-symbols-rounded" style={{ fontSize: 16 }}>open_in_new</span>
                        Voir
                      </Link>

                      <button
                        onClick={() => toggleCompare(v.id)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                          background: isComparing ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
                          color: isComparing ? '#a78bfa' : 'rgba(255,255,255,0.35)',
                          fontSize: 12, fontWeight: 600, transition: 'all 0.2s',
                        }}
                      >
                        <span className="material-symbols-rounded" style={{ fontSize: 16 }}>
                          {isComparing ? 'check_circle' : 'compare'}
                        </span>
                        {isComparing ? 'Selectionnee' : 'Comparer'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recommendations */}
        <section style={{
          maxWidth: 1100, margin: '0 auto', padding: '0 20px 80px',
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20, textAlign: 'center' }}>
            <span className="material-symbols-rounded" style={{ fontSize: 22, verticalAlign: -4, marginRight: 8 }}>recommend</span>
            Recommandations
          </h2>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16,
          }}>
            {[
              {
                icon: 'trending_up',
                title: 'Prochaine iteration prod',
                desc: 'Gradient Wave (72) + copywriting Probleme-Solution (72) = meilleure combinaison design + copy.',
                color: '#22c55e',
              },
              {
                icon: 'campaign',
                title: 'Campagnes acquisition',
                desc: 'ROI/Economies (68) pour Facebook Ads. Urgence/FOMO (62) pour campagnes courtes avec vrais compteurs.',
                color: '#3b82f6',
              },
              {
                icon: 'target',
                title: 'Coeur de cible PME',
                desc: 'Simplicite (70) est la variante la plus strategique. Le message "WhatsApp = interface" est le plus differenciateur.',
                color: '#9333ea',
              },
            ].map(r => (
              <div key={r.title} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 14, padding: 20,
              }}>
                <span className="material-symbols-rounded" style={{ fontSize: 24, color: r.color, marginBottom: 8, display: 'block' }}>
                  {r.icon}
                </span>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{r.title}</div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Compare drawer */}
      <CompareDrawer selected={compareVariants} onClear={() => setCompareIds([])} />

      <PublicFooter />
    </>
  );
}
