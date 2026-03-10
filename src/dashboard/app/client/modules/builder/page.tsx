'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '../../../../components/Toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type ModuleType = 'form' | 'crm' | 'agent' | 'dashboard' | 'custom';
type FieldType = 'text' | 'email' | 'phone' | 'select' | 'checkbox' | 'date' | 'textarea' | 'number';

interface SchemaField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // for 'select'
}

interface ModuleSchema {
  fields?: SchemaField[];
  system_prompt?: string;
  welcome_message?: string;
  model?: string;
  language?: string;
  confirmation_message?: string;
  agent_id?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MODULE_TYPES: { type: ModuleType; icon: string; title: string; desc: string; color: string; featured?: boolean }[] = [
  { type: 'custom', icon: 'extension', title: 'AUTRE — Création sur mesure', color: '#8b5cf6', desc: 'Décrivez votre besoin en langage naturel et l\'IA crée votre module. Agent intégré, formulaires, PDF, automatisations — tout est possible.', featured: true },
  { type: 'form', icon: 'assignment', title: 'Formulaire intelligent', color: '#10b981', desc: 'Collecte de données structurées. Peut alimenter un agent ou une base.' },
  { type: 'crm', icon: 'bar_chart', title: 'Base de données CRM', color: '#3b82f6', desc: 'Table personnalisée avec colonnes configurables, recherche et CRUD intégré.' },
  { type: 'agent', icon: 'smart_toy', title: 'Agent IA dédié', color: '#8b5cf6', desc: 'Mini-chatbot IA avec son propre prompt. Intégrable sur votre site web.' },
  { type: 'dashboard', icon: 'trending_up', title: 'Tableau de bord', color: '#f59e0b', desc: 'Visualisation des enregistrements de votre module sous forme de compteurs et graphiques.' },
];

// ─── Template examples for inspiration ──────────────────────────────────────
interface TemplateExample {
  icon: string;
  title: string;
  desc: string;
  category: string;
  baseType: ModuleType;
  prefill: { name: string; description: string; systemPrompt?: string; welcomeMessage?: string; fields?: SchemaField[] };
}

const TEMPLATE_EXAMPLES: TemplateExample[] = [
  // --- Batiment & BTP ---
  { icon: 'architecture', title: 'Devis Batiment sur mesure', desc: 'Génération de devis BTP avec logo client, lignes de prestation, TVA, conditions. Export PDF automatique.', category: 'Batiment & BTP', baseType: 'custom',
    prefill: { name: 'Devis Batiment', description: 'Création de devis sur mesure pour le BTP avec calculs automatiques et export PDF', systemPrompt: 'Tu es un assistant spécialisé dans la création de devis pour le bâtiment et BTP. Tu aides à structurer les devis avec : informations client, lignes de prestations (désignation, quantité, prix unitaire, TVA), conditions de paiement, et garanties. Tu calcules automatiquement les totaux HT/TTC. Tu formats le résultat pour export PDF.', welcomeMessage: 'Bonjour ! Je vais vous aider à créer votre devis BTP. Commencez par me donner les informations du client et le type de travaux.' }},
  { icon: 'straighten', title: 'Suivi de chantier', desc: 'Journal de chantier quotidien, avancement, incidents, photos. Rapports automatiques pour le maitre d\'ouvrage.', category: 'Batiment & BTP', baseType: 'custom',
    prefill: { name: 'Suivi de Chantier', description: 'Journal de chantier avec suivi d\'avancement et rapports automatiques', systemPrompt: 'Tu es un assistant de suivi de chantier. Tu aides à documenter l\'avancement quotidien, les incidents, la météo, les effectifs présents, les matériaux utilisés et les décisions prises. Tu génères des rapports de synthèse hebdomadaires et mensuels.', welcomeMessage: 'Bonjour ! Quel chantier souhaitez-vous documenter aujourd\'hui ?' }},

  // --- Commerce & Vente ---
  { icon: 'receipt', title: 'Factures & Devis Auto', desc: 'Création de factures et devis professionnels avec calcul automatique TVA, export PDF, suivi des paiements.', category: 'Commerce & Vente', baseType: 'custom',
    prefill: { name: 'Facturation Intelligente', description: 'Génération automatique de factures avec calculs, export PDF et suivi', systemPrompt: 'Tu es un assistant de facturation. Tu crées des factures et devis professionnels avec : numérotation automatique, informations entreprise/client, lignes de produits/services, calcul TVA, remises, conditions de paiement. Tu respectes les mentions légales obligatoires. Format exportable PDF.', welcomeMessage: 'Bonjour ! Souhaitez-vous créer une facture ou un devis ?' }},
  { icon: 'storefront', title: 'Gestion des commandes', desc: 'Suivi des commandes clients de la réception à la livraison. Notifications automatiques et tableau de bord.', category: 'Commerce & Vente', baseType: 'crm',
    prefill: { name: 'Gestion Commandes', description: 'Suivi complet des commandes avec statuts et notifications', fields: [
      { id: 'f1', type: 'text', label: 'N° Commande', required: true },
      { id: 'f2', type: 'text', label: 'Client', required: true },
      { id: 'f3', type: 'select', label: 'Statut', required: true, options: ['Reçue', 'En préparation', 'Expédiée', 'Livrée', 'Annulée'] },
      { id: 'f4', type: 'number', label: 'Montant (€)', required: true },
      { id: 'f5', type: 'date', label: 'Date livraison prévue', required: false },
    ] }},
  { icon: 'savings', title: 'Négociation commerciale', desc: 'Agent IA qui prépare vos argumentaires, simule des négociations et propose des stratégies de closing.', category: 'Commerce & Vente', baseType: 'agent',
    prefill: { name: 'Coach Négociation', description: 'Assistant de préparation et simulation de négociations commerciales', systemPrompt: 'Tu es un expert en négociation commerciale B2B. Tu aides à préparer les argumentaires, anticiper les objections, calculer les marges de négociation, et proposer des stratégies de closing. Tu peux simuler des conversations de négociation pour t\'entraîner.', welcomeMessage: 'Bonjour ! Décrivez-moi la négociation que vous préparez et je vous aiderai à construire votre stratégie.' }},

  // --- Immobilier ---
  { icon: 'home', title: 'Estimation immobilière', desc: 'Agent IA qui estime la valeur d\'un bien à partir de ses caractéristiques, localisation et marché local.', category: 'Immobilier', baseType: 'agent',
    prefill: { name: 'Estimation Immobilière', description: 'Estimation de valeur de biens immobiliers avec analyse de marché', systemPrompt: 'Tu es un expert en estimation immobilière. À partir des caractéristiques d\'un bien (surface, localisation, nombre de pièces, état, étage, parking, etc.), tu fournis une estimation de valeur argumentée en te basant sur les prix du marché. Tu donnes une fourchette basse/haute et expliques les facteurs qui influencent le prix.', welcomeMessage: 'Bonjour ! Décrivez-moi le bien que vous souhaitez estimer (surface, localisation, type, état...).' }},
  { icon: 'description', title: 'Bail & Contrats location', desc: 'Génération de baux, états des lieux, quittances de loyer. Conforme à la loi, export PDF.', category: 'Immobilier', baseType: 'custom',
    prefill: { name: 'Gestion Locative', description: 'Création de baux, états des lieux et quittances conformes', systemPrompt: 'Tu es un assistant juridique spécialisé en droit immobilier locatif français. Tu génères des baux d\'habitation (loi ALUR), des états des lieux d\'entrée et sortie, des quittances de loyer, et des lettres de régularisation de charges. Tous les documents sont conformes à la législation en vigueur et exportables en PDF.', welcomeMessage: 'Bonjour ! Quel document locatif souhaitez-vous générer ?' }},

  // --- Restauration & Food ---
  { icon: 'restaurant', title: 'Gestion de restaurant', desc: 'Menus, fiches techniques, calcul des coûts matière, gestion des stocks et commandes fournisseurs.', category: 'Restauration', baseType: 'custom',
    prefill: { name: 'Gestion Restaurant', description: 'Fiches techniques, coûts matière, menus et gestion fournisseurs', systemPrompt: 'Tu es un assistant de gestion pour la restauration. Tu aides à créer des fiches techniques (ingrédients, grammages, coûts), calculer les coûts matière et marges, concevoir des menus équilibrés, gérer les stocks et planifier les commandes fournisseurs. Tu proposes des optimisations pour améliorer la rentabilité.', welcomeMessage: 'Bonjour ! Comment puis-je vous aider avec la gestion de votre restaurant ?' }},

  // --- Santé & Médical ---
  { icon: 'local_hospital', title: 'Gestion cabinet médical', desc: 'Fiches patient, historique, ordonnances types, rappels de rendez-vous et suivi des consultations.', category: 'Santé', baseType: 'crm',
    prefill: { name: 'Cabinet Médical', description: 'Gestion de patients, consultations et ordonnances', fields: [
      { id: 'f1', type: 'text', label: 'Nom du patient', required: true },
      { id: 'f2', type: 'date', label: 'Date de naissance', required: true },
      { id: 'f3', type: 'phone', label: 'Téléphone', required: true },
      { id: 'f4', type: 'select', label: 'Motif consultation', required: true, options: ['Première consultation', 'Suivi', 'Urgence', 'Renouvellement', 'Autre'] },
      { id: 'f5', type: 'textarea', label: 'Notes / Observations', required: false },
    ] }},

  // --- Education & Formation ---
  { icon: 'school', title: 'Suivi des élèves', desc: 'Notes, bulletins, suivi de progression, commentaires par matière. Export PDF des bulletins.', category: 'Education', baseType: 'custom',
    prefill: { name: 'Suivi Élèves', description: 'Gestion des notes, bulletins et progression des élèves', systemPrompt: 'Tu es un assistant pédagogique. Tu aides à saisir et organiser les notes des élèves, calculer les moyennes par matière et générales, rédiger des appréciations personnalisées, et générer des bulletins scolaires exportables en PDF. Tu peux aussi identifier les élèves en difficulté et proposer des plans d\'accompagnement.', welcomeMessage: 'Bonjour ! Souhaitez-vous saisir des notes, générer un bulletin ou analyser les résultats d\'une classe ?' }},

  // --- Juridique ---
  { icon: 'balance', title: 'Contrats sur mesure', desc: 'Génération de contrats types (CGV, NDA, prestation, travail) personnalisés. Analyse et export PDF.', category: 'Juridique', baseType: 'custom',
    prefill: { name: 'Générateur de Contrats', description: 'Création de contrats juridiques personnalisés avec export PDF', systemPrompt: 'Tu es un assistant juridique spécialisé dans la rédaction de contrats. Tu génères des contrats professionnels : CGV, CGU, NDA, contrats de prestation, contrats de travail, mandats, etc. Tu personnalises chaque contrat avec les informations des parties, les clauses spécifiques et les mentions obligatoires selon le droit français. Format structuré pour export PDF.', welcomeMessage: 'Bonjour ! Quel type de contrat souhaitez-vous créer ?' }},

  // --- Comptabilité ---
  { icon: 'calculate', title: 'Notes de frais auto', desc: 'Saisie rapide des dépenses, catégorisation, calcul des remboursements et export comptable.', category: 'Comptabilité', baseType: 'form',
    prefill: { name: 'Notes de Frais', description: 'Saisie et gestion des notes de frais avec export', fields: [
      { id: 'f1', type: 'date', label: 'Date de la dépense', required: true },
      { id: 'f2', type: 'select', label: 'Catégorie', required: true, options: ['Transport', 'Repas', 'Hébergement', 'Fournitures', 'Télécom', 'Autre'] },
      { id: 'f3', type: 'text', label: 'Description', required: true },
      { id: 'f4', type: 'number', label: 'Montant TTC (€)', required: true },
      { id: 'f5', type: 'select', label: 'Moyen de paiement', required: true, options: ['CB entreprise', 'CB personnelle', 'Espèces', 'Virement'] },
    ] }},

  // --- Événementiel ---
  { icon: 'celebration', title: 'Planificateur d\'événements', desc: 'Organisation complète : invités, planning, budget, prestataires, checklist et suivi en temps réel.', category: 'Événementiel', baseType: 'custom',
    prefill: { name: 'Planificateur Événements', description: 'Organisation complète d\'événements avec suivi et budget', systemPrompt: 'Tu es un organisateur d\'événements professionnel. Tu aides à planifier tous les aspects : budget détaillé, liste des invités, planning horaire, sélection de prestataires, checklist des tâches, gestion des imprévus. Tu proposes des modèles selon le type d\'événement (séminaire, team building, salon, gala, conférence).', welcomeMessage: 'Bonjour ! Quel type d\'événement souhaitez-vous organiser ?' }},

  // --- Transport & Logistique ---
  { icon: 'local_shipping', title: 'Gestion de flotte', desc: 'Suivi des véhicules, entretiens, kilométrage, consommation et planification des tournées.', category: 'Transport', baseType: 'crm',
    prefill: { name: 'Gestion de Flotte', description: 'Suivi des véhicules, entretiens et consommations', fields: [
      { id: 'f1', type: 'text', label: 'Immatriculation', required: true },
      { id: 'f2', type: 'text', label: 'Modèle', required: true },
      { id: 'f3', type: 'number', label: 'Kilométrage', required: true },
      { id: 'f4', type: 'date', label: 'Prochain entretien', required: false },
      { id: 'f5', type: 'select', label: 'Statut', required: true, options: ['En service', 'En maintenance', 'Hors service', 'Réservé'] },
    ] }},

  // --- RH & Recrutement ---
  { icon: 'badge', title: 'Pipeline recrutement', desc: 'Suivi des candidatures, scoring, entretiens, et onboarding. Notifications automatiques à chaque étape.', category: 'RH', baseType: 'crm',
    prefill: { name: 'Pipeline Recrutement', description: 'Suivi des candidatures de la réception à l\'embauche', fields: [
      { id: 'f1', type: 'text', label: 'Nom du candidat', required: true },
      { id: 'f2', type: 'email', label: 'Email', required: true },
      { id: 'f3', type: 'text', label: 'Poste visé', required: true },
      { id: 'f4', type: 'select', label: 'Étape', required: true, options: ['Candidature reçue', 'Pré-sélection', 'Entretien RH', 'Entretien technique', 'Offre envoyée', 'Embauché', 'Refusé'] },
      { id: 'f5', type: 'number', label: 'Score (1-10)', required: false },
    ] }},

  // --- Marketing ---
  { icon: 'mail', title: 'Campagne emailing', desc: 'Création de séquences email, A/B testing de sujets, personnalisation et analyse des résultats.', category: 'Marketing', baseType: 'agent',
    prefill: { name: 'Assistant Emailing', description: 'Création et optimisation de campagnes email', systemPrompt: 'Tu es un expert en email marketing. Tu aides à rédiger des séquences d\'emails (bienvenue, nurturing, relance, promotion), optimiser les objets avec des techniques de copywriting, segmenter les audiences, et analyser les performances (taux d\'ouverture, clic, conversion). Tu proposes des A/B tests et des améliorations.', welcomeMessage: 'Bonjour ! Quel type de campagne email souhaitez-vous créer ?' }},

  // --- Artisanat ---
  { icon: 'build', title: 'Gestion d\'interventions', desc: 'Planification, fiches d\'intervention, suivi des heures, pièces détachées et facturation terrain.', category: 'Artisanat & Services', baseType: 'custom',
    prefill: { name: 'Fiches Intervention', description: 'Gestion des interventions terrain avec suivi et facturation', systemPrompt: 'Tu es un assistant de gestion pour artisans et techniciens. Tu aides à créer des fiches d\'intervention (client, adresse, description du problème, diagnostic, travaux réalisés, pièces utilisées, durée), calculer les coûts (main d\'œuvre + pièces), et générer des rapports d\'intervention exportables en PDF. Tu gères aussi la planification des rendez-vous.', welcomeMessage: 'Bonjour ! Souhaitez-vous créer une fiche d\'intervention ou planifier un rendez-vous ?' }},
];

const FIELD_TYPES: { type: FieldType; label: string }[] = [
  { type: 'text', label: 'Texte court' },
  { type: 'textarea', label: 'Texte long' },
  { type: 'email', label: 'Email' },
  { type: 'phone', label: 'Téléphone' },
  { type: 'number', label: 'Nombre' },
  { type: 'select', label: 'Liste déroulante' },
  { type: 'checkbox', label: 'Case à cocher' },
  { type: 'date', label: 'Date' },
];

const EMOJIS = ['assignment', 'bar_chart', 'smart_toy', 'trending_up', 'target', 'work', 'trophy', 'bolt', 'star', 'local_fire_department', 'lightbulb', 'storefront', 'call', 'mail', 'edit_note', 'palette', 'home', 'group', 'build', 'inventory_2', 'language', 'savings', 'calendar_month', 'notifications'];
const COLORS = ['#7c3aed', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#14b8a6', '#8b7cf8'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSession() {
  try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}'); } catch { return {}; }
}

