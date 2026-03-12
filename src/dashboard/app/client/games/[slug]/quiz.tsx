'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { recordGameScore } from '@/lib/games-engine';

interface Question {
  q: string;
  choices: string[];
  answer: number; // index
}

const QUESTIONS: Question[] = [
  { q: "Quel modèle d'IA a été créé par OpenAI en 2022 ?", choices: ['GPT-4', 'ChatGPT', 'DALL-E 3', 'Claude'], answer: 1 },
  { q: "Que signifie 'LLM' en intelligence artificielle ?", choices: ['Large Language Model', 'Linear Logic Machine', 'Low Latency Module', 'Learned Linguistic Method'], answer: 0 },
  { q: "Quelle entreprise a créé Claude ?", choices: ['Google', 'OpenAI', 'Anthropic', 'Meta'], answer: 2 },
  { q: "En quelle année le Transformer a-t-il été présenté ?", choices: ['2015', '2017', '2019', '2020'], answer: 1 },
  { q: "Que signifie GPU ?", choices: ['General Processing Unit', 'Graphics Processing Unit', 'Global Power Unit', 'Graphical Pixel Utility'], answer: 1 },
  { q: "Quel langage est le plus utilisé en IA/ML ?", choices: ['Java', 'C++', 'Python', 'JavaScript'], answer: 2 },
  { q: "Qu'est-ce que le 'fine-tuning' ?", choices: ['Entraîner un modèle de zéro', 'Adapter un modèle pré-entraîné', 'Compresser un modèle', 'Évaluer un modèle'], answer: 1 },
  { q: "Quel est le test historique de l'IA proposé par Alan Turing ?", choices: ['Test de Turing', 'Test de Babbage', 'Test de Lovelace', 'Test de Shannon'], answer: 0 },
  { q: "Que signifie 'API' ?", choices: ['Advanced Programming Interface', 'Application Programming Interface', 'Automated Protocol Integration', 'Abstract Process Instruction'], answer: 1 },
  { q: "Quel réseau de neurones est spécialisé dans les images ?", choices: ['RNN', 'CNN', 'GAN', 'LSTM'], answer: 1 },
  { q: "Qu'est-ce que le 'prompt engineering' ?", choices: ['Concevoir des circuits', 'Optimiser les requêtes IA', 'Programmer des robots', 'Analyser des données'], answer: 1 },
  { q: "Quel format de données est standard pour les API web ?", choices: ['XML', 'CSV', 'JSON', 'YAML'], answer: 2 },
  { q: "Que signifie 'SaaS' ?", choices: ['Software as a Service', 'System and Application Suite', 'Secure Access as Standard', 'Storage and Analytics System'], answer: 0 },
  { q: "Quel framework JavaScript est développé par Meta ?", choices: ['Angular', 'Vue.js', 'React', 'Svelte'], answer: 2 },
  { q: "Qu'est-ce que le 'cloud computing' ?", choices: ['Calcul météorologique', 'Stockage local', 'Services informatiques à distance', 'Réseau privé'], answer: 2 },
  { q: "Quel algorithme est utilisé pour les recommandations ?", choices: ['Tri rapide', 'Filtrage collaboratif', 'Recherche binaire', 'Dijkstra'], answer: 1 },
  { q: "Que signifie 'ROI' en business ?", choices: ['Rate of Innovation', 'Return on Investment', 'Risk of Implementation', 'Revenue of Integration'], answer: 1 },
  { q: "Quelle base de données est NoSQL ?", choices: ['PostgreSQL', 'MySQL', 'MongoDB', 'Oracle'], answer: 2 },
  { q: "Qu'est-ce que le 'machine learning supervisé' ?", choices: ['Apprentissage sans données', 'Apprentissage avec données étiquetées', 'Apprentissage par renforcement', 'Apprentissage non supervisé'], answer: 1 },
  { q: "Quel outil est utilisé pour le versionnage de code ?", choices: ['Docker', 'Git', 'Kubernetes', 'Jenkins'], answer: 1 },
  { q: "Que signifie 'NLP' ?", choices: ['Network Layer Protocol', 'Natural Language Processing', 'Neural Logic Programming', 'Node Level Permission'], answer: 1 },
  { q: "Quelle entreprise possède Azure ?", choices: ['Amazon', 'Google', 'Microsoft', 'IBM'], answer: 2 },
  { q: "Qu'est-ce qu'un 'token' en LLM ?", choices: ['Un mot entier', 'Une unité de texte', 'Une phrase', 'Un paragraphe'], answer: 1 },
  { q: "Quel est le rôle d'un 'data scientist' ?", choices: ['Gérer les serveurs', 'Analyser les données', 'Dessiner des interfaces', 'Tester le logiciel'], answer: 1 },
  { q: "Que signifie 'UX' ?", choices: ['Universal Exchange', 'User Experience', 'Unified Extension', 'Ultra X-ray'], answer: 1 },
  { q: "Quel protocole sécurise les sites web ?", choices: ['HTTP', 'FTP', 'HTTPS', 'SMTP'], answer: 2 },
  { q: "Qu'est-ce que Docker ?", choices: ['Un langage de programmation', 'Un outil de conteneurisation', 'Un framework web', 'Un éditeur de code'], answer: 1 },
  { q: "Que signifie 'B2B' ?", choices: ['Back to Business', 'Business to Business', 'Browser to Browser', 'Build to Build'], answer: 1 },
  { q: "Quel modèle génère des images depuis du texte ?", choices: ['GPT', 'BERT', 'DALL-E', 'LSTM'], answer: 2 },
  { q: "Qu'est-ce que l'AGI ?", choices: ['Automated General Interface', 'Artificial General Intelligence', 'Advanced Graphics Integration', 'Adaptive Growth Index'], answer: 1 },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizGame() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [timer, setTimer] = useState(15);
  const [gameOver, setGameOver] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const correctRef = useRef(0);
  const totalTimeRef = useRef(0);
  const transitionRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = useCallback(() => {
    if (transitionRef.current) clearTimeout(transitionRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    setQuestions(shuffle(QUESTIONS).slice(0, 15));
    setCurrent(0);
    setSelected(null);
    setCorrect(0);
    setTimer(15);
    setGameOver(false);
    setShowResult(false);
    setTotalTime(0);
    correctRef.current = 0;
    totalTimeRef.current = 0;
  }, []);

  useEffect(() => { reset(); }, [reset]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (transitionRef.current) clearTimeout(transitionRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const nextQuestion = useCallback(() => {
    if (current + 1 >= questions.length) {
      setGameOver(true);
      const speedBonus = Math.max(0, 150 - totalTimeRef.current);
      const score = correctRef.current * 100 + speedBonus;
      recordGameScore('quiz', score);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setShowResult(false);
      setTimer(15);
    }
    transitionRef.current = null;
  }, [current, questions.length]);

  useEffect(() => {
    if (gameOver || showResult) return;
    if (timer <= 0) {
      // Time's up
      setShowResult(true);
      if (!transitionRef.current) {
        transitionRef.current = setTimeout(() => nextQuestion(), 1500);
      }
      return;
    }
    timerRef.current = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timer, gameOver, showResult, nextQuestion]);

  const handleAnswer = (idx: number) => {
    if (showResult || gameOver) return;
    setSelected(idx);
    setShowResult(true);
    const timeSpent = 15 - timer;
    totalTimeRef.current += timeSpent;
    setTotalTime(totalTimeRef.current);
    if (idx === questions[current]?.answer) {
      correctRef.current += 1;
      setCorrect(correctRef.current);
    }
    // Schedule transition only if timer hasn't already scheduled one
    if (!transitionRef.current) {
      transitionRef.current = setTimeout(() => nextQuestion(), 1500);
    }
  };

  if (questions.length === 0) return null;

  const q = questions[current];

  if (gameOver) {
    const speedBonus = Math.max(0, 150 - totalTimeRef.current);
    const score = correctRef.current * 100 + speedBonus;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%', maxWidth: 500, margin: '0 auto', padding: '0 16px', boxSizing: 'border-box' }}>
        🏆
        <h2 style={{ color: '#fff', margin: 0 }}>Quiz terminé !</h2>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
          {correct}/{questions.length} bonnes réponses
        </div>
        <div style={{ color: '#f59e0b', fontSize: 24, fontWeight: 700 }}>Score : {score}</div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
          Bonus vitesse : +{speedBonus}
        </div>
        <button
          onClick={reset}
          style={{
            background: '#7c3aed',
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
          style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}
        >
          ←
          Arcade
        </Link>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: 600, margin: '0 auto', padding: '0 16px', boxSizing: 'border-box' }}>
      {/* Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
          Question {current + 1}/{questions.length}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
          Correct : {correct}
        </div>
        <div
          style={{
            color: timer <= 5 ? '#ef4444' : 'rgba(255,255,255,0.5)',
            fontSize: 13,
            fontWeight: timer <= 5 ? 700 : 400,
          }}
        >
          {timer}s
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginBottom: 24 }}>
        <div
          style={{
            height: '100%',
            width: `${((current + 1) / questions.length) * 100}%`,
            background: '#f59e0b',
            borderRadius: 2,
            transition: 'width 0.3s',
          }}
        />
      </div>

      {/* Question */}
      <div
        style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 14,
          padding: '24px 20px',
          marginBottom: 16,
        }}
      >
        <p style={{ color: '#fff', fontSize: 16, fontWeight: 600, margin: 0, lineHeight: 1.5 }}>
          {q?.q}
        </p>
      </div>

      {/* Choices */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {q?.choices.map((choice, idx) => {
          let bg = 'rgba(255,255,255,0.05)';
          let border = 'rgba(255,255,255,0.08)';
          if (showResult) {
            if (idx === q.answer) { bg = 'rgba(34,197,94,0.15)'; border = '#22c55e'; }
            else if (idx === selected && idx !== q.answer) { bg = 'rgba(239,68,68,0.15)'; border = '#ef4444'; }
          }
          return (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              style={{
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: 10,
                padding: '14px 16px',
                minHeight: 48,
                color: '#fff',
                fontSize: 14,
                textAlign: 'left',
                cursor: showResult ? 'default' : 'pointer',
                transition: 'background 0.2s, border-color 0.2s',
              }}
            >
              <span style={{ color: 'rgba(255,255,255,0.35)', marginRight: 10, fontWeight: 600 }}>
                {String.fromCharCode(65 + idx)}.
              </span>
              {choice}
            </button>
          );
        })}
      </div>
    </div>
  );
}
