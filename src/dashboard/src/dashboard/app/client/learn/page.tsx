'use client';

import { useState, useEffect, useCallback } from 'react';
import { useIsMobile } from '../../../lib/use-media-query';
import { CU, pageContainer, headerRow } from '../../../lib/page-styles';
import type { CSSProperties } from 'react';

/* ─── Types ─── */
interface Step {
  id: string;
  title: string;
  description: string;
  link: string;
}

interface Course {
  id: string;
  emoji: string;
  title: string;
  steps: Step[];
  locked: boolean;
  badge: 'Nouveau' | 'Bientôt' | null;
}

/* ─── localStorage key ─── */
const PROGRESS_KEY = 'fz_learn_progress';

/* ─── Courses data ─── */
const COURSES: Course[] = [
  {
    id: 'premiers-pas',
    emoji: '🚀',
    title: 'Premiers pas avec Freenzy',
    badge: 'Nouveau',
    locked: false,
    steps: [
      {
        id: 'decouvrir-dashboard',
        title: 'Découvrez le dashboard',
        description:
          'Familiarisez-vous avec l\'interface : sidebar, navigation, raccourcis clavier et personnalisation de votre espace de travail.',
        link: '/client/dashboard',
      },
      {
        id: 'premier-assistant',
        title: 'Lancez votre premier assistant',
        description:
          'Choisissez un assistant IA parmi les 100+ disponibles, configurez-le et lancez votre première conversation.',
        link: '/client/agents',
      },
      {
        id: 'premier-document',
        title: 'Générez votre premier document',
        description:
          'Utilisez l\'assistant documentaire pour créer un devis, une facture ou un contrat en quelques secondes.',
        link: '/client/documents',
      },
      {
        id: 'personnaliser-assistants',
        title: 'Personnalisez vos assistants',
        description:
          'Adaptez le ton, les connaissances et les compétences de vos assistants à votre activité et à votre marque.',
        link: '/client/agents',
      },
      {
        id: 'inviter-equipe',
        title: 'Invitez votre équipe',
        description:
          'Ajoutez des collaborateurs, attribuez des rôles et définissez les permissions d\'accès à vos assistants.',
        link: '/client/team',
      },
    ],
  },
  {
    id: 'maitrisez-assistants',
    emoji: '🤖',
    title: 'Maîtrisez vos assistants',
    badge: 'Bientôt',
    locked: true,
    steps: [
      { id: 'ma-1', title: 'Conversations avancées', description: 'Apprenez les techniques de prompting pour des réponses plus précises.', link: '#' },
      { id: 'ma-2', title: 'Modes de fonctionnement', description: 'Découvrez les modes L1, L2 et L3 et quand les utiliser.', link: '#' },
      { id: 'ma-3', title: 'Automatisations', description: 'Créez des workflows automatiques entre vos assistants.', link: '#' },
      { id: 'ma-4', title: 'Intégrations externes', description: 'Connectez vos assistants à vos outils existants.', link: '#' },
    ],
  },
  {
    id: 'documents-pro',
    emoji: '📄',
    title: 'Générez des documents pro',
    badge: 'Bientôt',
    locked: true,
    steps: [
      { id: 'dp-1', title: 'Templates personnalisés', description: 'Créez vos propres modèles de documents.', link: '#' },
      { id: 'dp-2', title: 'Génération par lot', description: 'Produisez plusieurs documents en une seule opération.', link: '#' },
      { id: 'dp-3', title: 'Signatures électroniques', description: 'Faites signer vos documents numériquement.', link: '#' },
      { id: 'dp-4', title: 'Archivage intelligent', description: 'Organisez et retrouvez vos documents automatiquement.', link: '#' },
    ],
  },
  {
    id: 'avis-google',
    emoji: '⭐',
    title: 'Répondez aux avis Google',
    badge: 'Bientôt',
    locked: true,
    steps: [
      { id: 'ag-1', title: 'Connectez Google Business', description: 'Liez votre fiche Google à Freenzy.', link: '#' },
      { id: 'ag-2', title: 'Réponses automatiques', description: 'Configurez des réponses intelligentes par ton.', link: '#' },
      { id: 'ag-3', title: 'Analyse de sentiment', description: 'Suivez la satisfaction client dans le temps.', link: '#' },
    ],
  },
  {
    id: 'travail-equipe',
    emoji: '👥',
    title: 'Travaillez en équipe',
    badge: 'Bientôt',
    locked: true,
    steps: [
      { id: 'te-1', title: 'Rôles et permissions', description: 'Définissez qui peut accéder à quoi.', link: '#' },
      { id: 'te-2', title: 'Espaces partagés', description: 'Collaborez sur des projets communs.', link: '#' },
      { id: 'te-3', title: 'Historique d\'activité', description: 'Suivez les actions de votre équipe.', link: '#' },
      { id: 'te-4', title: 'Notifications d\'équipe', description: 'Restez informé des mises à jour importantes.', link: '#' },
    ],
  },
];

