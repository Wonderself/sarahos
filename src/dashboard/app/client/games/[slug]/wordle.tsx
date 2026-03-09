'use client';

import { useState, useEffect, useCallback } from 'react';
import { recordGameScore } from '@/lib/games-engine';

const WORDS = [
  'BATEAU','BALLON','BUREAU','BOUCHE','BOUTON','BRAISE','BRIQUE','BROUIL',
  'CABANE','CAFARD','CALMER','CANARD','CARTON','CASINO','CASQUE','CAVERN',
  'CHALON','CHAMPS','CHANCE','CHAQUE','CHARME','CHATON','CHEMIN','CHEVAL',
  'CHOISI','CIRAGE','CLAQUE','CLOCHE','COFFRE','COMBAT','COMPTE','CONFIE',
  'CONNUE','CONSUL','COPAIN','CORDON','COUCHE','COUPLE','COURSE','COUSIN',
  'CRAYON','CROIRE','CROUPE','DAEMON','DANGER','DANSER','DEFAUT','DEMAIN',
  'DEPART','DESSIN','DEVISE','DINDON','DIRECT','DISQUE','DONNER','DOUBLE',
  'DOUCHE','DRAGEE','DROITE','DURCIR','EFFORT','EMPLOI','ENIGME','ENTREE',
  'ENVAHI','ERREUR','ESPION','ESPOIR','ESSAIM','ETABLE','ETOILE','EVITER',
  'FACADE','FACTIR','FARINE','FAVEUR','FERMER','FICHER','FIGURE','FLACON',
  'FLAMME','FLECHE','FLOTTE','FORCER','FORMAT','FOUDRE','FOULER','FOURMI',
  'FRAISE','FRITES','FROIDE','FUMOIR','GALANT','GARAGE','GARDER','GATEAU',
  'GAUCHE','GENIAL','GLOBAL','GOUTTE','GRADIN','GRANDE','GRAPPE','GRILLE',
  'GROSSE','GUIDON','HABILE','HAMEAU','HASARD','HERBES','HOMARD','HUMAIN',
  'HUMEUR','HURLER','IDOINE','IMPOSE','JARDIN','JAUNIR','JOUEUR','JUMEAU',
  'JUNGLE','LACHER','LANCER','LANGUE','LETTRE','LEURRE','LIGNER','LISSER',
  'LIVRER','LOGUER','LOUCHE','MAITRE','MARCHE','MASQUE','MAUDIT','MENACE',
  'MESURE','METIER','MIROIR','MODELE','MOMENT','MOUCHE','MUSEAU','NUANCE',
  'OBSCUR','OFFRIR','OISEAU','ORIENT','PARDON','PARLER',
];

const AZERTY_ROWS = [
  ['A','Z','E','R','T','Y','U','I','O','P'],
  ['Q','S','D','F','G','H','J','K','L','M'],
  ['⏎','W','X','C','V','B','N','⌫'],
];

type CellState = 'correct' | 'present' | 'absent' | 'empty';

function pickWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function evaluate(guess: string, target: string): CellState[] {
  const result: CellState[] = Array(6).fill('absent');
  const tArr = target.split('');
  const gArr = guess.split('');
  // Pass 1: correct
  for (let i = 0; i < 6; i++) {
    if (gArr[i] === tArr[i]) {
      result[i] = 'correct';
      tArr[i] = '#';
      gArr[i] = '*';
    }
  }
  // Pass 2: present
  for (let i = 0; i < 6; i++) {
    if (gArr[i] === '*') continue;
    const idx = tArr.indexOf(gArr[i]);
    if (idx !== -1) {
      result[i] = 'present';
      tArr[idx] = '#';
    }
  }
  return result;
}

const COLORS: Record<CellState, string> = {
  correct: '#22c55e',
  present: '#eab308',
  absent: '#333',
  empty: 'rgba(255,255,255,0.08)',
};

