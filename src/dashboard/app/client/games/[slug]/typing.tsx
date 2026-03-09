'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { recordGameScore } from '@/lib/games-engine';

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
  const [wordsTyped, setWordsTyped] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
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
    setWordsTyped(0);
    setTotalChars(0);
    setCorrectChars(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => { reset(); }, [reset]);

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
      const wpm = wordsTyped;
      const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;
      const score = Math.round(wpm * (accuracy / 100));
      recordGameScore('typing', score);
    }
  }, [finished, wordsTyped, totalChars, correctChars]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (finished) return;
    if (!started) setStarted(true);
    const val = e.target.value;
    setInput(val);

    // Check if sentence completed
    if (val === sentence) {
      const words = sentence.split(' ').length;
      setWordsTyped((w) => w + words);
      setTotalChars((t) => t + sentence.length);
      setCorrectChars((c) => c + sentence.length);
      setInput('');
      const newIdx = sentenceIndex + 1;
      setSentenceIndex(newIdx);
      setSentence(pickSentence(newIdx));
    }
  };

  const wpm = wordsTyped;
  const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
  const score = Math.round(wpm * (accuracy / 100));

  return (
    <div style={{ maxWidth: 650, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 18px', textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: timer <= 10 ? '#ef4444' : '#fff' }}>{timer}s</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Temps</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 18px', textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#06b6d4' }}>{wpm}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Mots/min</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 18px', textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#22c55e' }}>{accuracy}%</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Précision</div>
        </div>
      </div>

      {/* Sentence display */}
      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 14,
          padding: '24px 20px',
          minHeight: 80,
          lineHeight: 1.8,
          fontSize: 18,
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
                borderBottom: i === input.length ? '2px solid #8b5cf6' : 'none',
                transition: 'color 0.1s',
              }}
            >
              {char}
            </span>
          );
        })}
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        value={input}
        onChange={handleChange}
        disabled={finished}
        autoFocus
        placeholder={started ? '' : 'Commencez à taper...'}
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10,
          padding: '14px 16px',
          color: '#fff',
          fontSize: 16,
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = '#8b5cf6')}
        onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
      />

      {finished && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#06b6d4', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
            Score : {score}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 16 }}>
            {wpm} mots/min — {accuracy}% de précision
          </div>
          <button
            onClick={reset}
            style={{
              background: '#8b5cf6',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Recommencer
          </button>
        </div>
      )}
    </div>
  );
}
