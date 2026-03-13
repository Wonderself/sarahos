'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { CU, pageContainer, headerRow, emojiIcon } from '../../../../lib/page-styles';
import { useIsMobile } from '../../../../lib/use-media-query';
import { PAGE_META } from '../../../../lib/emoji-map';
import PageExplanation from '../../../../components/PageExplanation';
import {
  saveUserGame,
  publishGame,
  generateGameId,
  buildGamePrompt,
  GeneratedQuestion,
  UserGame,
} from '@/lib/user-games';

const SAMPLE_QUESTIONS: Record<string, GeneratedQuestion[]> = {
  quiz: [
    { question: "Quel est le langage de programmation le plus populaire en 2025 ?", choices: ['Python', 'JavaScript', 'Rust', 'Go'], answer: 'Python', difficulty: 1 },
    { question: "Que signifie l'acronyme 'SaaS' ?", choices: ['Software as a Service', 'System as a Standard', 'Secure Application System', 'Storage and Analytics Suite'], answer: 'Software as a Service', difficulty: 1 },
    { question: "Quel framework est utilisé pour le développement mobile cross-platform ?", choices: ['Django', 'React Native', 'Express', 'Laravel'], answer: 'React Native', difficulty: 2 },
    { question: "Qu'est-ce que le 'DevOps' ?", choices: ['Un langage de programmation', 'Une culture alliant développement et opérations', 'Un système d\'exploitation', 'Un type de base de données'], answer: 'Une culture alliant développement et opérations', difficulty: 2 },
    { question: "Quel est le rôle principal d'un CDN ?", choices: ['Compiler du code', 'Distribuer du contenu géographiquement', 'Gérer les bases de données', 'Sécuriser les emails'], answer: 'Distribuer du contenu géographiquement', difficulty: 2 },
    { question: "Que signifie 'API REST' ?", choices: ['Application Protocol Interface', 'Representational State Transfer', 'Remote Execution Service Tool', 'Reliable Endpoint Standard Technology'], answer: 'Representational State Transfer', difficulty: 2 },
    { question: "Quel algorithme est utilisé pour le chiffrement asymétrique ?", choices: ['AES', 'RSA', 'MD5', 'SHA-256'], answer: 'RSA', difficulty: 3 },
    { question: "Qu'est-ce que le 'sharding' en base de données ?", choices: ['La réplication', 'Le partitionnement horizontal', 'La compression', 'L\'indexation'], answer: 'Le partitionnement horizontal', difficulty: 3 },
    { question: "Quel protocole est utilisé pour l'envoi d'emails ?", choices: ['HTTP', 'FTP', 'SMTP', 'SSH'], answer: 'SMTP', difficulty: 1 },
    { question: "Qu'est-ce que le 'garbage collection' ?", choices: ['Le nettoyage de fichiers', 'La gestion automatique de la mémoire', 'La suppression de logs', 'Le tri des données'], answer: 'La gestion automatique de la mémoire', difficulty: 3 },
  ],
  enigma: [
    { question: "Je suis composé de 0 et de 1, je suis le langage des machines. Qui suis-je ?", choices: ['Le binaire', 'L\'hexadécimal', 'L\'ASCII', 'L\'Unicode'], answer: 'Le binaire', difficulty: 1 },
    { question: "Je suis un conteneur léger qui encapsule une application. Qui suis-je ?", choices: ['Une VM', 'Un Docker', 'Un serveur', 'Un cluster'], answer: 'Un Docker', difficulty: 2 },
    { question: "Je suis un arbre mais je n'ai pas de feuilles vertes. Qui suis-je ?", choices: ['Un arbre binaire', 'Un graphe', 'Un tableau', 'Une pile'], answer: 'Un arbre binaire', difficulty: 2 },
    { question: "Je protège les données en transit sur le web. Qui suis-je ?", choices: ['HTTP', 'TLS/SSL', 'DNS', 'TCP'], answer: 'TLS/SSL', difficulty: 2 },
    { question: "Je suis le premier réseau social à atteindre 1 milliard d'utilisateurs. Qui suis-je ?", choices: ['Twitter', 'Facebook', 'MySpace', 'Instagram'], answer: 'Facebook', difficulty: 1 },
    { question: "Je suis un type de mémoire rapide mais volatile. Qui suis-je ?", choices: ['Le SSD', 'La RAM', 'Le disque dur', 'La ROM'], answer: 'La RAM', difficulty: 1 },
    { question: "Je permets de versionner le code source. Qui suis-je ?", choices: ['Docker', 'Git', 'npm', 'Webpack'], answer: 'Git', difficulty: 1 },
    { question: "Je suis un algorithme de tri en O(n log n) en moyenne. Qui suis-je ?", choices: ['Tri à bulles', 'Tri par insertion', 'Quicksort', 'Tri par sélection'], answer: 'Quicksort', difficulty: 3 },
    { question: "Je suis une structure LIFO. Qui suis-je ?", choices: ['Une file', 'Une pile', 'Un arbre', 'Un graphe'], answer: 'Une pile', difficulty: 2 },
    { question: "Je suis le créateur du World Wide Web. Qui suis-je ?", choices: ['Steve Jobs', 'Bill Gates', 'Tim Berners-Lee', 'Linus Torvalds'], answer: 'Tim Berners-Lee', difficulty: 2 },
  ],
  challenge: [
    { question: "Combien de bits dans un octet ?", choices: ['4', '8', '16', '32'], answer: '8', difficulty: 1 },
    { question: "En quelle année a été fondée Apple ?", choices: ['1974', '1976', '1980', '1984'], answer: '1976', difficulty: 2 },
    { question: "Quel est le port par défaut de HTTP ?", choices: ['21', '22', '80', '443'], answer: '80', difficulty: 1 },
    { question: "Combien de couleurs dans le modèle RGB ?", choices: ['2', '3', '4', '16'], answer: '3', difficulty: 1 },
    { question: "Quel est le résultat de 2^10 ?", choices: ['256', '512', '1024', '2048'], answer: '1024', difficulty: 1 },
    { question: "En hexadécimal, que vaut FF ?", choices: ['15', '127', '255', '256'], answer: '255', difficulty: 2 },
    { question: "Quel langage a créé Guido van Rossum ?", choices: ['Java', 'C++', 'Python', 'Ruby'], answer: 'Python', difficulty: 1 },
    { question: "Combien d'adresses IPv4 sont possibles ?", choices: ['4 millions', '4 milliards', '4 trillions', '400 millions'], answer: '4 milliards', difficulty: 3 },
    { question: "Quel est le système de fichiers par défaut de Linux ?", choices: ['NTFS', 'FAT32', 'ext4', 'APFS'], answer: 'ext4', difficulty: 2 },
    { question: "Que signifie 'SQL' ?", choices: ['Structured Query Language', 'Simple Question Logic', 'System Queue Link', 'Standard Quality Level'], answer: 'Structured Query Language', difficulty: 1 },
  ],
};