const TOTAL_STEPS = COURSES.reduce((sum, c) => sum + c.steps.length, 0);

/* ─── Component ─── */
export default function LearnPage() {
  const isMobile = useIsMobile();
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [expandedCourse, setExpandedCourse] = useState<string>('premiers-pas');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  /* Load progress from localStorage */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PROGRESS_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCompletedSteps(parsed.filter((s): s is string => typeof s === 'string'));
        }
      }
    } catch {
      // ignore corrupted data
    }
  }, []);

  /* Save progress to localStorage */
  const saveProgress = useCallback((steps: string[]) => {
    setCompletedSteps(steps);
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(steps));
    } catch {
      // storage full — silent
    }
  }, []);

  /* Toggle step completion */
  const toggleStep = useCallback((stepId: string, courseId: string) => {
    const next = completedSteps.includes(stepId)
      ? completedSteps.filter((s) => s !== stepId)
      : [...completedSteps, stepId];
    saveProgress(next);

    // Check if course just completed
    const course = COURSES.find((c) => c.id === courseId);
    if (course) {
      const allDone = course.steps.every((s) => next.includes(s.id));
      if (allDone && !completedSteps.includes(stepId)) {
        setToastMessage(`🏆 Badge débloqué ! "${course.title}" terminé !`);
        setTimeout(() => setToastMessage(null), 4000);
      }
    }
  }, [completedSteps, saveProgress]);

  const completedCourses = COURSES.filter(
    (c) => !c.locked && c.steps.every((s) => completedSteps.includes(s.id))
  ).length;

  const overallProgress = completedSteps.length;

  return (
    <div style={pageContainer(isMobile)}>
      {/* Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          background: CU.accent,
          color: '#fff',
          padding: '12px 20px',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          animation: 'fadeIn 0.2s ease',
        }}>
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div style={headerRow()}>
        <span style={{ fontSize: 22 }}>🎓</span>
        <h1 style={CU.pageTitle}>Formation</h1>
      </div>
      <p style={{ ...CU.pageSubtitle, marginBottom: 20 }}>
        Apprenez à utiliser Freenzy en quelques minutes
      </p>

      {/* Overall progress */}
      <div style={{
        ...CU.card,
        marginBottom: 24,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: 16,
      } as CSSProperties}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: CU.text, margin: '0 0 4px' }}>
            Votre progression
          </p>
          <p style={{ fontSize: 12, color: CU.textMuted, margin: 0 }}>
            {completedCourses}/{COURSES.length} cours · {overallProgress}/{TOTAL_STEPS} étapes complétées
          </p>
        </div>
        <div style={{
          width: isMobile ? '100%' : 280,
          height: 8,
          background: CU.bgSecondary,
          borderRadius: 4,
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${TOTAL_STEPS > 0 ? (overallProgress / TOTAL_STEPS) * 100 : 0}%`,
            height: '100%',
            background: CU.success,
            borderRadius: 4,
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Courses list */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
        gap: 12,
      }}>
        {COURSES.map((course) => {
          const isExpanded = expandedCourse === course.id && !course.locked;
          const courseCompleted = course.steps.every((s) => completedSteps.includes(s.id));
          const courseProgress = course.steps.filter((s) => completedSteps.includes(s.id)).length;

          return (
            <div
              key={course.id}
              style={{
                ...CU.card,
                opacity: course.locked ? 0.55 : 1,
                position: 'relative',
                gridColumn: isExpanded && !isMobile ? '1 / -1' : undefined,
              } as CSSProperties}
            >
              {/* Locked overlay */}
              {course.locked && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255,255,255,0.6)',
                  borderRadius: 8,
                  zIndex: 2,
                  fontSize: 13,
                  fontWeight: 600,
                  color: CU.textMuted,
                }}>
                  🔒 Bientôt disponible
                </div>
              )}

              {/* Course header (clickable) */}
              <div
                onClick={() => {
                  if (!course.locked) {
                    setExpandedCourse(isExpanded ? '' : course.id);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: course.locked ? 'default' : 'pointer',
                }}
              >
                <span style={{ fontSize: 24 }}>{course.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: CU.text, margin: 0 }}>
                      {course.title}
                    </h3>
                    {course.badge && (
                      <span style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: course.badge === 'Nouveau' ? CU.success : CU.textMuted,
                        background: course.badge === 'Nouveau' ? `${CU.success}15` : CU.bgSecondary,
                        padding: '2px 8px',
                        borderRadius: 4,
                      }}>
                        {course.badge}
                      </span>
                    )}
                    {courseCompleted && !course.locked && (
                      <span style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: CU.success,
                        background: `${CU.success}15`,
                        padding: '2px 8px',
                        borderRadius: 4,
                      }}>
                        Terminé
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: CU.textMuted, margin: '4px 0 0' }}>
                    {course.steps.length} étapes
                    {!course.locked && ` · ${courseProgress}/${course.steps.length} complétées`}
                  </p>
                </div>
                {!course.locked && (
                  <span style={{
                    fontSize: 16,
                    color: CU.textMuted,
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}>
                    ▼
                  </span>
                )}
              </div>

              {/* Course progress bar */}
              {!course.locked && (
                <div style={{
                  width: '100%',
                  height: 4,
                  background: CU.bgSecondary,
                  borderRadius: 2,
                  marginTop: 10,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${(courseProgress / course.steps.length) * 100}%`,
                    height: '100%',
                    background: courseCompleted ? CU.success : CU.accent,
                    borderRadius: 2,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              )}

              {/* Expanded steps */}
              {isExpanded && (
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {course.steps.map((step, idx) => {
                    const isDone = completedSteps.includes(step.id);
                    return (
                      <div
                        key={step.id}
                        style={{
                          display: 'flex',
                          gap: 12,
                          padding: '12px 14px',
                          background: isDone ? `${CU.success}08` : CU.bgSecondary,
                          borderRadius: 6,
                          border: `1px solid ${isDone ? `${CU.success}30` : CU.border}`,
                        }}
                      >
                        {/* Step number / check */}
                        <button
                          onClick={() => toggleStep(step.id, course.id)}
                          style={{
                            width: 28,
                            height: 28,
                            minWidth: 28,
                            borderRadius: '50%',
                            border: isDone ? 'none' : `2px solid ${CU.border}`,
                            background: isDone ? CU.success : '#fff',
                            color: isDone ? '#fff' : CU.textMuted,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s',
                            marginTop: 2,
                          }}
                        >
                          {isDone ? '✓' : idx + 1}
                        </button>

                        {/* Step content */}
                        <div style={{ flex: 1 }}>
                          <p style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: isDone ? CU.success : CU.text,
                            margin: 0,
                            textDecoration: isDone ? 'line-through' : 'none',
                          }}>
                            {step.title}
                          </p>
                          <p style={{
                            fontSize: 12,
                            color: CU.textMuted,
                            margin: '4px 0 0',
                            lineHeight: 1.5,
                          }}>
                            {step.description}
                          </p>
                        </div>

                        {/* Action button */}
                        {!isDone && (
                          <a
                            href={step.link}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              alignSelf: 'center',
                              height: 28,
                              padding: '0 10px',
                              fontSize: 12,
                              fontWeight: 500,
                              color: '#fff',
                              background: CU.accent,
                              border: 'none',
                              borderRadius: 6,
                              textDecoration: 'none',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            Commencer →
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div style={{
        textAlign: 'center',
        padding: '32px 16px',
        marginTop: 24,
        background: CU.bgSecondary,
        borderRadius: 8,
        border: `1px solid ${CU.border}`,
      }}>
        <p style={{ fontSize: 14, color: CU.text, margin: '0 0 8px' }}>
          💡 Suggestion de cours ?
        </p>
        <a
          href="mailto:support@freenzy.io"
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: CU.textSecondary,
            textDecoration: 'underline',
          }}
        >
          Écrivez-nous
        </a>
      </div>
    </div>
  );
}
