'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PHOTO_WORKFLOWS } from '../../../../lib/studio-workflows';
import {
  type StudioRequest,
  getPendingRequests,
  seedDemoRequestsIfEmpty,
  startWorkOnRequest,
} from '../../../../lib/studio-requests';
import { saveGeneration } from '../../../../components/studio/GenerationHistory';
import ChatPanel from '../../../../components/studio/ChatPanel';
import PhotoWorkspacePanel from '../../../../components/studio/PhotoWorkspacePanel';
import WorkflowStepper from '../../../../components/studio/WorkflowStepper';
import RoadmapBadge from '../../../../components/studio/RoadmapBadge';
import AgentRequestQueue from '../../../../components/studio/AgentRequestQueue';
import StudioPhotoGallery from '../../../../components/studio/StudioPhotoGallery';

function getSession() {
  try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}'); } catch { return {}; }
}

type Mode = 'free' | 'request';

function PhotoStudioContent() {
  const searchParams = useSearchParams();
  const defaultWorkflow = searchParams.get('workflow') ?? 'photo-direction';

  const [selectedWorkflowId, setSelectedWorkflowId] = useState(defaultWorkflow);
  const workflow = PHOTO_WORKFLOWS.find(w => w.id === selectedWorkflowId) ?? PHOTO_WORKFLOWS[0]!;

  // Workspace state
  const [currentStep, setCurrentStep] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [dimensions, setDimensions] = useState('square');
  const [costConfirmed, setCostConfirmed] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [briefContent, setBriefContent] = useState('');

  // Mode & agent requests
  const [mode, setMode] = useState<Mode>('free');
  const [pendingRequests, setPendingRequests] = useState<StudioRequest[]>([]);
  const [activeRequest, setActiveRequest] = useState<StudioRequest | null>(null);

  // Advanced questions state
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advPublicCible, setAdvPublicCible] = useState('');
  const [advObjectif, setAdvObjectif] = useState('');
  const [advTon, setAdvTon] = useState('');
  const [advElementsInclure, setAdvElementsInclure] = useState('');
  const [advElementsEviter, setAdvElementsEviter] = useState('');
  const [advInspiration, setAdvInspiration] = useState('');

  const session = getSession();
  const token = session.token ?? '';
  const displayName = session.displayName ?? 'Utilisateur';

  const hasGeneration = workflow.costSteps.some(s => s.startsWith('fal-ai'));

  useEffect(() => {
    seedDemoRequestsIfEmpty();
    setPendingRequests(getPendingRequests('photo'));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const reloadRequests = () => setPendingRequests(getPendingRequests('photo'));

  const handleTakeRequest = useCallback((req: StudioRequest) => {
    setActiveRequest(req);
    setMode('request');
    setPrompt(req.description);
    if (req.specs.style) setStyle(req.specs.style);
    if (req.specs.dimensions) setDimensions(req.specs.dimensions);
    // Auto-switch to a generation-capable workflow if needed
    if (!workflow.costSteps.some(s => s.startsWith('fal-ai'))) {
      const genWf = PHOTO_WORKFLOWS.find(w => w.costSteps.some(s => s.startsWith('fal-ai')));
      if (genWf) setSelectedWorkflowId(genWf.id);
    }
    setCurrentStep(1);
    startWorkOnRequest(req.id);
    reloadRequests();
  }, [workflow.costSteps]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAgentAction = useCallback((action: { type: string; data: string }) => {
    if (action.type === 'set_parameter') {
      const colonIdx = action.data.indexOf(':');
      if (colonIdx > 0) {
        const key = action.data.slice(0, colonIdx);
        const value = action.data.slice(colonIdx + 1);
        if (key === 'prompt') { setPrompt(value); setCurrentStep(1); }
        else if (key === 'style') setStyle(value);
        else if (key === 'palette' || key === 'brief') setBriefContent(prev => prev + '\n\n' + value);
      }
    } else if (action.type === 'ready_to_generate') {
      setCurrentStep(2);
    }
  }, []);

  const buildEnrichedPrompt = useCallback(() => {
    const parts = [prompt.trim()];
    if (advPublicCible.trim()) parts.push(`Public cible: ${advPublicCible.trim()}`);
    if (advObjectif) parts.push(`Objectif: ${advObjectif}`);
    if (advTon) parts.push(`Ton: ${advTon}`);
    if (advElementsInclure.trim()) parts.push(`Elements a inclure: ${advElementsInclure.trim()}`);
    if (advElementsEviter.trim()) parts.push(`Elements a eviter: ${advElementsEviter.trim()}`);
    if (advInspiration.trim()) parts.push(`Inspiration: ${advInspiration.trim()}`);
    return parts.join('\n');
  }, [prompt, advPublicCible, advObjectif, advTon, advElementsInclure, advElementsEviter, advInspiration]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || !costConfirmed) return;
    setGenerating(true);
    setImageUrl(null);
    setGenerationId(null);
    setCurrentStep(3);
    const enrichedPrompt = buildEnrichedPrompt();
    try {
      const res = await fetch('/api/photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: enrichedPrompt, negativePrompt, style, dimensions }),
      });
      const data = await res.json();
      if (data.imageUrl && data.status === 'completed') {
        setImageUrl(data.imageUrl);
        setCurrentStep(4);
        saveGeneration({ imageUrl: data.imageUrl, prompt, style, dimensions, workflow: workflow.label });
      } else if (data.id) {
        setGenerationId(data.id);
      }
    } catch { /* error handled in PhotoPreview */ }
    finally { setGenerating(false); }
  }, [prompt, negativePrompt, style, dimensions, costConfirmed, buildEnrichedPrompt, workflow.label]);

  const handleReset = () => {
    setPrompt('');
    setNegativePrompt('');
    setCostConfirmed(false);
    setGenerationId(null);
    setImageUrl(null);
    setBriefContent('');
    setCurrentStep(0);
    setAdvancedOpen(false);
    setAdvPublicCible('');
    setAdvObjectif('');
    setAdvTon('');
    setAdvElementsInclure('');
    setAdvElementsEviter('');
    setAdvInspiration('');
    setActiveRequest(null);
  };

  const systemPrompt = workflow.systemPrompt.replace('{displayName}', displayName);

  return (
    <div style={{ height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column', background: '#f9fafb' }}>

      {/* ── Top bar ── */}
      <div style={{
        padding: '0 16px', borderBottom: '1px solid #e5e7eb',
        display: 'flex', alignItems: 'center', gap: 10, background: 'white',
        height: 44, flexShrink: 0,
      }}>
        <a href="/client/studio" style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none', flexShrink: 0 }}>
          ← Studio
        </a>
        <span style={{ color: '#d1d5db' }}>|</span>

        <select
          value={selectedWorkflowId}
          onChange={e => { setSelectedWorkflowId(e.target.value); handleReset(); }}
          style={{
            padding: '4px 8px', borderRadius: 6, border: '1px solid #e5e7eb',
            fontSize: 12, background: 'white', outline: 'none', maxWidth: 160,
          }}
        >
          {PHOTO_WORKFLOWS.map(wf => (
            <option key={wf.id} value={wf.id}>{wf.icon} {wf.label}</option>
          ))}
        </select>

        {!workflow.available && <RoadmapBadge />}

        {/* Mode tabs */}
        {hasGeneration && (
          <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 8, padding: 2 }}>
            <button
              onClick={() => { setMode('free'); setActiveRequest(null); }}
              style={{
                padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                border: 'none', cursor: 'pointer',
                background: mode === 'free' ? 'white' : 'transparent',
                color: mode === 'free' ? '#1d1d1f' : '#6b7280',
                boxShadow: mode === 'free' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              ✏️ Création libre
            </button>
            <button
              onClick={() => setMode('request')}
              style={{
                padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                background: mode === 'request' ? 'white' : 'transparent',
                color: mode === 'request' ? '#1d1d1f' : '#6b7280',
                boxShadow: mode === 'request' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              📥 Demandes agents
              {pendingRequests.length > 0 && (
                <span style={{
                  fontSize: 9, fontWeight: 700, background: '#ef4444', color: 'white',
                  padding: '1px 5px', borderRadius: 8,
                }}>
                  {pendingRequests.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Stepper */}
        {hasGeneration && (
          <div style={{ flex: 1, maxWidth: 400, minWidth: 0 }}>
            <WorkflowStepper
              steps={workflow.steps}
              currentStep={currentStep}
              onStepClick={setCurrentStep}
            />
          </div>
        )}
      </div>

      {/* ── Active request banner ── */}
      {activeRequest && (
        <div style={{
          background: activeRequest.agentColor + '10',
          borderBottom: `1px solid ${activeRequest.agentColor}30`,
          padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
        }}>
          <span style={{ fontSize: 16 }}>{activeRequest.agentEmoji}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: activeRequest.agentColor }}>
              {activeRequest.agentName}
            </span>
            <span style={{ fontSize: 11, color: '#374151' }}>
              {' '}&mdash; {activeRequest.title}
            </span>
          </div>
          <span style={{
            fontSize: 10, color: '#10b981', fontWeight: 600,
            background: '#d1fae5', padding: '2px 8px', borderRadius: 8,
          }}>
            En cours
          </span>
          <button
            onClick={() => setActiveRequest(null)}
            style={{ fontSize: 10, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Main split ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* Chat — 45% */}
        <div style={{
          width: '45%', minWidth: 260, borderRight: '1px solid #e5e7eb',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <ChatPanel
            systemPrompt={systemPrompt}
            agentName="emma-photo"
            agentEmoji="📸"
            agentLabel="Emma — Photo"
            token={token}
            onAgentAction={handleAgentAction}
          />
        </div>

        {/* Workspace — 55% */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {hasGeneration ? (
              <>
                <PhotoWorkspacePanel
                  steps={workflow.steps}
                  currentStep={currentStep}
                  costSteps={workflow.costSteps}
                  token={token}
                  prompt={prompt}
                  onPromptChange={setPrompt}
                  negativePrompt={negativePrompt}
                  onNegativePromptChange={setNegativePrompt}
                  style={style}
                  onStyleChange={setStyle}
                  dimensions={dimensions}
                  onDimensionsChange={setDimensions}
                  costConfirmed={costConfirmed}
                  onCostConfirm={() => setCostConfirmed(true)}
                  generationId={generationId}
                  imageUrl={imageUrl}
                  onImageComplete={(url) => {
                    setImageUrl(url);
                    setCurrentStep(4);
                    saveGeneration({ imageUrl: url, prompt, style, dimensions, workflow: workflow.label });
                  }}
                  onGenerate={handleGenerate}
                  generating={generating}
                  quickStarts={workflow.quickStarts}
                  onQuickStart={(qs) => {
                    setPrompt(qs.prompt);
                    setStyle(qs.style);
                    setDimensions(qs.dimensions);
                    setCurrentStep(1);
                  }}
                />

                {/* Advanced questions — compact 2-col grid */}
                <div style={{ padding: '0 16px 14px', background: '#fafafa' }}>
                  <button
                    onClick={() => setAdvancedOpen(!advancedOpen)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, width: '100%',
                      padding: '8px 0', border: 'none', background: 'none', cursor: 'pointer',
                      fontSize: 11, fontWeight: 600, color: '#6b7280', textAlign: 'left',
                    }}
                  >
                    <span style={{
                      display: 'inline-block', transition: 'transform 0.2s',
                      transform: advancedOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                    }}>▶</span>
                    Paramètres avancés (optionnel)
                  </button>

                  {advancedOpen && (
                    <div style={{
                      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
                      padding: 14, background: 'white', borderRadius: 10,
                      border: '1px solid #e5e7eb',
                    }}>
                      {[
                        { label: 'Public cible', value: advPublicCible, set: setAdvPublicCible, placeholder: 'Ex: entrepreneurs, gamers...' },
                        { label: 'Inspiration / références', value: advInspiration, set: setAdvInspiration, placeholder: 'URL ou description...' },
                      ].map(f => (
                        <div key={f.label}>
                          <label style={{ fontSize: 10, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 3 }}>
                            {f.label}
                          </label>
                          <input
                            type="text"
                            value={f.value}
                            onChange={e => f.set(e.target.value)}
                            placeholder={f.placeholder}
                            style={{
                              width: '100%', padding: '6px 8px', borderRadius: 7,
                              border: '1px solid #e5e7eb', fontSize: 11, outline: 'none',
                            }}
                          />
                        </div>
                      ))}
                      {[
                        { label: 'Objectif', value: advObjectif, set: setAdvObjectif, opts: ['', 'Informer', 'Vendre', 'Divertir', 'Éduquer', 'Promouvoir'] },
                        { label: 'Ton', value: advTon, set: setAdvTon, opts: ['', 'Formel', 'Décontracté', 'Humoristique', 'Inspirant', 'Luxe'] },
                      ].map(f => (
                        <div key={f.label}>
                          <label style={{ fontSize: 10, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 3 }}>
                            {f.label}
                          </label>
                          <select
                            value={f.value}
                            onChange={e => f.set(e.target.value)}
                            style={{
                              width: '100%', padding: '6px 8px', borderRadius: 7,
                              border: '1px solid #e5e7eb', fontSize: 11, outline: 'none',
                              background: 'white',
                            }}
                          >
                            {f.opts.map(o => <option key={o} value={o}>{o || '— Choisir —'}</option>)}
                          </select>
                        </div>
                      ))}
                      <div style={{ gridColumn: '1/-1' }}>
                        <label style={{ fontSize: 10, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 3 }}>
                          Éléments à inclure
                        </label>
                        <textarea
                          value={advElementsInclure}
                          onChange={e => setAdvElementsInclure(e.target.value)}
                          placeholder="Couleurs, objets, textes à intégrer..."
                          rows={2}
                          style={{
                            width: '100%', padding: '6px 8px', borderRadius: 7,
                            border: '1px solid #e5e7eb', fontSize: 11, outline: 'none',
                            fontFamily: 'inherit', resize: 'none',
                          }}
                        />
                      </div>
                      <div style={{ gridColumn: '1/-1' }}>
                        <label style={{ fontSize: 10, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 3 }}>
                          Éléments à éviter
                        </label>
                        <textarea
                          value={advElementsEviter}
                          onChange={e => setAdvElementsEviter(e.target.value)}
                          placeholder="Ce qu'il ne faut PAS montrer..."
                          rows={2}
                          style={{
                            width: '100%', padding: '6px 8px', borderRadius: 7,
                            border: '1px solid #e5e7eb', fontSize: 11, outline: 'none',
                            fontFamily: 'inherit', resize: 'none',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Chat-only workflow (direction, branding) */
              <div style={{ padding: 20, background: '#fafafa', height: '100%' }}>
                <div style={{
                  fontSize: 11, fontWeight: 600, color: '#06b6d4', textTransform: 'uppercase',
                  letterSpacing: 1, marginBottom: 6,
                }}>
                  {workflow.steps[currentStep]?.title ?? 'Brief'}
                </div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#1d1d1f', display: 'block', marginBottom: 6 }}>
                  Notes & brief créatif
                </label>
                <textarea
                  value={briefContent}
                  onChange={e => setBriefContent(e.target.value)}
                  placeholder="Les recommandations d'Emma apparaîtront ici. Ajoutez vos propres notes..."
                  rows={14}
                  style={{
                    width: '100%', padding: 12, borderRadius: 10, border: '1px solid #e5e7eb',
                    fontSize: 13, fontFamily: 'inherit', lineHeight: 1.7, resize: 'vertical',
                    outline: 'none',
                  }}
                />
                {briefContent.trim() && (
                  <button
                    onClick={() => {
                      const blob = new Blob([briefContent], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `brief-${workflow.label.toLowerCase().replace(/\s+/g, '-')}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    style={{
                      marginTop: 12, padding: '10px 20px', borderRadius: 8, border: 'none',
                      background: '#06b6d4', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    ⬇ Télécharger le brief
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom: Agent requests + Photo gallery ── */}
      <div style={{
        flexShrink: 0, borderTop: '2px solid #e5e7eb',
        overflowY: 'auto', maxHeight: '36vh', background: 'white',
      }}>
        <AgentRequestQueue
          type="photo"
          activeRequestId={activeRequest?.id ?? null}
          completedMediaUrl={imageUrl}
          onTakeRequest={handleTakeRequest}
          onRequestFulfilled={() => { reloadRequests(); setActiveRequest(null); }}
        />
        <StudioPhotoGallery
          highlightedUrl={imageUrl}
          onReusePrompt={(p, s) => { setPrompt(p); setStyle(s); setCurrentStep(1); }}
        />
      </div>
    </div>
  );
}

export default function PhotoStudioPage() {
  return (
    <Suspense fallback={<div style={{ padding: 32, textAlign: 'center', color: '#6b7280' }}>Chargement du studio...</div>}>
      <PhotoStudioContent />
    </Suspense>
  );
}
