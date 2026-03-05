'use client';

import { useState, useRef } from 'react';

function getToken(): string {
  try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}').token ?? ''; }
  catch { return ''; }
}

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';

// 25 document templates
const TEMPLATES = [
  { id: 'email-pro', icon: '📧', title: 'Email professionnel', prompt: 'Rédige un email professionnel: {brief}. Ton: {tone}. Objet clair, corps structuré, formule de politesse.' },
  { id: 'proposition', icon: '💼', title: 'Proposition commerciale', prompt: 'Crée une proposition commerciale pour: {brief}. Inclure: contexte, offre, bénéfices, tarifs, conditions.' },
  { id: 'business-plan', icon: '📊', title: 'Business Plan', prompt: 'Rédige un business plan: {brief}. Structure: résumé, marché, produit, stratégie, finances, équipe.' },
  { id: 'post-social', icon: '📱', title: 'Post réseaux sociaux', prompt: 'Crée un post {platform} sur: {brief}. Ton: {tone}. Inclure hashtags, CTA, emojis pertinents.' },
  { id: 'rapport', icon: '📋', title: 'Rapport', prompt: 'Rédige un rapport structuré sur: {brief}. Introduction, analyse, recommandations, conclusion.' },
  { id: 'contrat', icon: '⚖️', title: 'Contrat', prompt: 'Rédige un contrat pour: {brief}. Parties, objet, obligations, conditions, durée, résiliation.' },
  { id: 'brief-creatif', icon: '🎨', title: 'Brief créatif', prompt: 'Crée un brief créatif pour: {brief}. Objectif, cible, ton, messages clés, contraintes, livrables.' },
  { id: 'plan-marketing', icon: '📣', title: 'Plan marketing', prompt: 'Crée un plan marketing digital pour: {brief}. Canaux, calendrier, budget, KPIs, actions prioritaires.' },
  { id: 'swot', icon: '🔍', title: 'Analyse SWOT', prompt: 'Réalise une analyse SWOT pour: {brief}. Forces, Faiblesses, Opportunités, Menaces, avec recommandations.' },
  { id: 'script-vente', icon: '🎯', title: 'Script de vente', prompt: 'Crée un script de vente pour: {brief}. Accroche, découverte, argumentation, objections, closing.' },
  { id: 'cv', icon: '📝', title: 'CV / Résumé', prompt: 'Rédige un CV pour: {brief}. Format professionnel, compétences, expériences, formation.' },
  { id: 'lettre-motivation', icon: '✉️', title: 'Lettre de motivation', prompt: 'Rédige une lettre de motivation pour: {brief}. Accroche, parcours, motivation, projet.' },
  { id: 'newsletter', icon: '📰', title: 'Newsletter', prompt: 'Rédige une newsletter sur: {brief}. Objet accrocheur, intro, sections, CTA, footer.' },
  { id: 'faq', icon: '❓', title: 'FAQ', prompt: 'Crée une FAQ pour: {brief}. 10+ questions/réponses organisées par thème.' },
  { id: 'presentation', icon: '📽️', title: 'Présentation', prompt: 'Crée le contenu pour une présentation: {brief}. Slide par slide avec titre, bullet points, notes orateur.' },
];

interface GeneratedDoc {
  id: string;
  templateId: string;
  templateTitle: string;
  templateIcon: string;
  brief: string;
  content: string;
  createdAt: string;
}

