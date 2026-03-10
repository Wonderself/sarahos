'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { VIDEO_WORKFLOWS } from '../../../../lib/studio-workflows';
import {
  type StudioRequest,
  getPendingRequests,
  seedDemoRequestsIfEmpty,
  startWorkOnRequest,
  saveVideoToLibrary,
} from '../../../../lib/studio-requests';
import ChatPanel from '../../../../components/studio/ChatPanel';
import WorkspacePanel from '../../../../components/studio/WorkspacePanel';
import WorkflowStepper from '../../../../components/studio/WorkflowStepper';
import RoadmapBadge from '../../../../components/studio/RoadmapBadge';
import AgentRequestQueue from '../../../../components/studio/AgentRequestQueue';
import VideoLibrary from '../../../../components/studio/VideoLibrary';

function getSession() {
  try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}'); } catch { return {}; }
}

type Mode = 'free' | 'request';

function VideoStudioContent() {
  const searchParams = useSearchParams();
  const workflowId = searchParams.get('workflow') ?? 'video-pub';

  const [selectedWorkflowId, setSelectedWorkflowId] = useState(workflowId);
  const workflow = VIDEO_WORKFLOWS.find(w => w.id === selectedWorkflowId) ?? VIDEO_WORKFLOWS[0]!;

  const [currentStep, setCurrentStep] = useState(0);
  const [script, setScript] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [voiceProvider, setVoiceProvider] = useState('deepgram');
  const [costConfirmed, setCostConfirmed] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Mode + agent requests
  const [mode, setMode] = useState<Mode>('free');
  const [pendingRequests, setPendingRequests] = useState<StudioRequest[]>([]);
  const [activeRequest, setActiveRequest] = useState<StudioRequest | null>(null);
  const [latestVideoLibId, setLatestVideoLibId] = useState<string | null>(null);

  // Advanced questions state
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advPublicCible, setAdvPublicCible] = useState('');
  const [advObjectif, setAdvObjectif] = useState('');
  const [advTon, setAdvTon] = useState('');
  const [advDuree, setAdvDuree] = useState('');
  const [advMusique, setAdvMusique] = useState('');
  const [advContraintes, setAdvContraintes] = useState('');

  const session = getSession();
  const token = session.token ?? '';
  const displayName = session.displayName ?? 'Utilisateur';

  // Seed demo + load pending requests
  useEffect(() => {
    seedDemoRequestsIfEmpty();
    setPendingRequests(getPendingRequests('video'));
  }, []);

  const reloadPending = useCallback(() => {
    setPendingRequests(getPendingRequests('video'));
  }, []);

  const handleTakeRequest = useCallback((req: StudioRequest) => {
    startWorkOnRequest(req.id);
    setActiveRequest(req);
    setScript(req.description);
    setMode('request');
    reloadPending();
    // Move to script step
    setCurrentStep(1);
  }, [reloadPending]);

  const handleRequestFulfilled = useCallback(() => {
    setActiveRequest(null);
    reloadPending();
  }, [reloadPending]);

  const handleAgentAction = useCallback((action: { type: string; data: string }) => {
    switch (action.type) {
      case 'set_script':
        setScript(action.data);
        setCurrentStep(1);
        break;
      case 'suggest_voice':
        setVoiceProvider(action.data || 'deepgram');
        setCurrentStep(2);
        break;
      case 'set_parameter': {
        const [key, value] = action.data.split(':');
        if (key === 'avatar_url') setAvatarUrl(value ?? '');
        break;
      }
      case 'ready_to_generate':
        setCurrentStep(4);
        break;
    }
  }, []);

  const buildEnrichedScript = useCallback(() => {
    const parts = [script.trim()];
    if (advPublicCible.trim()) parts.push(`Public cible: ${advPublicCible.trim()}`);
    if (advObjectif) parts.push(`Objectif: ${advObjectif}`);
    if (advTon) parts.push(`Ton: ${advTon}`);
    if (advDuree) parts.push(`Duree souhaitee: ${advDuree}`);
    if (advMusique.trim()) parts.push(`Musique/ambiance: ${advMusique.trim()}`);
    if (advContraintes.trim()) parts.push(`Contraintes: ${advContraintes.trim()}`);
    return parts.join('\n');
  }, [script, advPublicCible, advObjectif, advTon, advDuree, advMusique, advContraintes]);

  const handleGenerate = useCallback(async () => {
    if (!script.trim() || !costConfirmed) return;
    setGenerating(true);
    setCurrentStep(5);

    const enrichedScript = buildEnrichedScript();

    try {
      const res = await fetch('/api/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          token,
          script: enrichedScript,
          sourceUrl: avatarUrl || undefined,
          voiceProvider,
        }),
      });

      const data = await res.json();
      if (data.id) {
        setVideoId(data.id);
      }
    } catch {
      // Error handled in VideoPreview
    } finally {
      setGenerating(false);
    }
  }, [script, costConfirmed, token, avatarUrl, voiceProvider, buildEnrichedScript]);

  const handleVideoComplete = useCallback((url: string) => {
    setVideoUrl(url);
    setCurrentStep(6);
    // Save to video library
    const saved = saveVideoToLibrary({
      url,
      script: script.trim(),
      workflow: selectedWorkflowId,
      provider: avatarUrl ? 'did' : 'fal-ai',
      requestId: activeRequest?.id,
    });
    setLatestVideoLibId(saved.id);
  }, [script, selectedWorkflowId, avatarUrl, activeRequest]);

  const systemPrompt = workflow.systemPrompt
    .replace('{displayName}', displayName)
    .replace('{step.title}', workflow.steps[currentStep]?.title ?? '');

  const pendingCount = pendingRequests.length;

  return (
    <div style={{ height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{
        padding: '8px 16px', borderBottom: '1px solid var(--fz-border, #E2E8F0)',
        display: 'flex', alignItems: 'center', gap: 10, background: 'var(--fz-bg, #FFFFFF)', flexWrap: 'wrap',
      }}>
        <a href="/client/studio" style={{ fontSize: 12, color: 'var(--fz-text-secondary, #64748B)', textDecoration: 'none' }}>
          ← Studio
        </a>
        <span style={{ color: '#d1d5db' }}>|</span>

        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: 2, background: 'var(--fz-bg-secondary, #F8FAFC)', borderRadius: 8, padding: 3 }}>
          <button
            onClick={() => setMode('free')}
            style={{
              padding: '4px 12px', borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 600,
              cursor: 'pointer',
              background: mode === 'free' ? 'var(--fz-bg, #FFFFFF)' : 'transparent',
              color: mode === 'free' ? '#7c3aed' : 'var(--fz-text-secondary, #64748B)',
              boxShadow: mode === 'free' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            ✏️ Création libre
          </button>
          <button
            onClick={() => setMode('request')}
            style={{
              padding: '4px 12px', borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
              background: mode === 'request' ? 'var(--fz-bg, #FFFFFF)' : 'transparent',
              color: mode === 'request' ? '#7c3aed' : 'var(--fz-text-secondary, #64748B)',
              boxShadow: mode === 'request' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            ⬇️ Demandes agents
            {pendingCount > 0 && (
              <span style={{
                background: '#ef4444', color: 'white', borderRadius: '50%',
                width: 16, height: 16, fontSize: 9, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        <span style={{ color: '#d1d5db' }}>|</span>

        {/* Workflow selector */}
        <select
          value={selectedWorkflowId}
          onChange={e => {
            setSelectedWorkflowId(e.target.value);
            setCurrentStep(0);
            setScript('');
            setCostConfirmed(false);
            setVideoId(null);
            setVideoUrl(null);
          }}
          style={{
            padding: '4px 8px', borderRadius: 6, border: '1px solid var(--fz-border, #E2E8F0)',
            fontSize: 12, background: 'var(--fz-bg, #FFFFFF)', outline: 'none',
          }}
        >
          {VIDEO_WORKFLOWS.map(wf => (
            <option key={wf.id} value={wf.id} disabled={!wf.available}>
              {wf.icon} {wf.label} {!wf.available ? '(bientot)' : ''}
            </option>
          ))}
        </select>

        {!workflow.available && <RoadmapBadge />}

        {/* Stepper */}
        <div style={{ flex: 1, maxWidth: 480 }}>
          <WorkflowStepper
            steps={workflow.steps}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
          />
        </div>
      </div>

      {/* Active request banner */}
      {activeRequest && (
        <div style={{
          padding: '8px 16px', background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
          borderBottom: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 16 }}>{activeRequest.agentEmoji}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#92400e' }}>
              Demande en cours : {activeRequest.agentName}
            </span>
            <span style={{ fontSize: 11, color: '#78350f', marginLeft: 8 }}>
              — {activeRequest.title}
            </span>
          </div>
          <button
            onClick={() => { setActiveRequest(null); reloadPending(); }}
            style={{
              fontSize: 10, padding: '3px 8px', borderRadius: 5, border: '1px solid #fbbf24',
              background: 'var(--fz-bg, #FFFFFF)', color: '#92400e', cursor: 'pointer', fontWeight: 600,
            }}
          >
            Annuler
          </button>
        </div>
      )}

      {/* Split panel */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Chat — 45% */}
        <div style={{ width: '45%', minWidth: 300 }}>
          <ChatPanel
            systemPrompt={systemPrompt}
            agentName="lucas-video"
            agentEmoji="movie"
            agentLabel="Lucas — Vidéo"
            token={token}
            onAgentAction={handleAgentAction}
          />
        </div>

        {/* Workspace — 55% */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <WorkspacePanel
            steps={workflow.steps}
            currentStep={currentStep}
            costSteps={workflow.costSteps}
            token={token}
            script={script}
            onScriptChange={setScript}
            avatarUrl={avatarUrl}
            onAvatarUrlChange={setAvatarUrl}
            voiceProvider={voiceProvider}
            onVoiceSelect={setVoiceProvider}
            costConfirmed={costConfirmed}
            onCostConfirm={() => setCostConfirmed(true)}
            videoId={videoId}
            videoUrl={videoUrl}
            onVideoComplete={handleVideoComplete}
            onGenerate={handleGenerate}
            generating={generating}
          />

          {/* Advanced Questions — compact 2-col grid */}
          <div style={{ padding: '0 20px 12px', background: 'var(--fz-bg-secondary, #F8FAFC)' }}>
            <button
              onClick={() => setAdvancedOpen(!advancedOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, width: '100%',
                padding: '8px 0', border: 'none', background: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 600, color: 'var(--fz-text-muted, #94A3B8)', textAlign: 'left',
              }}
            >
              <span style={{
                display: 'inline-block', transition: 'transform 0.2s',
                transform: advancedOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                fontSize: 9,
              }}>▶</span>
              Paramètres avancés (optionnel)
            </button>

            {advancedOpen && (
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
                padding: 14, background: 'var(--fz-bg, #FFFFFF)', borderRadius: 10,
                border: '1px solid var(--fz-border, #E2E8F0)',
              }}>
                {/* Public cible */}
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--fz-text-secondary, #64748B)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                    Public cible
                  </label>
                  <input type="text" value={advPublicCible} onChange={e => setAdvPublicCible(e.target.value)}
                    placeholder="Entrepreneurs, mamans..." style={{ width: '100%', padding: '6px 9px', borderRadius: 7, border: '1px solid var(--fz-border, #E2E8F0)', fontSize: 11, outline: 'none', boxSizing: 'border-box' }} />
                </div>

                {/* Objectif */}
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--fz-text-secondary, #64748B)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                    Objectif
                  </label>
                  <select value={advObjectif} onChange={e => setAdvObjectif(e.target.value)}
                    style={{ width: '100%', padding: '6px 9px', borderRadius: 7, border: '1px solid var(--fz-border, #E2E8F0)', fontSize: 11, outline: 'none', background: 'var(--fz-bg, #FFFFFF)', boxSizing: 'border-box' }}>
                    <option value="">— Choisir —</option>
                    <option value="Informer">Informer</option>
                    <option value="Vendre">Vendre</option>
                    <option value="Divertir">Divertir</option>
                    <option value="Eduquer">Éduquer</option>
                    <option value="Former">Former</option>
                  </select>
                </div>

                {/* Ton */}
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--fz-text-secondary, #64748B)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                    Ton
                  </label>
                  <select value={advTon} onChange={e => setAdvTon(e.target.value)}
                    style={{ width: '100%', padding: '6px 9px', borderRadius: 7, border: '1px solid var(--fz-border, #E2E8F0)', fontSize: 11, outline: 'none', background: 'var(--fz-bg, #FFFFFF)', boxSizing: 'border-box' }}>
                    <option value="">— Choisir —</option>
                    <option value="Professionnel">Professionnel</option>
                    <option value="Décontracté">Décontracté</option>
                    <option value="Dynamique">Dynamique</option>
                    <option value="Inspirant">Inspirant</option>
                    <option value="Humoristique">Humoristique</option>
                  </select>
                </div>

                {/* Durée */}
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--fz-text-secondary, #64748B)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                    Durée
                  </label>
                  <select value={advDuree} onChange={e => setAdvDuree(e.target.value)}
                    style={{ width: '100%', padding: '6px 9px', borderRadius: 7, border: '1px solid var(--fz-border, #E2E8F0)', fontSize: 11, outline: 'none', background: 'var(--fz-bg, #FFFFFF)', boxSizing: 'border-box' }}>
                    <option value="">— Choisir —</option>
                    <option value="< 30s">{'< 30s'}</option>
                    <option value="30s-1min">30s–1min</option>
                    <option value="1-3 min">1–3 min</option>
                    <option value="3-5 min">3–5 min</option>
                    <option value="> 5 min">{'> 5 min'}</option>
                  </select>
                </div>

                {/* Musique */}
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--fz-text-secondary, #64748B)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                    Musique / ambiance
                  </label>
                  <input type="text" value={advMusique} onChange={e => setAdvMusique(e.target.value)}
                    placeholder="Corporate, énergique..." style={{ width: '100%', padding: '6px 9px', borderRadius: 7, border: '1px solid var(--fz-border, #E2E8F0)', fontSize: 11, outline: 'none', boxSizing: 'border-box' }} />
                </div>

                {/* Contraintes */}
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--fz-text-secondary, #64748B)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                    Contraintes
                  </label>
                  <input type="text" value={advContraintes} onChange={e => setAdvContraintes(e.target.value)}
                    placeholder="Texte obligatoire, logo..." style={{ width: '100%', padding: '6px 9px', borderRadius: 7, border: '1px solid var(--fz-border, #E2E8F0)', fontSize: 11, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
            )}
          </div>

          {/* Bottom panel: Agent requests + Video library */}
          <div style={{ maxHeight: '36vh', overflowY: 'auto', borderTop: '2px solid var(--fz-border, #E2E8F0)' }}>
            <AgentRequestQueue
              type="video"
              activeRequestId={activeRequest?.id ?? null}
              completedMediaUrl={videoUrl ?? null}
              onTakeRequest={handleTakeRequest}
              onRequestFulfilled={handleRequestFulfilled}
            />
            <VideoLibrary
              highlightedId={latestVideoLibId}
              onReuseScript={(s) => { setScript(s); setCurrentStep(1); }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VideoStudioPage() {
  return (
    <Suspense fallback={<div style={{ padding: 32 }}>Chargement...</div>}>
      <VideoStudioContent />
    </Suspense>
  );
}
