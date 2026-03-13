'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { recordGameScore } from '@/lib/games-engine';
import Link from 'next/link';

const SENTENCES = [
  "L'intelligence artificielle transforme notre manière de travailler chaque jour.",
  "Les algorithmes de machine learning apprennent à partir de grandes quantités de données.",
  "Le cloud computing permet aux entreprises de réduire leurs coûts d'infrastructure.",
  "La cybersécurité est devenue un enjeu majeur pour toutes les organisations.",
  "Les applications mobiles ont révolutionné notre quotidien en quelques années.",
  "Le développement agile favorise la collaboration et l'adaptation au changement.",
  "Les bases de données relationnelles stockent les informations de manière structurée.",
  "La blockchain offre une transparence et une traçabilité sans précédent.",
  "Les interfaces utilisateur doivent être intuitives et accessibles à tous.",
  "Le traitement du langage naturel permet aux machines de comprendre le texte humain.",
  "Les réseaux de neurones artificiels imitent le fonctionnement du cerveau humain.",
  "La réalité augmentée superpose des éléments virtuels au monde réel.",
  "Le big data permet d'extraire des informations précieuses de volumes massifs.",
  "Les microservices facilitent le déploiement et la maintenance des applications.",
  "L'automatisation des processus libère du temps pour les tâches créatives.",
  "La transformation numérique touche tous les secteurs de l'économie moderne.",
  "Les objets connectés collectent des données en temps réel dans notre environnement.",
  "Le design thinking place l'utilisateur au centre du processus de création.",
  "Les conteneurs Docker simplifient le déploiement des applications dans le cloud.",
  "La science des données combine statistiques et informatique pour résoudre des problèmes.",
];

export default function TypingGame() {
  const [sentence, setSentence] = useState('');
  const [input, setInput] = useState('');
  const [timer, setTimer] = useState(60);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [totalChars, setTotalChars] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shuffledRef = useRef<string[]>([]);

  const pickSentence = useCallback((idx: number) => {
    if (shuffledRef.current.length === 0) {
      shuffledRef.current = [...SENTENCES].sort(() => Math.random() - 0.5);
    }
    return shuffledRef.current[idx % shuffledRef.current.length];
  }, []);

  const reset = useCallback(() => {
    shuffledRef.current = [...SENTENCES].sort(() => Math.random() - 0.5);
    setSentence(shuffledRef.current[0]);
    setSentenceIndex(0);
    setInput('');
    setTimer(60);
    setStarted(false);
    setFinished(false);
    setTotalChars(0);
    setCorrectChars(0);
    if (timerRef.current) clearInterval(timerRef.current);
    if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
    // Auto-focus input after reset
    focusTimerRef.current = setTimeout(() => { inputRef.current?.focus(); focusTimerRef.current = null; }, 100);
  }, []);

  useEffect(() => { reset(); }, [reset]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!started || finished) return;
    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          setFinished(true);
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, finished]);

  useEffect(() => {
    if (finished) {
      // WPM = (correctChars / 5) / (elapsed minutes)
      const elapsed = 60; // full 60s test
      const wpm = Math.round((correctChars / 5) / (elapsed / 60));
      const acc = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;
      const s = Math.round(wpm * (acc / 100));
      recordGameScore('typing', s);
    }
  }, [finished, totalChars, correctChars]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (finished) return;
    if (!started) setStarted(true);
    const val = e.target.value;
    const prevLen = input.length;
    setInput(val);

    // Track per-character accuracy on new characters typed
    if (val.length > prevLen) {
      const newCharIdx = val.length - 1;
      setTotalChars((t) => t + 1);
      if (newCharIdx < sentence.length && val[newCharIdx] === sentence[newCharIdx]) {
        setCorrectChars((c) => c + 1);
      }
    }

    // Check if sentence completed
    if (val === sentence) {
      setInput('');
      const newIdx = sentenceIndex + 1;
      setSentenceIndex(newIdx);
      setSentence(pickSentence(newIdx));
      inputRef.current?.focus();
    }
  };

  const elapsed = 60 - timer;
  // WPM formula: (correctChars / 5) / (elapsedSeconds / 60)
  const wpm = elapsed > 0 ? Math.round((correctChars / 5) / (elapsed / 60)) : 0;
  const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
  const finalWpm = finished ? Math.round((correctChars / 5) / (60 / 60)) : wpm;
  const score = Math.round(finalWpm * (accuracy / 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%', maxWidth: 650, margin: '0 auto', padding: '0 16px', boxSizing: 'border-box' }}>
      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px 16px', textAlign: 'center', minWidth: 70 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: timer <= 10 ? '#ef4444' : '#fff' }}>{timer}s</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Temps</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px 16px', textAlign: 'center', minWidth: 70 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#06b6d4' }}>{wpm}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Mots/min</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px 16px', textAlign: 'center', minWidth: 70 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#22c55e' }}>{accuracy}%</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Précision</div>
        </div>
      </div>

      {/* Sentence display — full width, responsive text */}
      <div
        style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 14,
          padding: '20px 16px',
          minHeight: 80,
          lineHeight: 1.8,
          fontSize: 'min(4.5vw, 18px)',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {sentence.split('').map((char, i) => {
          let color = 'rgba(255,255,255,0.35)';
          if (i < input.length) {
            color = input[i] === char ? '#22c55e' : '#ef4444';
          }
          return (
            <span
              key={i}
              style={{
                color,
                borderBottom: i === input.length ? '2px solid var(--accent)' : 'none',
                transition: 'color 0.1s',
                background: i < input.length && input[i] !== char ? 'rgba(239,68,68,0.15)' : 'transparent',
              }}
            >
              {char}
            </span>
          );
        })}
      </div>

      {/* Input — full width, visible above virtual keyboard */}
      <input
        ref={inputRef}
        value={input}
        onChange={handleChange}
        disabled={finished}
        autoFocus
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        placeholder={started ? '' : 'Commencez à taper...'}
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10,
          padding: '14px 16px',
          color: '#fff',
          fontSize: 16,
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent)';
          // Scroll input into view on mobile to stay above virtual keyboard
          setTimeout(() => e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
        }}
        onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
      />

      {finished && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#06b6d4', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
            Score : {score}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 20 }}>
            {finalWpm} mots/min — {accuracy}% de précision
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={reset}
              style={{
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '12px 28px',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Rejouer
            </button>
            <Link
              href="/client/games"
              style={{
                color: 'rgba(255,255,255,0.5)',
                textDecoration: 'none',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span style={{ fontSize: 16 }}>←</span>
              Arcade
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