function generateSlug(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 60);
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldEditor({ field, onChange, onDelete }: {
  field: SchemaField;
  onChange: (f: SchemaField) => void;
  onDelete: () => void;
}) {
  const [optionInput, setOptionInput] = useState('');

  return (
    <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 14, border: '1px solid var(--border)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px auto', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <input
          value={field.label}
          onChange={e => onChange({ ...field, label: e.target.value })}
          placeholder="Libellé du champ"
          style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', fontSize: 13 }}
        />
        <select
          value={field.type}
          onChange={e => onChange({ ...field, type: e.target.value as FieldType })}
          style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', fontSize: 13 }}
        >
          {FIELD_TYPES.map(ft => (
            <option key={ft.type} value={ft.type}>{ft.label}</option>
          ))}
        </select>
        <button onClick={onDelete} style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', fontSize: 13 }}>✕</button>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          value={field.placeholder ?? ''}
          onChange={e => onChange({ ...field, placeholder: e.target.value })}
          placeholder="Placeholder (optionnel)"
          style={{ flex: 1, padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', fontSize: 12 }}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          <input type="checkbox" checked={field.required} onChange={e => onChange({ ...field, required: e.target.checked })} />
          Requis
        </label>
      </div>
      {field.type === 'select' && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Options :</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
            {(field.options ?? []).map((opt, i) => (
              <span key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, padding: '2px 8px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                {opt}
                <button onClick={() => onChange({ ...field, options: field.options?.filter((_, j) => j !== i) })} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', padding: 0, lineHeight: 1 }}>×</button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              value={optionInput}
              onChange={e => setOptionInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && optionInput.trim()) { onChange({ ...field, options: [...(field.options ?? []), optionInput.trim()] }); setOptionInput(''); } }}
              placeholder="Ajouter une option…"
              style={{ flex: 1, padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', fontSize: 12 }}
            />
            <button
              onClick={() => { if (optionInput.trim()) { onChange({ ...field, options: [...(field.options ?? []), optionInput.trim()] }); setOptionInput(''); } }}
              style={{ padding: '5px 12px', borderRadius: 8, background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 12 }}
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function BuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const { showError, showSuccess } = useToast();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1 — Type
  const [moduleType, setModuleType] = useState<ModuleType | null>(null);

  // Step 2 — Identity
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('assignment');
  const [color, setColor] = useState('#7c3aed');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);

  // Custom type
  const [customBrief, setCustomBrief] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateExample | null>(null);

  // Step 3 — Structure
  const [fields, setFields] = useState<SchemaField[]>([
    { id: uid(), type: 'text', label: 'Nom', placeholder: 'Votre nom', required: true },
    { id: uid(), type: 'email', label: 'Email', placeholder: 'votre@email.com', required: true },
  ]);
  const [confirmationMessage, setConfirmationMessage] = useState('Merci pour votre envoi !');
  const [systemPrompt, setSystemPrompt] = useState('Tu es un assistant IA spécialisé. Réponds de manière professionnelle et utile.');
  const [welcomeMessage, setWelcomeMessage] = useState('Bonjour ! Comment puis-je vous aider ?');
  const [aiModel, setAiModel] = useState('claude-haiku-4-5-20251001');
  const [aiLanguage, setAiLanguage] = useState('fr');

  // Step 4 — Publish
  const [isPublished, setIsPublished] = useState(true);
  const [publicAccess, setPublicAccess] = useState(false);

  useEffect(() => {
    if (!slugEdited && name) {
      setSlug(generateSlug(name));
    }
  }, [name, slugEdited]);

  // Load for edit
  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const session = getSession();
        const res = await fetch('/api/portal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: `/portal/modules/${editId}`, token: session.token }),
        });
        const data = await res.json();
        const m = data.module;
        if (!m) return;
        setModuleType(m.type);
        setName(m.name ?? '');
        setDescription(m.description ?? '');
        setEmoji(m.emoji ?? 'assignment');
        setColor(m.color ?? '#7c3aed');
        setSlug(m.slug ?? '');
        setSlugEdited(true);
        setIsPublished(m.is_published ?? true);
        setPublicAccess(m.public_access ?? false);
        const schema: ModuleSchema = typeof m.schema === 'string' ? JSON.parse(m.schema) : (m.schema ?? {});
        if (schema.fields) setFields(schema.fields);
        if (schema.confirmation_message) setConfirmationMessage(schema.confirmation_message);
        if (schema.system_prompt) setSystemPrompt(schema.system_prompt);
        if (schema.welcome_message) setWelcomeMessage(schema.welcome_message);
        if (schema.model) setAiModel(schema.model);
        if (schema.language) setAiLanguage(schema.language);
        setStep(2); // jump to step 2 when editing
      } catch { /* */ }
    })();
  }, [editId]);

  const canNext = () => {
    if (step === 1) return moduleType !== null;
    if (step === 2) return name.trim().length >= 2 && slug.trim().length >= 2;
    return true;
  };

  function buildSchema(): ModuleSchema {
    if (moduleType === 'form' || moduleType === 'crm') {
      return { fields, confirmation_message: confirmationMessage };
    }
    if (moduleType === 'agent') {
      return { system_prompt: systemPrompt, welcome_message: welcomeMessage, model: aiModel, language: aiLanguage };
    }
    if (moduleType === 'custom') {
      return {
        system_prompt: systemPrompt,
        welcome_message: welcomeMessage,
        model: aiModel,
        language: aiLanguage,
        fields: fields.length > 0 ? fields : undefined,
        confirmation_message: confirmationMessage,
      };
    }
    return {}; // dashboard — auto-generated
  }

  async function save() {
    setSaving(true);
    try {
      const session = getSession();
      const body = {
        name: name.trim(),
        description: description.trim() || undefined,
        emoji,
        color,
        slug: slug.trim(),
        type: moduleType!,
        schema: buildSchema(),
        is_published: isPublished,
        public_access: publicAccess,
      };
      const path = editId ? `/portal/modules/${editId}` : '/portal/modules';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, token: session.token, method, data: body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur');
      showSuccess(editId ? 'Module mis à jour !' : 'Module créé !');
      const savedSlug = data.module?.slug ?? slug;
      router.push(`/client/modules/${savedSlug}`);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  }

  const STEP_LABELS = ['Type', 'Identité', 'Structure', 'Publier'];

  return (
    <div className="client-page-scrollable" style={{ maxWidth: 860, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
          {editId ? <>✏️ Modifier le module</> : <>🔧 Créer un module</>}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Créez une mini-application fonctionnelle intégrée à votre dashboard.
        </p>
      </div>

      {/* ── Stepper ── */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 32, position: 'relative' }}>
        {STEP_LABELS.map((label, i) => {
          const s = i + 1;
          const done = step > s;
          const active = step === s;
          return (
            <button
              key={s}
              onClick={() => { if (s < step) setStep(s); }}
              disabled={s >= step}
              style={{
                flex: 1, padding: '10px 0', border: 'none', cursor: s < step ? 'pointer' : 'default',
                background: active ? 'var(--accent)' : done ? '#10b981' : 'var(--bg-secondary)',
                color: (active || done) ? 'white' : 'var(--text-secondary)',
                fontWeight: active ? 700 : 500, fontSize: 13,
                borderRadius: s === 1 ? '12px 0 0 12px' : s === 4 ? '0 12px 12px 0' : 0,
                transition: 'all 0.2s',
              }}
            >
              {done ? <>✅{' '}</> : `${s}. `}{label}
            </button>
          );
        })}
      </div>

      {/* ── Step 1 — Type ── */}
      {step === 1 && (
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Quel type de module souhaitez-vous créer ?</h2>

          {/* Featured: AUTRE */}
          {(() => { const autre = MODULE_TYPES.find(t => t.featured); return autre ? (
            <button
              onClick={() => { setModuleType(autre.type); setEmoji(autre.icon); setSelectedTemplate(null); }}
              style={{
                width: '100%', padding: 24, borderRadius: 16, marginBottom: 20,
                border: `2px solid ${moduleType === autre.type && !selectedTemplate ? autre.color : 'var(--border)'}`,
                background: moduleType === autre.type && !selectedTemplate
                  ? `linear-gradient(135deg, ${autre.color}15, ${autre.color}08)`
                  : 'linear-gradient(135deg, var(--bg-card), var(--bg-secondary))',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', top: 10, right: 14, padding: '3px 10px', borderRadius: 8, background: autre.color, color: '#fff', fontSize: 11, fontWeight: 700 }}>Recommande</div>
              <div style={{ fontSize: 36, marginBottom: 10 }}><span style={{ fontSize: 32 }}>{autre.icon === 'extension' ? '📦' : autre.icon}</span></div>
              <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 6 }}>{autre.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{autre.desc}</div>
            </button>
          ) : null; })()}

          {/* Standard types */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 32 }}>
            {MODULE_TYPES.filter(t => !t.featured).map(mt => (
              <button
                key={mt.type}
                onClick={() => { setModuleType(mt.type); setEmoji(mt.icon); setSelectedTemplate(null); }}
                style={{
                  padding: 20, borderRadius: 14, border: `2px solid ${moduleType === mt.type && !selectedTemplate ? mt.color : 'var(--border)'}`,
                  background: moduleType === mt.type && !selectedTemplate ? `${mt.color}10` : 'var(--bg-card)',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}><span style={{ fontSize: 24 }}>{mt.icon === 'extension' ? '📦' : mt.icon === 'assignment' ? '📋' : mt.icon === 'bar_chart' ? '📊' : mt.icon === 'smart_toy' ? '🤖' : mt.icon === 'trending_up' ? '📈' : mt.icon}</span></div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{mt.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{mt.desc}</div>
              </button>
            ))}
          </div>

          {/* Templates / Exemples */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Ou partez d&apos;un modele pret a l&apos;emploi</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Choisissez un modele et personnalisez-le selon vos besoins. Agent IA integre, export PDF, automatisations — tout est configurable.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {TEMPLATE_EXAMPLES.map(tpl => (
                <button
                  key={tpl.title}
                  onClick={() => {
                    setSelectedTemplate(tpl);
                    setModuleType(tpl.baseType);
                    setEmoji(tpl.icon);
                    setName(tpl.prefill.name);
                    setDescription(tpl.prefill.description);
                    if (tpl.prefill.systemPrompt) setSystemPrompt(tpl.prefill.systemPrompt);
                    if (tpl.prefill.welcomeMessage) setWelcomeMessage(tpl.prefill.welcomeMessage);
                    if (tpl.prefill.fields) setFields(tpl.prefill.fields);
                  }}
                  style={{
                    padding: 16, borderRadius: 12, textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
                    border: `1.5px solid ${selectedTemplate?.title === tpl.title ? '#8b5cf6' : 'var(--border)'}`,
                    background: selectedTemplate?.title === tpl.title ? '#8b5cf615' : 'var(--bg-card)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 20 }}>{tpl.icon === 'architecture' ? '🏗️' : tpl.icon === 'straighten' ? '📏' : tpl.icon === 'receipt' ? '🧾' : tpl.icon === 'storefront' ? '🏪' : tpl.icon === 'savings' ? '💰' : tpl.icon === 'home' ? '🏠' : tpl.icon === 'description' ? '📝' : tpl.icon === 'restaurant' ? '🍽️' : tpl.icon === 'local_hospital' ? '🏥' : tpl.icon === 'school' ? '🎓' : tpl.icon === 'balance' ? '⚖️' : tpl.icon === 'calculate' ? '🧮' : tpl.icon === 'celebration' ? '🎉' : tpl.icon === 'local_shipping' ? '🚚' : tpl.icon === 'badge' ? '🪪' : tpl.icon === 'mail' ? '📧' : tpl.icon === 'build' ? '🔧' : tpl.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{tpl.title}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 6 }}>{tpl.desc}</div>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontWeight: 600 }}>{tpl.category}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2 — Identity ── */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>Donnez une identité à votre module</h2>

          {/* Emoji + Color row */}
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Icône</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setEmoji(e)} style={{
                    width: 36, height: 36, borderRadius: 8, border: `2px solid ${emoji === e ? 'var(--accent)' : 'transparent'}`,
                    background: emoji === e ? 'var(--accent)20' : 'var(--bg-secondary)',
                    cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><span style={{ fontSize: 16 }}>{e === 'assignment' ? '📋' : e === 'bar_chart' ? '📊' : e === 'smart_toy' ? '🤖' : e === 'trending_up' ? '📈' : e === 'target' ? '🎯' : e === 'work' ? '💼' : e === 'trophy' ? '🏆' : e === 'bolt' ? '⚡' : e === 'star' ? '⭐' : e === 'local_fire_department' ? '🔥' : e === 'lightbulb' ? '💡' : e === 'storefront' ? '🏪' : e === 'call' ? '📞' : e === 'mail' ? '📧' : e === 'edit_note' ? '✏️' : e === 'palette' ? '🎨' : e === 'home' ? '🏠' : e === 'group' ? '👥' : e === 'build' ? '🔧' : e === 'inventory_2' ? '📦' : e === 'language' ? '🌐' : e === 'savings' ? '💰' : e === 'calendar_month' ? '📅' : e === 'notifications' ? '🔔' : e}</span></button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Couleur</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxWidth: 180 }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setColor(c)} style={{
                    width: 28, height: 28, borderRadius: '50%', border: `3px solid ${color === c ? 'white' : 'transparent'}`,
                    background: c, cursor: 'pointer', outline: color === c ? `2px solid ${c}` : 'none',
                  }} />
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: `${color}15`, borderRadius: 12, border: `2px solid ${color}40`, alignSelf: 'flex-start' }}>
            <span style={{ fontSize: 22 }}>{emoji}</span>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{name || 'Nom du module'}</span>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Nom *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex : Demande de devis, Base contacts, Agent support…"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 14 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Description (optionnelle)</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Courte description du rôle de ce module"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 14 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Slug URL *</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>/client/modules/</span>
              <input
                value={slug}
                onChange={e => { setSlug(e.target.value); setSlugEdited(true); }}
                placeholder="mon-module"
                style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 13 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3 — Structure ── */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>
            {moduleType === 'agent' ? 'Configurez votre agent IA' :
             moduleType === 'dashboard' ? 'Votre dashboard sera généré automatiquement' :
             'Définissez les champs de votre module'}
          </h2>

          {/* Form / CRM */}
          {(moduleType === 'form' || moduleType === 'crm') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {fields.map((field, i) => (
                <FieldEditor
                  key={field.id}
                  field={field}
                  onChange={updated => setFields(prev => prev.map((f, j) => j === i ? updated : f))}
                  onDelete={() => setFields(prev => prev.filter((_, j) => j !== i))}
                />
              ))}
              <button
                onClick={() => setFields(prev => [...prev, { id: uid(), type: 'text', label: '', required: false }])}
                style={{ padding: '10px', borderRadius: 10, border: '2px dashed var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 14 }}
              >
                + Ajouter un champ
              </button>
              {moduleType === 'form' && (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Message de confirmation</label>
                  <input
                    value={confirmationMessage}
                    onChange={e => setConfirmationMessage(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 14 }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Agent */}
          {moduleType === 'agent' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Prompt système</label>
                <textarea
                  value={systemPrompt}
                  onChange={e => setSystemPrompt(e.target.value)}
                  rows={5}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 13, resize: 'vertical' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Message d&apos;accueil</label>
                <input
                  value={welcomeMessage}
                  onChange={e => setWelcomeMessage(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 14 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Modèle</label>
                  <select value={aiModel} onChange={e => setAiModel(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 13 }}>
                    <option value="claude-haiku-4-5-20251001">Haiku 4.5 (rapide)</option>
                    <option value="claude-sonnet-4-6">Sonnet 4.6 (puissant)</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Langue</label>
                  <select value={aiLanguage} onChange={e => setAiLanguage(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 13 }}>
                    <option value="fr">Français</option>
                    <option value="en">Anglais</option>
                    <option value="es">Espagnol</option>
                    <option value="de">Allemand</option>
                    <option value="ar">Arabe</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard */}
          {moduleType === 'dashboard' && (
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📈</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                Votre tableau de bord sera généré automatiquement à partir des données de vos autres modules.
                Il affichera des compteurs, des graphiques et des statistiques en temps réel.
              </p>
            </div>
          )}

          {/* Custom — full agent + form + brief */}
          {moduleType === 'custom' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'linear-gradient(135deg, #8b5cf610, #7c3aed10)', border: '1px solid #8b5cf640', borderRadius: 14, padding: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: '#8b5cf6' }}>Module sur mesure avec IA</div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  Votre module combine un agent IA dedie + des formulaires configurables. L&apos;agent comprend votre metier,
                  genere des documents (PDF, devis, contrats), et automatise vos processus. Decrivez votre besoin ci-dessous.
                </p>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Decrivez votre besoin en detail</label>
                <textarea
                  value={customBrief}
                  onChange={e => setCustomBrief(e.target.value)}
                  rows={4}
                  placeholder="Ex : Je suis artisan plombier. Je veux un module qui me permette de créer des devis avec mon logo, calculer automatiquement les prix selon un barème, envoyer le devis par email au client, et exporter en PDF..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 13, resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Instructions pour l&apos;agent IA</label>
                <textarea
                  value={systemPrompt}
                  onChange={e => setSystemPrompt(e.target.value)}
                  rows={5}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 13, resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Message d&apos;accueil</label>
                <input
                  value={welcomeMessage}
                  onChange={e => setWelcomeMessage(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 14 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Modele IA</label>
                  <select value={aiModel} onChange={e => setAiModel(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 13 }}>
                    <option value="claude-haiku-4-5-20251001">Haiku 4.5 (rapide)</option>
                    <option value="claude-sonnet-4-6">Sonnet 4.6 (puissant)</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Langue</label>
                  <select value={aiLanguage} onChange={e => setAiLanguage(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 13 }}>
                    <option value="fr">Francais</option>
                    <option value="en">Anglais</option>
                    <option value="es">Espagnol</option>
                    <option value="de">Allemand</option>
                    <option value="ar">Arabe</option>
                  </select>
                </div>
              </div>

              {/* Optional fields for data collection */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Champs de saisie (optionnel)</h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  Ajoutez des champs si votre module doit collecter des informations structurees (fiche client, formulaire, etc.)
                </p>
                {fields.map((field, i) => (
                  <div key={field.id} style={{ marginBottom: 8 }}>
                    <FieldEditor
                      field={field}
                      onChange={updated => setFields(prev => prev.map((f, j) => j === i ? updated : f))}
                      onDelete={() => setFields(prev => prev.filter((_, j) => j !== i))}
                    />
                  </div>
                ))}
                <button
                  onClick={() => setFields(prev => [...prev, { id: uid(), type: 'text', label: '', required: false }])}
                  style={{ padding: '8px 16px', borderRadius: 10, border: '2px dashed var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13 }}
                >
                  + Ajouter un champ
                </button>
              </div>

              {/* Capabilities */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Fonctionnalites incluses</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['Export PDF', 'Agent IA dedie', 'Formulaires', 'Calculs automatiques', 'Notifications', 'Historique', 'Multi-langue'].map(cap => (
                    <span key={cap} style={{ padding: '5px 12px', borderRadius: 8, background: '#10b98115', color: '#10b981', fontSize: 12, fontWeight: 600 }}>
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Step 4 — Publish ── */}
      {step === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>Publiez votre module</h2>

          {/* Preview card */}
          <div style={{ background: `${color}10`, border: `2px solid ${color}40`, borderRadius: 16, padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 60, height: 60, borderRadius: 14, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
              <span style={{ fontSize: 26 }}>{emoji}</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{name}</div>
              {description && <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{description}</div>}
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                {MODULE_TYPES.find(t => t.type === moduleType)?.icon} {MODULE_TYPES.find(t => t.type === moduleType)?.title}
                {' · '}/client/modules/<strong>{slug}</strong>
              </div>
            </div>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer' }}>
              <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} style={{ width: 18, height: 18 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Publier maintenant</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Le module sera accessible et visible dans votre sidebar.</div>
              </div>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer' }}>
              <input type="checkbox" checked={publicAccess} onChange={e => setPublicAccess(e.target.checked)} style={{ width: 18, height: 18 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>URL publique</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Génère un lien partageable : <code>/m/{slug}</code> — accessible sans connexion.
                </div>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* ── Navigation ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => step > 1 ? setStep(s => s - 1) : router.push('/client/modules')}
          style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 14 }}
        >
          ← {step > 1 ? 'Précédent' : 'Annuler'}
        </button>
        {step < 4 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canNext()}
            style={{ padding: '10px 24px', borderRadius: 10, background: canNext() ? 'var(--accent)' : 'var(--bg-secondary)', color: canNext() ? 'white' : 'var(--text-secondary)', border: 'none', cursor: canNext() ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: 14 }}
          >
            Suivant →
          </button>
        ) : (
          <button
            onClick={save}
            disabled={saving}
            style={{ padding: '10px 28px', borderRadius: 10, background: 'var(--accent)', color: 'white', border: 'none', cursor: saving ? 'wait' : 'pointer', fontWeight: 700, fontSize: 14 }}
          >
            {saving ? 'Publication...' : editId ? <>✅ Mettre à jour</> : <>🚀 Publier le module</>}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ModuleBuilderPage() {
  return (
    <Suspense fallback={<div style={{ padding: 32, textAlign: 'center' }}>Chargement...</div>}>
      <BuilderContent />
    </Suspense>
  );
}
