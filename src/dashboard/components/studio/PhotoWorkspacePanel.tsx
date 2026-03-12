'use client';

import PhotoPromptEditor from './PhotoPromptEditor';
import PhotoPreview from './PhotoPreview';
import CostEstimator from './CostEstimator';
import RoadmapBadge from './RoadmapBadge';
import type { WorkflowStep } from '../../lib/studio-workflows';

interface QuickStart {
  label: string;
  prompt: string;
  style: string;
  dimensions: string;
}

interface PhotoWorkspacePanelProps {
  steps: WorkflowStep[];
  currentStep: number;
  costSteps: string[];
  token: string;
  prompt: string;
  onPromptChange: (prompt: string) => void;
  negativePrompt: string;
  onNegativePromptChange: (neg: string) => void;
  style: string;
  onStyleChange: (style: string) => void;
  dimensions: string;
  onDimensionsChange: (dim: string) => void;
  costConfirmed: boolean;
  onCostConfirm: () => void;
  generationId: string | null;
  imageUrl: string | null;
  onImageComplete: (url: string) => void;
  onGenerate: () => void;
  generating: boolean;
  quickStarts?: QuickStart[];
  onQuickStart?: (qs: QuickStart) => void;
}

export default function PhotoWorkspacePanel({
  steps, currentStep, costSteps, token,
  prompt, onPromptChange, negativePrompt, onNegativePromptChange,
  style, onStyleChange, dimensions, onDimensionsChange,
  costConfirmed, onCostConfirm,
  generationId, imageUrl, onImageComplete,
  onGenerate, generating,
  quickStarts, onQuickStart,
}: PhotoWorkspacePanelProps) {
  const step = steps[currentStep];
  if (!step) return null;

  const renderStep = () => {
    switch (step.type) {
      case 'chat':
        return (
          <div style={{ padding: 20 }}>
            <div style={{
              fontSize: 11, fontWeight: 600, color: '#6B6B6B', textTransform: 'uppercase',
              letterSpacing: 1, marginBottom: 12,
            }}>
              {step.title}
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, marginBottom: 16 }}>
              Discutez avec Emma pour definir votre vision. Elle vous guidera pour creer le prompt parfait.
            </div>
            {quickStarts && quickStarts.length > 0 && onQuickStart && (
              <div>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: '#1A1A1A', textTransform: 'uppercase',
                  letterSpacing: 0.5, marginBottom: 10,
                }}>
                  Demarrage rapide
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {quickStarts.map((qs, i) => (
                    <button
                      key={i}
                      onClick={() => onQuickStart(qs)}
                      style={{
                        padding: '12px 14px', borderRadius: 10, textAlign: 'left',
                        border: '1px solid #E5E5E5', background: '#F7F7F7',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 4 }}>
                        {qs.label}
                      </div>
                      <div style={{ fontSize: 11, color: '#9B9B9B', lineHeight: 1.4 }}>
                        {qs.prompt.slice(0, 80)}...
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'script': // Used as "prompt" step for photos
        return (
          <div style={{ padding: 20 }}>
            <div style={{
              fontSize: 11, fontWeight: 600, color: '#6B6B6B', textTransform: 'uppercase',
              letterSpacing: 1, marginBottom: 12,
            }}>
              Prompt & Style
            </div>
            <PhotoPromptEditor
              prompt={prompt}
              onPromptChange={onPromptChange}
              negativePrompt={negativePrompt}
              onNegativePromptChange={onNegativePromptChange}
              style={style}
              onStyleChange={onStyleChange}
              dimensions={dimensions}
              onDimensionsChange={onDimensionsChange}
            />
          </div>
        );

      case 'cost':
        return (
          <div style={{ padding: 20 }}>
            <CostEstimator
              costSteps={costSteps}
              confirmed={costConfirmed}
              onConfirm={onCostConfirm}
            />
            {costConfirmed && prompt.trim() && (
              <button
                onClick={onGenerate}
                disabled={generating}
                style={{
                  marginTop: 16, width: '100%', padding: '14px 24px', borderRadius: 10,
                  border: 'none', background: generating ? '#9B9B9B' : '#1A1A1A',
                  color: 'white', fontSize: 14, fontWeight: 700,
                  cursor: generating ? 'wait' : 'pointer',
                }}
              >
                {generating ? 'Generation...' : 'Generer l\'image'}
              </button>
            )}
          </div>
        );

      case 'generate':
      case 'result':
        return (
          <div style={{ padding: 20 }}>
            <div style={{
              fontSize: 11, fontWeight: 600, color: '#6B6B6B', textTransform: 'uppercase',
              letterSpacing: 1, marginBottom: 12,
            }}>
              {step.type === 'generate' ? 'Generation' : 'Resultat'}
            </div>
            <PhotoPreview
              generationId={generationId}
              onComplete={onImageComplete}
            />
          </div>
        );

      case 'roadmap':
        return (
          <div style={{
            padding: 40, textAlign: 'center', border: '2px dashed #E5E5E5',
            borderRadius: 12, background: '#F7F7F7', margin: 20,
          }}>
            <div style={{ marginBottom: 12 }}><RoadmapBadge /></div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#6B6B6B', marginBottom: 8 }}>
              {step.title} — Bientot disponible
            </div>
            <div style={{ fontSize: 13, color: '#9B9B9B', lineHeight: 1.6 }}>
              Cette fonctionnalite sera integree prochainement.
              Emma peut deja vous guider pour preparer vos briefs.
            </div>
          </div>
        );

      default:
        return (
          <div style={{ padding: 20, color: '#9B9B9B', fontSize: 13 }}>
            Etape: {step.title}
          </div>
        );
    }
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#fafafa' }}>
      {renderStep()}
    </div>
  );
}
