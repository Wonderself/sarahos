'use client';

import { useState } from 'react';
import type { WorkflowStep } from '../../lib/studio-workflows';
import AudioPreview from './AudioPreview';
import VideoPreview from './VideoPreview';
import CostEstimator from './CostEstimator';
import RoadmapBadge from './RoadmapBadge';

interface WorkspacePanelProps {
  steps: WorkflowStep[];
  currentStep: number;
  costSteps: string[];
  token: string;
  // State from parent
  script: string;
  onScriptChange: (s: string) => void;
  avatarUrl: string;
  onAvatarUrlChange: (u: string) => void;
  voiceProvider: string;
  onVoiceSelect: (p: string) => void;
  costConfirmed: boolean;
  onCostConfirm: () => void;
  videoId: string | null;
  videoUrl: string | null;
  onVideoComplete: (url: string) => void;
  onGenerate: () => void;
  generating: boolean;
}

export default function WorkspacePanel(props: WorkspacePanelProps) {
  const step = props.steps[props.currentStep];
  if (!step) return null;

  return (
    <div style={{
      height: '100%', overflowY: 'auto', padding: 20, background: '#fafafa',
    }}>
      <div style={{
        fontSize: 11, fontWeight: 600, color: '#5b6cf7', textTransform: 'uppercase',
        letterSpacing: 1, marginBottom: 6,
      }}>
        {step.title}
      </div>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 16 }}>
        {step.description}
      </div>

      {/* Chat step — placeholder */}
      {step.type === 'chat' && (
        <div style={{
          padding: 30, textAlign: 'center', border: '2px dashed #e5e7eb',
          borderRadius: 12, color: '#9ca3af', fontSize: 13,
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>💬</div>
          <div>Discutez avec l&apos;agent pour definir votre projet.</div>
          <div style={{ fontSize: 11, marginTop: 4 }}>
            Les elements apparaitront ici au fur et a mesure.
          </div>
        </div>
      )}

      {/* Script editor */}
      {step.type === 'script' && (
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#1d1d1f', display: 'block', marginBottom: 6 }}>
            Script de la video
          </label>
          <textarea
            value={props.script}
            onChange={e => props.onScriptChange(e.target.value)}
            placeholder="Le script sera genere par l'agent. Vous pouvez aussi l'ecrire ou le modifier ici..."
            rows={10}
            style={{
              width: '100%', padding: 12, borderRadius: 10, border: '1px solid #e5e7eb',
              fontSize: 13, fontFamily: 'inherit', lineHeight: 1.7, resize: 'vertical',
              outline: 'none',
            }}
          />
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
            {props.script.length} caracteres — ~{Math.ceil(props.script.length / 15)}s de video
          </div>
        </div>
      )}

      {/* Voice selection */}
      {step.type === 'voice' && (
        <AudioPreview
          text={props.script}
          token={props.token}
          onSelect={props.onVoiceSelect}
        />
      )}

      {/* Avatar / Source image */}
      {step.type === 'avatar' && (
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#1d1d1f', display: 'block', marginBottom: 6 }}>
            Image source pour D-ID
          </label>
          <input
            type="url"
            value={props.avatarUrl}
            onChange={e => props.onAvatarUrlChange(e.target.value)}
            placeholder="URL de l'image (portrait de face recommande)"
            style={{
              width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e5e7eb',
              fontSize: 13, outline: 'none',
            }}
          />
          {props.avatarUrl && (
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={props.avatarUrl}
                alt="Avatar preview"
                style={{ maxWidth: 200, maxHeight: 200, borderRadius: 12, border: '1px solid #e5e7eb' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}
          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>
            Utilisez un portrait de face, eclairage uniforme, fond neutre. Resolution min 512x512.
          </p>
        </div>
      )}

      {/* Cost estimator */}
      {step.type === 'cost' && (
        <CostEstimator
          costSteps={props.costSteps}
          onConfirm={props.onCostConfirm}
          confirmed={props.costConfirmed}
        />
      )}

      {/* Generation */}
      {step.type === 'generate' && (
        <div>
          {!props.videoId && !props.generating ? (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <button
                onClick={props.onGenerate}
                disabled={!props.costConfirmed || !props.script.trim()}
                style={{
                  padding: '14px 32px', borderRadius: 10, border: 'none',
                  background: props.costConfirmed ? '#5b6cf7' : '#d1d5db',
                  color: 'white', fontSize: 14, fontWeight: 600,
                  cursor: props.costConfirmed ? 'pointer' : 'not-allowed',
                }}
              >
                Generer la video
              </button>
              {!props.costConfirmed && (
                <p style={{ fontSize: 11, color: '#ef4444', marginTop: 8 }}>
                  Veuillez confirmer le cout a l&apos;etape precedente
                </p>
              )}
            </div>
          ) : (
            <VideoPreview
              videoId={props.videoId}
              resultUrl={null}
              token={props.token}
              onComplete={props.onVideoComplete}
            />
          )}
        </div>
      )}

      {/* Result */}
      {step.type === 'result' && (
        <div>
          {props.videoUrl ? (
            <VideoPreview
              videoId={null}
              resultUrl={props.videoUrl}
              token={props.token}
            />
          ) : (
            <div style={{
              padding: 30, textAlign: 'center', border: '2px dashed #e5e7eb',
              borderRadius: 12, color: '#9ca3af', fontSize: 13,
            }}>
              Le resultat final apparaitra ici
            </div>
          )}
        </div>
      )}

      {/* Roadmap */}
      {step.type === 'roadmap' && (
        <div style={{
          padding: 30, textAlign: 'center', border: '2px dashed #fcd34d',
          borderRadius: 12, background: '#fffbeb',
        }}>
          <div style={{ marginBottom: 12 }}>
            <RoadmapBadge />
          </div>
          <div style={{ fontSize: 13, color: '#92400e' }}>
            Cette fonctionnalite sera disponible prochainement.
          </div>
          <div style={{ fontSize: 11, color: '#b45309', marginTop: 8 }}>
            L&apos;agent peut quand meme vous guider et preparer le travail.
          </div>
        </div>
      )}
    </div>
  );
}