type GameType = 'quiz' | 'enigma' | 'challenge';

export default function CreateGamePage() {
  const isMobile = useIsMobile();
  const meta = PAGE_META['games-create'];
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState<GameType>('quiz');
  const [generating, setGenerating] = useState(false);
  const [game, setGame] = useState<UserGame | null>(null);
  const [published, setPublished] = useState(false);
  const [message, setMessage] = useState('');

  const handleGenerate = useCallback(() => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setMessage('');

    // Simulate AI generation with sample questions
    setTimeout(() => {
      const questions = SAMPLE_QUESTIONS[type] || SAMPLE_QUESTIONS.quiz;
      const id = generateGameId();
      const newGame: UserGame = {
        id,
        title: prompt.slice(0, 60),
        prompt,
        type,
        questions,
        createdAt: new Date().toISOString(),
        published: false,
        authorName: 'Joueur',
        authorId: 'local',
        ratings: [],
        averageRating: 0,
        playCount: 0,
      };
      saveUserGame(newGame);
      setGame(newGame);
      setGenerating(false);
      setMessage('Jeu généré avec succès !');
    }, 1500);

    // In production, buildGamePrompt(prompt, type) would be sent to AI API
  }, [prompt, type]);

  const handlePublish = useCallback(() => {
    if (!game) return;
    const ok = publishGame(game.id);
    if (ok) {
      setPublished(true);
      setMessage('Jeu publié dans la communauté !');
    }
  }, [game]);

  const typeOptions: { value: GameType; label: string; icon: string }[] = [
    { value: 'quiz', label: 'Quiz', icon: 'quiz' },
    { value: 'enigma', label: 'Énigme', icon: 'psychology' },
    { value: 'challenge', label: 'Défi', icon: 'bolt' },
  ];

  return (
    <div style={{ ...pageContainer(isMobile), maxWidth: 700 }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Link
            href="/client/games"
            style={{
              color: CU.textMuted,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 13,
            }}
          >
            ←
            Arcade
          </Link>
          <span style={{ color: CU.border }}>/</span>
          <span style={{ color: CU.text, fontWeight: 600 }}>Créer un jeu</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={headerRow()}>
            <span style={emojiIcon(24)}>{meta.emoji}</span>
            <h1 style={CU.pageTitle}>Créer un jeu avec l&apos;IA</h1>
            <PageExplanation pageId="games-create" />
          </div>
          <p style={CU.pageSubtitle}>
            {meta.subtitle}
          </p>
        </div>

        {/* Type selector */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ color: CU.textMuted, fontSize: 12, display: 'block', marginBottom: 8 }}>
            Type de jeu
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            {typeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setType(opt.value)}
                style={{
                  flex: 1,
                  background: type === opt.value ? 'rgba(14,165,233,0.15)' : CU.bgSecondary,
                  border: `1px solid ${type === opt.value ? CU.accent : CU.border}`,
                  borderRadius: 8,
                  padding: '12px 16px',
                  cursor: 'pointer',
                  color: type === opt.value ? CU.accent : CU.textMuted,
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: 16 }}>{opt.icon === 'quiz' ? '❓' : opt.icon === 'psychology' ? '🧠' : opt.icon === 'bolt' ? '⚡' : opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt input */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ color: CU.textMuted, fontSize: 12, display: 'block', marginBottom: 8 }}>
            Décrivez votre jeu
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Un quiz sur l'histoire de l'intelligence artificielle, des origines à nos jours..."
            rows={4}
            style={{
              ...CU.textarea,
              background: CU.bgSecondary,
            }}
          />
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || generating}
          style={{
            ...CU.btnPrimary,
            padding: '0 28px',
            height: 42,
            marginBottom: 24,
            opacity: !prompt.trim() || generating ? 0.5 : 1,
            cursor: generating ? 'not-allowed' : 'pointer',
          }}
        >
          <span style={{ fontSize: 16, animation: generating ? 'spin 1s linear infinite' : 'none', display: 'inline-block' }}>
            {generating ? '⏳' : '✨'}
          </span>
          {generating ? 'Génération en cours...' : 'Générer le jeu'}
        </button>

        {/* Message */}
        {message && (
          <div
            style={{
              background: published ? 'rgba(34,197,94,0.1)' : 'rgba(14,165,233,0.1)',
              color: published ? '#22c55e' : CU.accent,
              padding: '10px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 20,
            }}
          >
            {message}
          </div>
        )}

        {/* Preview */}
        {game && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ color: CU.text, fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
              Aperçu ({game.questions.length} questions)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {game.questions.map((q, i) => (
                <div
                  key={i}
                  style={{
                    ...CU.card,
                    background: CU.bgSecondary,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: CU.text, fontSize: 13, fontWeight: 600 }}>
                      {i + 1}. {q.question}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        padding: '2px 8px',
                        borderRadius: 8,
                        background: q.difficulty === 1 ? 'rgba(34,197,94,0.15)' : q.difficulty === 2 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                        color: q.difficulty === 1 ? '#22c55e' : q.difficulty === 2 ? '#f59e0b' : '#ef4444',
                      }}
                    >
                      {q.difficulty === 1 ? 'Facile' : q.difficulty === 2 ? 'Moyen' : 'Difficile'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {q.choices.map((c, ci) => (
                      <span
                        key={ci}
                        style={{
                          fontSize: 11,
                          padding: '3px 10px',
                          borderRadius: 6,
                          background: c === q.answer ? 'rgba(34,197,94,0.12)' : CU.bgSecondary,
                          color: c === q.answer ? '#22c55e' : CU.textMuted,
                          border: c === q.answer ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {!published && (
              <button
                onClick={handlePublish}
                style={{
                  ...CU.btnPrimary,
                  background: CU.success,
                  padding: '0 28px',
                  height: 42,
                  marginTop: 20,
                }}
              >
                📤
                Publier dans la communauté
              </button>
            )}
          </div>
        )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