export default function WordleGame() {
  const [target, setTarget] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [states, setStates] = useState<CellState[][]>([]);
  const [current, setCurrent] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [shake, setShake] = useState(false);
  const [message, setMessage] = useState('');
  const [letterStates, setLetterStates] = useState<Record<string, CellState>>({});

  const reset = useCallback(() => {
    setTarget(pickWord());
    setGuesses([]);
    setStates([]);
    setCurrent('');
    setGameOver(false);
    setWon(false);
    setMessage('');
    setLetterStates({});
  }, []);

  useEffect(() => { reset(); }, [reset]);

  const submit = useCallback(() => {
    if (current.length !== 6 || gameOver) return;
    const guess = current.toUpperCase();
    const result = evaluate(guess, target);
    const newGuesses = [...guesses, guess];
    const newStates = [...states, result];
    setGuesses(newGuesses);
    setStates(newStates);
    setCurrent('');

    // Update letter states
    const ls = { ...letterStates };
    for (let i = 0; i < 6; i++) {
      const l = guess[i];
      if (result[i] === 'correct') ls[l] = 'correct';
      else if (result[i] === 'present' && ls[l] !== 'correct') ls[l] = 'present';
      else if (!ls[l]) ls[l] = 'absent';
    }
    setLetterStates(ls);

    const isWin = result.every((s) => s === 'correct');
    if (isWin) {
      setWon(true);
      setGameOver(true);
      const score = (7 - newGuesses.length) * 100;
      setMessage(`Bravo ! Score: ${score}`);
      recordGameScore('wordle', score);
    } else if (newGuesses.length >= 6) {
      setGameOver(true);
      setMessage(`Le mot était : ${target}`);
      recordGameScore('wordle', 0);
    }
  }, [current, gameOver, guesses, states, target, letterStates]);

  const handleKey = useCallback(
    (key: string) => {
      if (gameOver) return;
      if (key === '⌫' || key === 'Backspace') {
        setCurrent((c) => c.slice(0, -1));
      } else if (key === '⏎' || key === 'Enter') {
        if (current.length === 6) submit();
        else {
          setShake(true);
          setTimeout(() => setShake(false), 300);
        }
      } else if (/^[A-Za-z]$/.test(key) && current.length < 6) {
        setCurrent((c) => c + key.toUpperCase());
      }
    },
    [current, gameOver, submit]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => handleKey(e.key);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleKey]);

  // Build display rows
  const rows: { letters: string[]; states: CellState[] }[] = [];
  for (let i = 0; i < 6; i++) {
    if (i < guesses.length) {
      rows.push({ letters: guesses[i].split(''), states: states[i] });
    } else if (i === guesses.length) {
      const letters = current.padEnd(6, ' ').split('');
      rows.push({ letters, states: Array(6).fill('empty') });
    } else {
      rows.push({ letters: Array(6).fill(' '), states: Array(6).fill('empty') });
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {message && (
        <div
          style={{
            background: won ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            color: won ? '#22c55e' : '#ef4444',
            padding: '10px 20px',
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          {message}
        </div>
      )}

      {/* Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rows.map((row, ri) => (
          <div
            key={ri}
            style={{
              display: 'flex',
              gap: 6,
              animation: shake && ri === guesses.length ? 'shake 0.3s' : undefined,
            }}
          >
            {row.letters.map((letter, ci) => (
              <div
                key={ci}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 8,
                  background: COLORS[row.states[ci]],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#fff',
                  border: row.states[ci] === 'empty' && letter !== ' ' ? '2px solid rgba(255,255,255,0.2)' : '2px solid transparent',
                  transition: 'background 0.3s',
                }}
              >
                {letter.trim()}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Keyboard */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
        {AZERTY_ROWS.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 4 }}>
            {row.map((key) => {
              const ls = letterStates[key];
              const bg = ls ? COLORS[ls] : 'rgba(255,255,255,0.1)';
              const isSpecial = key === '⏎' || key === '⌫';
              return (
                <button
                  key={key}
                  onClick={() => handleKey(key)}
                  style={{
                    width: isSpecial ? 56 : 36,
                    height: 44,
                    borderRadius: 6,
                    background: bg,
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: isSpecial ? 16 : 14,
                    fontWeight: 600,
                    transition: 'background 0.2s',
                  }}
                >
                  {key}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {gameOver && (
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
            marginTop: 8,
          }}
        >
          Rejouer
        </button>
      )}

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}