export default function MyDocumentsPage() {
  const [tab, setTab] = useState<'generate' | 'library'>('generate');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [brief, setBrief] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [docs, setDocs] = useState<GeneratedDoc[]>(() => {
    try { return JSON.parse(localStorage.getItem('fz_admin_generated_docs') ?? '[]'); }
    catch { return []; }
  });
  const [viewDoc, setViewDoc] = useState<GeneratedDoc | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const saveDocs = (updated: GeneratedDoc[]) => {
    setDocs(updated);
    localStorage.setItem('fz_admin_generated_docs', JSON.stringify(updated));
  };

  const template = TEMPLATES.find(t => t.id === selectedTemplate);

  const generate = async () => {
    if (!template || !brief.trim()) return;
    setGenerating(true);
    setResult('');
    try {
      const prompt = template.prompt.replace(/\{brief\}/g, brief).replace(/\{tone\}/g, 'professionnel').replace(/\{platform\}/g, 'LinkedIn');
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: getToken(),
          model: 'claude-sonnet-4-20250514',
          messages: [{ role: 'user', content: prompt }],
          maxTokens: 4096,
          agentName: 'fz-assistante',
        }),
      });
      const data = await res.json() as { content?: string; response?: string };
      const content = data.content ?? data.response ?? 'Erreur de génération';
      setResult(content);
    } catch (err) {
      setResult(`Erreur: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setGenerating(false);
    }
  };

  const saveResult = () => {
    if (!result || !template) return;
    const doc: GeneratedDoc = {
      id: crypto.randomUUID(),
      templateId: template.id,
      templateTitle: template.title,
      templateIcon: template.icon,
      brief,
      content: result,
      createdAt: new Date().toISOString(),
    };
    saveDocs([doc, ...docs]);
    setResult('');
    setBrief('');
    setSelectedTemplate(null);
  };

  return (
    <div className="space-y-6 admin-page-scrollable">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mes Documents</h1>
          <p className="text-gray-400 mt-1">{TEMPLATES.length} templates — génération IA instantanée</p>
        </div>
        <div className="flex gap-2">
          {(['generate', 'library'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm ${tab === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
              {t === 'generate' ? 'Générer' : `Bibliothèque (${docs.length})`}
            </button>
          ))}
        </div>
      </div>

      {tab === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Template selection */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-gray-400 uppercase">Choisir un template</h2>
            <div className="grid grid-cols-2 gap-2 max-h-[70vh] overflow-y-auto pr-2">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setSelectedTemplate(t.id); setResult(''); }}
                  className={`p-3 rounded-lg border text-left transition-all ${selectedTemplate === t.id ? 'bg-blue-600/10 border-blue-500' : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`}
                >
                  <span className="text-lg">{t.icon}</span>
                  <p className="text-white text-sm font-medium mt-1">{t.title}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Generation form + result */}
          <div className="space-y-4">
            {template ? (
              <>
                <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{template.icon}</span>
                    <h3 className="text-white font-medium">{template.title}</h3>
                  </div>
                  <textarea
                    value={brief}
                    onChange={e => setBrief(e.target.value)}
                    placeholder="Décrivez votre besoin en détail..."
                    rows={4}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white text-sm resize-none focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    onClick={generate}
                    disabled={generating || !brief.trim()}
                    className="mt-3 w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generating ? 'Génération en cours...' : 'Générer'}
                  </button>
                </div>
                {result && (
                  <div ref={resultRef} className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-medium text-sm">Résultat</h4>
                      <div className="flex gap-2">
                        <button onClick={() => navigator.clipboard.writeText(result)} className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600">Copier</button>
                        <button onClick={saveResult} className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">Sauvegarder</button>
                      </div>
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-gray-300 text-sm max-h-[50vh] overflow-y-auto">
                      {result}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-gray-800/50 rounded-xl p-12 text-center text-gray-500 border border-gray-700/50">
                Sélectionnez un template pour commencer
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'library' && (
        <div className="space-y-3">
          {docs.length === 0 ? (
            <div className="bg-gray-800/50 rounded-xl p-12 text-center text-gray-500 border border-gray-700/50">
              Aucun document sauvegardé — générez-en un !
            </div>
          ) : viewDoc ? (
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{viewDoc.templateIcon}</span>
                  <h3 className="text-white font-medium">{viewDoc.templateTitle}</h3>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigator.clipboard.writeText(viewDoc.content)} className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-xs">Copier</button>
                  <button onClick={() => setViewDoc(null)} className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-xs">Fermer</button>
                </div>
              </div>
              <p className="text-gray-500 text-xs mb-3">Brief: {viewDoc.brief}</p>
              <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-gray-300">{viewDoc.content}</div>
            </div>
          ) : (
            docs.map(doc => (
              <div key={doc.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center justify-between hover:border-gray-600 cursor-pointer" onClick={() => setViewDoc(doc)}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{doc.templateIcon}</span>
                  <div>
                    <p className="text-white text-sm font-medium">{doc.templateTitle}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{doc.brief.slice(0, 80)}{doc.brief.length > 80 ? '...' : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600">{new Date(doc.createdAt).toLocaleDateString('fr-FR')}</span>
                  <button onClick={(e) => { e.stopPropagation(); saveDocs(docs.filter(d => d.id !== doc.id)); }} className="text-red-500 text-xs hover:text-red-400">Supprimer</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
