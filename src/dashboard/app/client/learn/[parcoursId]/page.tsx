'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useIsMobile } from '@/lib/use-media-query';
import {
  getParcoursById,
  calculateLevel,
  generateDiplomaPDF,
  type FormationParcours,
  type FormationModule,
  type FormationLesson,
  type QuizQuestion,
} from '@/lib/formations';

// ---------------------------------------------------------------------------
// Progress types + persistence
// ---------------------------------------------------------------------------

interface LearnProgress {
  completedModules: string[];
  completedParcours: string[];
  quizScores: Record<string, number>;
  totalXP: number;
  streak: number;
  lastActivity: string;
}

const STORAGE_KEY = 'fz_learn_progress';

function loadProgress(): LearnProgress {
  if (typeof window === 'undefined')
    return { completedModules: [], completedParcours: [], quizScores: {}, totalXP: 0, streak: 0, lastActivity: '' };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { completedModules: [], completedParcours: [], quizScores: {}, totalXP: 0, streak: 0, lastActivity: '' };
}

function saveProgress(p: LearnProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch { /* ignore */ }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getLessonXP(lesson: FormationLesson): number {
  // formation-data-more.ts uses `xp` instead of `xpReward` in some places
  const raw = lesson as unknown as Record<string, unknown>;
  return lesson.xpReward || (raw['xp'] as number) || 10;
}

function getModuleXP(mod: FormationModule): number {
  const raw = mod as unknown as Record<string, unknown>;
  return mod.xpReward || (raw['xp'] as number) || 0;
}

function getQuizQuestions(lesson: FormationLesson): QuizQuestion[] {
  // formation-data-more.ts uses `questions` instead of `quizQuestions`
  const raw = lesson as unknown as Record<string, unknown>;
  return lesson.quizQuestions || (raw['questions'] as QuizQuestion[]) || [];
}

function getModulePassingScore(mod: FormationModule): number {
  return mod.passingScore ?? 60;
}

function levelBadgeStyle(level: FormationParcours['level']): React.CSSProperties {
  const map: Record<string, { bg: string; color: string }> = {
    debutant: { bg: '#DCFCE7', color: '#16A34A' },
    intermediaire: { bg: '#FEF3C7', color: '#D97706' },
    avance: { bg: '#FEE2E2', color: '#DC2626' },
    expert: { bg: '#F3E8FF', color: '#7C3AED' },
  };
  const c = map[level] || map.debutant;
  return {
    display: 'inline-block', fontSize: 11, fontWeight: 600,
    padding: '2px 8px', borderRadius: 99, backgroundColor: c.bg, color: c.color,
  };
}

// ---------------------------------------------------------------------------
// Simple markdown renderer
// ---------------------------------------------------------------------------

function renderMarkdown(text: string): React.ReactNode[] {
  const paragraphs = text.split('\n\n');
  return paragraphs.map((para, i) => {
    const trimmed = para.trim();
    if (!trimmed) return null;

    // Headers
    if (trimmed.startsWith('### '))
      return <h4 key={i} style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', margin: '12px 0 4px' }}>{trimmed.slice(4)}</h4>;
    if (trimmed.startsWith('## '))
      return <h3 key={i} style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', margin: '14px 0 6px' }}>{trimmed.slice(3)}</h3>;
    if (trimmed.startsWith('# '))
      return <h2 key={i} style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', margin: '16px 0 8px' }}>{trimmed.slice(2)}</h2>;

    // Bold inline
    const parts = trimmed.split(/\*\*(.*?)\*\*/g);
    const rendered = parts.map((part, j) =>
      j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part}</span>
    );

    return <p key={i} style={{ fontSize: 13, color: '#1A1A1A', lineHeight: '1.6', margin: '8px 0' }}>{rendered}</p>;
  });
}

// ---------------------------------------------------------------------------
// XP Animation component
// ---------------------------------------------------------------------------

function XPFloater({ amount, onDone }: { amount: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed', top: '40%', left: '50%', transform: 'translateX(-50%)',
      fontSize: 24, fontWeight: 800, color: '#16A34A', zIndex: 9999,
      animation: 'xpFloat 1.5s ease-out forwards',
      pointerEvents: 'none',
    }}>
      +{amount} XP
      <style>{`
        @keyframes xpFloat {
          0% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-80px); }
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Confetti
// ---------------------------------------------------------------------------

function Confetti() {
  const colors = ['#DC2626', '#16A34A', '#2563EB', '#D97706', '#7C3AED', '#EC4899', '#0EA5E9', '#F59E0B'];
  const dots = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: colors[i % colors.length],
    size: 6 + Math.random() * 6,
  }));

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9998, overflow: 'hidden' }}>
      {dots.map((d) => (
        <div
          key={d.id}
          style={{
            position: 'absolute',
            left: `${d.left}%`,
            top: -20,
            width: d.size,
            height: d.size,
            borderRadius: '50%',
            backgroundColor: d.color,
            animation: `confettiFall 3s ${d.delay}s ease-in forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quiz component
// ---------------------------------------------------------------------------

function QuizPlayer({
  questions,
  passingScore,
  lessonId,
  onComplete,
}: {
  questions: QuizQuestion[];
  passingScore: number;
  lessonId: string;
  onComplete: (score: number, passed: boolean) => void;
}) {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const isMobile = useIsMobile();

  if (questions.length === 0) return <div style={{ color: '#9B9B9B', fontSize: 13 }}>Aucune question disponible.</div>;

  const q = questions[qIdx];
  const isLast = qIdx === questions.length - 1;
  const scorePercent = Math.round((correct / questions.length) * 100);
  const passed = scorePercent >= passingScore;

  if (finished) {
    return (
      <div style={{ textAlign: 'center', padding: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: passed ? '#16A34A' : '#DC2626', marginBottom: 8 }}>
          Score : {correct}/{questions.length} ({scorePercent}%)
        </div>
        <div style={{ fontSize: 14, color: '#6B6B6B', marginBottom: 12 }}>
          {passed ? '🎉 Bravo, quiz réussi !' : `❌ Il faut ${passingScore}% pour valider. Réessayez !`}
        </div>
        {passed ? (
          <button
            onClick={() => onComplete(scorePercent, true)}
            style={{
              padding: '10px 24px', fontSize: 13, fontWeight: 600, borderRadius: 8,
              backgroundColor: '#16A34A', color: '#FFF', border: 'none', cursor: 'pointer',
            }}
          >
            Valider ✓
          </button>
        ) : (
          <button
            onClick={() => { setQIdx(0); setSelected(null); setCorrect(0); setFinished(false); }}
            style={{
              padding: '10px 24px', fontSize: 13, fontWeight: 600, borderRadius: 8,
              backgroundColor: '#1A1A1A', color: '#FFF', border: 'none', cursor: 'pointer',
            }}
          >
            Réessayer
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 11, color: '#9B9B9B', marginBottom: 6 }}>Question {qIdx + 1}/{questions.length}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', marginBottom: 12 }}>{q.question}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {q.options.map((opt, idx) => {
          let bg = '#FFFFFF';
          let borderColor = '#E5E5E5';
          let textColor = '#1A1A1A';
          if (selected !== null) {
            if (idx === q.correctIndex) { bg = '#DCFCE7'; borderColor = '#16A34A'; textColor = '#16A34A'; }
            else if (idx === selected && idx !== q.correctIndex) { bg = '#FEE2E2'; borderColor = '#DC2626'; textColor = '#DC2626'; }
          }
          return (
            <button
              key={idx}
              disabled={selected !== null}
              onClick={() => {
                setSelected(idx);
                if (idx === q.correctIndex) setCorrect((c) => c + 1);
              }}
              style={{
                minHeight: 44,
                padding: '10px 14px',
                fontSize: 13,
                textAlign: 'left',
                border: `1px solid ${borderColor}`,
                borderRadius: 8,
                backgroundColor: bg,
                color: textColor,
                cursor: selected !== null ? 'default' : 'pointer',
                width: isMobile ? '100%' : undefined,
                transition: 'all 0.15s',
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {selected !== null && q.explanation && (
        <div style={{ marginTop: 10, padding: 10, backgroundColor: '#FAFAFA', borderRadius: 8, fontSize: 12, color: '#6B6B6B', borderLeft: '3px solid #E5E5E5' }}>
          {q.explanation}
        </div>
      )}
      {selected !== null && (
        <button
          onClick={() => {
            if (isLast) {
              setFinished(true);
            } else {
              setQIdx((i) => i + 1);
              setSelected(null);
            }
          }}
          style={{
            marginTop: 12, padding: '8px 20px', fontSize: 13, fontWeight: 600,
            borderRadius: 8, backgroundColor: '#1A1A1A', color: '#FFF', border: 'none', cursor: 'pointer',
          }}
        >
          {isLast ? 'Voir le résultat' : 'Suivant →'}
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Game components
// ---------------------------------------------------------------------------

function MatchingGame({ data, onComplete }: { data: Record<string, unknown>; onComplete: (score: number) => void }) {
  const pairs = (data.pairs || []) as { left: string; right: string }[];
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const shuffledRight = useMemo(() => {
    const arr = pairs.map((p, i) => ({ text: p.right, originalIdx: i }));
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleRightClick(originalIdx: number) {
    if (selectedLeft === null) return;
    if (selectedLeft === originalIdx) {
      setMatched((prev) => new Set([...prev, originalIdx]));
      setSelectedLeft(null);
      if (matched.size + 1 === pairs.length) {
        onComplete(100);
      }
    } else {
      setSelectedLeft(null);
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {pairs.map((p, i) => (
          <button
            key={i}
            disabled={matched.has(i)}
            onClick={() => setSelectedLeft(i)}
            style={{
              padding: '8px 12px', fontSize: 12, borderRadius: 6,
              border: `1px solid ${selectedLeft === i ? '#1A1A1A' : '#E5E5E5'}`,
              backgroundColor: matched.has(i) ? '#DCFCE7' : selectedLeft === i ? '#F0F0F0' : '#FFF',
              cursor: matched.has(i) ? 'default' : 'pointer', textAlign: 'left',
              opacity: matched.has(i) ? 0.6 : 1,
            }}
          >
            {p.left}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {shuffledRight.map((item, i) => (
          <button
            key={i}
            disabled={matched.has(item.originalIdx)}
            onClick={() => handleRightClick(item.originalIdx)}
            style={{
              padding: '8px 12px', fontSize: 12, borderRadius: 6,
              border: '1px solid #E5E5E5',
              backgroundColor: matched.has(item.originalIdx) ? '#DCFCE7' : '#FFF',
              cursor: matched.has(item.originalIdx) ? 'default' : 'pointer', textAlign: 'left',
              opacity: matched.has(item.originalIdx) ? 0.6 : 1,
            }}
          >
            {item.text}
          </button>
        ))}
      </div>
    </div>
  );
}

function FillBlanksGame({ data, onComplete }: { data: Record<string, unknown>; onComplete: (score: number) => void }) {
  const sentences = (data.sentences || []) as { text: string; answer: string }[];
  const [answers, setAnswers] = useState<string[]>(sentences.map(() => ''));
  const [checked, setChecked] = useState(false);

  function checkAnswers() {
    setChecked(true);
    const correct = sentences.filter((s, i) => answers[i].trim().toLowerCase() === s.answer.toLowerCase()).length;
    const score = Math.round((correct / sentences.length) * 100);
    onComplete(score);
  }

  return (
    <div>
      {sentences.map((s, i) => {
        const isCorrect = checked && answers[i].trim().toLowerCase() === s.answer.toLowerCase();
        const isWrong = checked && !isCorrect;
        return (
          <div key={i} style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: '#1A1A1A' }}>{s.text.replace('[___]', '')}</span>
            <input
              value={answers[i]}
              onChange={(e) => { const a = [...answers]; a[i] = e.target.value; setAnswers(a); }}
              disabled={checked}
              placeholder="___"
              style={{
                marginLeft: 6, padding: '4px 8px', fontSize: 13, borderRadius: 4,
                border: `1px solid ${isCorrect ? '#16A34A' : isWrong ? '#DC2626' : '#E5E5E5'}`,
                backgroundColor: isCorrect ? '#DCFCE7' : isWrong ? '#FEE2E2' : '#FFF',
                width: 120,
              }}
            />
            {isWrong && <span style={{ fontSize: 11, color: '#DC2626', marginLeft: 6 }}>→ {s.answer}</span>}
          </div>
        );
      })}
      {!checked && (
        <button onClick={checkAnswers} style={{
          marginTop: 8, padding: '8px 20px', fontSize: 13, fontWeight: 600,
          borderRadius: 8, backgroundColor: '#1A1A1A', color: '#FFF', border: 'none', cursor: 'pointer',
        }}>
          Valider
        </button>
      )}
    </div>
  );
}

function FlashcardsGame({ data, onComplete }: { data: Record<string, unknown>; onComplete: (score: number) => void }) {
  const cards = (data.cards || []) as { front: string; back: string }[];
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (cards.length === 0) return <div style={{ color: '#9B9B9B' }}>Aucune carte.</div>;

  const isLast = idx === cards.length - 1;

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: '#9B9B9B', marginBottom: 8 }}>Carte {idx + 1}/{cards.length} — cliquez pour retourner</div>
      <div
        onClick={() => setFlipped(!flipped)}
        style={{
          padding: 24, minHeight: 100, borderRadius: 12, border: '1px solid #E5E5E5',
          backgroundColor: flipped ? '#F0FDF4' : '#FAFAFA',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: flipped ? 400 : 600, color: '#1A1A1A',
          transition: 'all 0.2s', maxWidth: 400, margin: '0 auto',
        }}
      >
        {flipped ? cards[idx].back : cards[idx].front}
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
        {idx > 0 && (
          <button onClick={() => { setIdx(idx - 1); setFlipped(false); }} style={{
            padding: '8px 16px', fontSize: 12, borderRadius: 8, border: '1px solid #E5E5E5',
            backgroundColor: '#FFF', cursor: 'pointer', color: '#6B6B6B',
          }}>← Précédent</button>
        )}
        {isLast ? (
          <button onClick={() => onComplete(100)} style={{
            padding: '8px 16px', fontSize: 12, borderRadius: 8, border: 'none',
            backgroundColor: '#16A34A', cursor: 'pointer', color: '#FFF', fontWeight: 600,
          }}>Terminer ✓</button>
        ) : (
          <button onClick={() => { setIdx(idx + 1); setFlipped(false); }} style={{
            padding: '8px 16px', fontSize: 12, borderRadius: 8, border: 'none',
            backgroundColor: '#1A1A1A', cursor: 'pointer', color: '#FFF', fontWeight: 600,
          }}>Suivant →</button>
        )}
      </div>
    </div>
  );
}

function OrderingGame({ data, onComplete }: { data: Record<string, unknown>; onComplete: (score: number) => void }) {
  const correctOrder = (data.items || []) as string[];
  const [items, setItems] = useState<string[]>(() => {
    const arr = [...correctOrder];
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
  });
  const [checked, setChecked] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  function handleClick(idx: number) {
    if (checked) return;
    if (selectedIdx === null) {
      setSelectedIdx(idx);
    } else {
      const newItems = [...items];
      [newItems[selectedIdx], newItems[idx]] = [newItems[idx], newItems[selectedIdx]];
      setItems(newItems);
      setSelectedIdx(null);
    }
  }

  function validate() {
    setChecked(true);
    const correct = items.filter((item, i) => item === correctOrder[i]).length;
    onComplete(Math.round((correct / correctOrder.length) * 100));
  }

  return (
    <div>
      <div style={{ fontSize: 11, color: '#9B9B9B', marginBottom: 8 }}>Cliquez deux éléments pour les intervertir, puis validez.</div>
      {items.map((item, i) => {
        const isCorrect = checked && item === correctOrder[i];
        const isWrong = checked && item !== correctOrder[i];
        return (
          <div
            key={i}
            onClick={() => handleClick(i)}
            style={{
              padding: '8px 12px', marginBottom: 4, borderRadius: 6, fontSize: 13,
              border: `1px solid ${selectedIdx === i ? '#1A1A1A' : isCorrect ? '#16A34A' : isWrong ? '#DC2626' : '#E5E5E5'}`,
              backgroundColor: selectedIdx === i ? '#F0F0F0' : isCorrect ? '#DCFCE7' : isWrong ? '#FEE2E2' : '#FFF',
              cursor: checked ? 'default' : 'pointer', color: '#1A1A1A',
            }}
          >
            {i + 1}. {item}
          </div>
        );
      })}
      {!checked && (
        <button onClick={validate} style={{
          marginTop: 8, padding: '8px 20px', fontSize: 13, fontWeight: 600,
          borderRadius: 8, backgroundColor: '#1A1A1A', color: '#FFF', border: 'none', cursor: 'pointer',
        }}>
          Valider
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lesson renderer
// ---------------------------------------------------------------------------

function LessonRenderer({
  lesson,
  module: mod,
  parcoursColor,
  isCompleted,
  onComplete,
}: {
  lesson: FormationLesson;
  module: FormationModule;
  parcoursColor: string;
  isCompleted: boolean;
  onComplete: (xp: number, quizScore?: number) => void;
}) {
  const xp = getLessonXP(lesson);

  if (isCompleted) {
    return (
      <div style={{ padding: '12px 0 12px 24px', borderLeft: `2px solid ${parcoursColor}`, opacity: 0.6 }}>
        <div style={{ fontSize: 13, color: '#16A34A', fontWeight: 600 }}>✅ {lesson.title} — Complété (+{xp} XP)</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '12px 0 12px 24px', borderLeft: `2px solid ${parcoursColor}` }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 8 }}>{lesson.title}</div>

      {/* TEXT */}
      {lesson.type === 'text' && (
        <div>
          <div style={{ maxHeight: 400, overflowY: 'auto', paddingRight: 8 }}>
            {renderMarkdown(lesson.content)}
          </div>
          <button
            onClick={() => onComplete(xp)}
            style={{
              marginTop: 12, padding: '8px 20px', fontSize: 13, fontWeight: 600,
              borderRadius: 8, backgroundColor: '#1A1A1A', color: '#FFF', border: 'none', cursor: 'pointer',
            }}
          >
            Marquer comme lu ✓
          </button>
        </div>
      )}

      {/* QUIZ */}
      {lesson.type === 'quiz' && (
        <QuizPlayer
          questions={getQuizQuestions(lesson)}
          passingScore={getModulePassingScore(mod)}
          lessonId={lesson.id}
          onComplete={(score, passed) => {
            if (passed) onComplete(xp, score);
          }}
        />
      )}

      {/* EXERCISE */}
      {lesson.type === 'exercise' && (
        <div>
          <div style={{
            padding: 14, borderRadius: 8, backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE',
            fontSize: 13, color: '#1E40AF', lineHeight: '1.5', marginBottom: 12,
          }}>
            {lesson.exercisePrompt || lesson.content}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                // Try to link to a relevant page
                window.open('/client/assistants', '_blank');
              }}
              style={{
                padding: '8px 16px', fontSize: 12, fontWeight: 600, borderRadius: 8,
                border: '1px solid #E5E5E5', backgroundColor: '#FFF', color: '#1A1A1A', cursor: 'pointer',
              }}
            >
              Ouvrir l&apos;assistant →
            </button>
            <button
              onClick={() => onComplete(xp)}
              style={{
                padding: '8px 16px', fontSize: 12, fontWeight: 600, borderRadius: 8,
                border: 'none', backgroundColor: '#1A1A1A', color: '#FFF', cursor: 'pointer',
              }}
            >
              Marquer comme fait ✓
            </button>
          </div>
        </div>
      )}

      {/* GAME */}
      {lesson.type === 'game' && lesson.gameData && (
        <div>
          {lesson.gameType === 'matching' && (
            <MatchingGame data={lesson.gameData} onComplete={(score) => onComplete(xp)} />
          )}
          {lesson.gameType === 'fill-blanks' && (
            <FillBlanksGame data={lesson.gameData} onComplete={(score) => onComplete(xp)} />
          )}
          {lesson.gameType === 'flashcards' && (
            <FlashcardsGame data={lesson.gameData} onComplete={(score) => onComplete(xp)} />
          )}
          {lesson.gameType === 'ordering' && (
            <OrderingGame data={lesson.gameData} onComplete={(score) => onComplete(xp)} />
          )}
        </div>
      )}

      {/* VIDEO */}
      {lesson.type === 'video' && (
        <div style={{
          padding: 24, borderRadius: 12, backgroundColor: '#FAFAFA', border: '1px solid #E5E5E5',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎬</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#9B9B9B' }}>Vidéo bientôt disponible</div>
          <div style={{ fontSize: 12, color: '#9B9B9B', marginTop: 4 }}>▶️ Contenu en cours de production</div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function ParcoursDetailPage() {
  const params = useParams();
  const router = useRouter();
  const isMobile = useIsMobile();
  const parcoursId = String(params?.parcoursId || '');

  const parcours = useMemo(() => getParcoursById(parcoursId), [parcoursId]);

  const [progress, setProgress] = useState<LearnProgress>(loadProgress);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [xpAnimation, setXpAnimation] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiShownRef = useRef(false);

  useEffect(() => {
    const p = loadProgress();
    setProgress(p);
    // Auto-expand first incomplete module
    if (parcours) {
      for (const mod of parcours.modules) {
        if (!p.completedModules.includes(mod.id)) {
          setExpandedModule(mod.id);
          break;
        }
      }
    }
  }, [parcours]);

  const updateProgress = useCallback((updater: (prev: LearnProgress) => LearnProgress) => {
    setProgress((prev) => {
      const next = updater(prev);
      next.lastActivity = new Date().toISOString();
      // Update streak
      const lastDate = prev.lastActivity ? new Date(prev.lastActivity).toDateString() : '';
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (lastDate === today) {
        // same day, keep streak
      } else if (lastDate === yesterday) {
        next.streak = (prev.streak || 0) + 1;
      } else if (lastDate !== today) {
        next.streak = 1;
      }
      saveProgress(next);
      return next;
    });
  }, []);

  const handleLessonComplete = useCallback((lessonId: string, moduleId: string, xp: number, quizScore?: number) => {
    setXpAnimation(xp);
    updateProgress((prev) => {
      const next = { ...prev };
      // Mark lesson as completed (we track by module, but also track lessons)
      if (!next.completedModules.includes(lessonId)) {
        next.completedModules = [...next.completedModules, lessonId];
        next.totalXP = (next.totalXP || 0) + xp;
      }
      if (quizScore !== undefined) {
        next.quizScores = { ...next.quizScores, [lessonId]: quizScore };
      }
      return next;
    });
  }, [updateProgress]);

  const handleModuleComplete = useCallback((moduleId: string) => {
    updateProgress((prev) => {
      const next = { ...prev };
      if (!next.completedModules.includes(moduleId)) {
        next.completedModules = [...next.completedModules, moduleId];
      }
      return next;
    });
  }, [updateProgress]);

  // Check if parcours is complete
  const isParcoursComplete = useMemo(() => {
    if (!parcours) return false;
    return parcours.modules.every((mod) => {
      const allLessons = mod.lessons.every((l) => progress.completedModules.includes(l.id));
      return allLessons;
    });
  }, [parcours, progress.completedModules]);

  // Show confetti when parcours completes
  useEffect(() => {
    if (isParcoursComplete && parcours && !progress.completedParcours.includes(parcours.id) && !confettiShownRef.current) {
      confettiShownRef.current = true;
      setShowConfetti(true);
      updateProgress((prev) => ({
        ...prev,
        completedParcours: [...prev.completedParcours, parcours.id],
      }));
      setTimeout(() => setShowConfetti(false), 3500);
    }
  }, [isParcoursComplete, parcours, progress.completedParcours, updateProgress]);

  // Not found
  if (!parcours) {
    return (
      <div style={{ maxWidth: 600, margin: '60px auto', textAlign: 'center', padding: 20 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>Parcours non trouvé</div>
        <div style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 16 }}>
          Le parcours &quot;{parcoursId}&quot; n&apos;existe pas ou a été supprimé.
        </div>
        <button
          onClick={() => router.push('/client/learn')}
          style={{
            padding: '10px 24px', fontSize: 13, fontWeight: 600, borderRadius: 8,
            backgroundColor: '#1A1A1A', color: '#FFF', border: 'none', cursor: 'pointer',
          }}
        >
          ← Retour aux formations
        </button>
      </div>
    );
  }

  // Module completion check
  function isModuleLocked(modIndex: number): boolean {
    if (modIndex === 0) return false;
    const prevMod = parcours!.modules[modIndex - 1];
    return !prevMod.lessons.every((l) => progress.completedModules.includes(l.id));
  }

  function isModuleCompleted(mod: FormationModule): boolean {
    return mod.lessons.every((l) => progress.completedModules.includes(l.id));
  }

  function getModuleStatus(mod: FormationModule, modIndex: number): 'completed' | 'active' | 'locked' {
    if (isModuleCompleted(mod)) return 'completed';
    if (isModuleLocked(modIndex)) return 'locked';
    return 'active';
  }

  const completedModuleCount = parcours.modules.filter((m) => isModuleCompleted(m)).length;
  const earnedXP = progress.totalXP;
  const level = calculateLevel(earnedXP);

  // Diploma download
  async function downloadDiploma() {
    const userName = (() => {
      try {
        const session = localStorage.getItem('fz_session');
        if (session) {
          const parsed = JSON.parse(session);
          return parsed.name || parsed.email || 'Apprenant';
        }
      } catch { /* ignore */ }
      return 'Apprenant';
    })();

    const avgScore = (() => {
      const scores = parcours!.modules.flatMap((m) =>
        m.lessons.filter((l) => l.type === 'quiz').map((l) => progress.quizScores[l.id] || 0)
      );
      if (scores.length === 0) return 100;
      return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    })();

    try {
      const blob = await generateDiplomaPDF({
        userName,
        parcoursTitle: parcours!.title,
        diplomaTitle: parcours!.diplomaTitle,
        date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
        score: avgScore,
        totalXP: progress.totalXP,
        color: parcours!.color,
        modulesCompleted: parcours!.modules.length,
        totalModules: parcours!.modules.length,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diplome-${parcours!.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Diploma generation failed:', err);
    }
  }

  function shareLinkedIn() {
    const text = encodeURIComponent(
      `Je viens de compléter la formation "${parcours!.title}" sur Freenzy.io ! 🎓\n\n${parcours!.diplomaTitle}\n\n#Freenzy #IA #Formation`
    );
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://freenzy.io')}&summary=${text}`, '_blank');
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: isMobile ? '16px 12px' : '24px 20px' }}>
      {/* Confetti */}
      {showConfetti && <Confetti />}

      {/* XP Animation */}
      {xpAnimation !== null && <XPFloater amount={xpAnimation} onDone={() => setXpAnimation(null)} />}

      {/* HEADER */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => router.push('/client/learn')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, color: '#6B6B6B', padding: 0, marginBottom: 12,
          }}
        >
          ← Formations
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          <span style={{ fontSize: 24 }}>{parcours.emoji}</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A' }}>{parcours.title}</span>
          <span style={levelBadgeStyle(parcours.level)}>{parcours.levelLabel}</span>
        </div>

        {/* Module progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: '#6B6B6B' }}>Module {completedModuleCount}/{parcours.modules.length}</span>
          <div style={{ flex: 1, height: 6, backgroundColor: '#F0F0F0', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              width: `${parcours.modules.length > 0 ? Math.round((completedModuleCount / parcours.modules.length) * 100) : 0}%`,
              height: '100%', backgroundColor: parcours.color, borderRadius: 3, transition: 'width 0.3s',
            }} />
          </div>
        </div>

        <div style={{ fontSize: 12, color: '#9B9B9B' }}>
          {level.emoji} {earnedXP} XP gagnés
        </div>
      </div>

      {/* MODULE LIST */}
      <div style={{ marginBottom: 24 }}>
        {parcours.modules.map((mod, modIdx) => {
          const status = getModuleStatus(mod, modIdx);
          const isExpanded = expandedModule === mod.id;
          const locked = status === 'locked';
          const completed = status === 'completed';
          const completedLessons = mod.lessons.filter((l) => progress.completedModules.includes(l.id)).length;

          return (
            <div key={mod.id} style={{ borderBottom: '1px solid #E5E5E5' }}>
              {/* Module header */}
              <button
                onClick={() => {
                  if (locked) return;
                  setExpandedModule(isExpanded ? null : mod.id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '14px 4px',
                  background: 'none',
                  border: 'none',
                  cursor: locked ? 'default' : 'pointer',
                  opacity: locked ? 0.5 : 1,
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 16, width: 22, textAlign: 'center' }}>
                  {completed ? '✅' : locked ? '🔒' : '🔄'}
                </span>
                <span style={{ fontSize: 15 }}>{mod.emoji}</span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>
                  {mod.title}
                  {!locked && !completed && (
                    <span style={{ fontSize: 11, fontWeight: 400, color: '#9B9B9B', marginLeft: 6 }}>
                      {completedLessons}/{mod.lessons.length}
                    </span>
                  )}
                </span>
                <span style={{ fontSize: 11, color: '#9B9B9B', marginRight: 4 }}>{mod.duration}</span>
                {!locked && <span style={{ fontSize: 12, color: '#9B9B9B' }}>{isExpanded ? '▲' : '▼'}</span>}
              </button>

              {/* Expanded lessons */}
              {isExpanded && !locked && (
                <div style={{ paddingBottom: 12, paddingLeft: isMobile ? 4 : 12, paddingRight: 4 }}>
                  {mod.lessons.map((lesson) => {
                    const lessonDone = progress.completedModules.includes(lesson.id);
                    return (
                      <LessonRenderer
                        key={lesson.id}
                        lesson={lesson}
                        module={mod}
                        parcoursColor={parcours.color}
                        isCompleted={lessonDone}
                        onComplete={(xp, quizScore) => {
                          handleLessonComplete(lesson.id, mod.id, xp, quizScore);
                          // Check if all lessons in this module are now done
                          const othersDone = mod.lessons
                            .filter((l) => l.id !== lesson.id)
                            .every((l) => progress.completedModules.includes(l.id));
                          if (othersDone) {
                            handleModuleComplete(mod.id);
                            // Auto-expand next module
                            const nextMod = parcours.modules[modIdx + 1];
                            if (nextMod) {
                              setTimeout(() => setExpandedModule(nextMod.id), 300);
                            }
                          }
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* COMPLETION SECTION */}
      {(isParcoursComplete || progress.completedParcours.includes(parcours.id)) && (
        <div style={{
          padding: isMobile ? 20 : 28,
          borderRadius: 12,
          border: `2px solid ${parcours.color}`,
          textAlign: 'center',
          marginBottom: 24,
          background: `linear-gradient(135deg, #FFFFFF 0%, ${parcours.color}10 100%)`,
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>Félicitations !</div>
          <div style={{ fontSize: 14, color: '#6B6B6B', marginBottom: 16 }}>
            Vous avez complété &quot;{parcours.title}&quot;
          </div>

          {/* Mini diploma preview */}
          <div style={{
            maxWidth: 320, margin: '0 auto 16px', padding: 16, borderRadius: 8,
            border: '1px solid #E5E5E5', backgroundColor: '#FAFAFA',
          }}>
            <div style={{ fontSize: 10, color: '#9B9B9B', marginBottom: 4 }}>CERTIFICAT DE FORMATION</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: parcours.color }}>{parcours.diplomaTitle}</div>
            <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 4 }}>{parcours.diplomaSubtitle}</div>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={downloadDiploma}
              style={{
                padding: '10px 20px', fontSize: 13, fontWeight: 600, borderRadius: 8,
                backgroundColor: parcours.color, color: '#FFF', border: 'none', cursor: 'pointer',
              }}
            >
              📄 Télécharger mon diplôme
            </button>
            <button
              onClick={shareLinkedIn}
              style={{
                padding: '10px 20px', fontSize: 13, fontWeight: 600, borderRadius: 8,
                backgroundColor: '#0A66C2', color: '#FFF', border: 'none', cursor: 'pointer',
              }}
            >
              🔗 Partager sur LinkedIn
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
