'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { recordGameScore } from '@/lib/games-engine';

const WORDS = [
  'BATEAU','BALLON','BUREAU','BOUCHE','BOUTON','BRAISE','BRIQUE','BROCHE',
  'CABANE','CAFARD','CALMER','CANARD','CARTON','CASINO','CASQUE','CLAIRE',
  'CLARTE','CHAMPS','CHANCE','CHAQUE','CHARME','CHATON','CHEMIN','CHEVAL',
  'CHOISI','CIRAGE','CLAQUE','CLOCHE','COFFRE','COMBAT','COMPTE','CONFIE',
  'CONNUE','CONSUL','COPAIN','CORDON','COUCHE','COUPLE','COURSE','COUSIN',
  'CRAYON','CROIRE','CROUPE','DANGER','DANSER','DEFAUT','DEMAIN','DEPART',
  'DESSIN','DEVISE','DINDON','DIRECT','DISQUE','DONNER','DOUBLE','DOUCHE',
  'DRAGEE','DROITE','DURCIR','EFFORT','EMPLOI','ENIGME','ENTREE','ENVAHI',
  'ERREUR','ESPION','ESPOIR','ESSAIM','ETABLE','ETOILE','EVITER','FACADE',
  'FACILE','FARINE','FAVEUR','FERMER','FICHER','FIGURE','FLACON','FLAMME',
  'FLECHE','FLOTTE','FORCER','FORMAT','FOUDRE','FOULER','FOURMI','FRAISE',
  'FRITES','FROIDE','FUMOIR','GALANT','GARAGE','GARDER','GATEAU','GAUCHE',
  'GENIAL','GLOBAL','GOUTTE','GRADIN','GRANDE','GRAPPE','GRILLE','GROSSE',
  'GUIDON','HABILE','HAMEAU','HASARD','HERBES','HOMARD','HUMAIN','HUMEUR',
  'HURLER','IMPOSE','JARDIN','JAUNIR','JOUEUR','JUMEAU','JUNGLE','LACHER',
  'LANCER','LANGUE','LETTRE','LEURRE','LISSER','LIVRER','LONGER','LOUCHE',
  'MAITRE','MARCHE','MASQUE','MAUDIT','MENACE','MESURE','METIER','MIROIR',
  'MODELE','MOMENT','MOUCHE','MUSEAU','NUANCE','OBSCUR','OFFRIR','OISEAU',
  'ORIENT','PARDON','PARLER','PATRIE','PENSEE','PERCEE','PIGEON','PILOTE',
  'PLAIRE','PLANTE','PLONGE','POINTE','POLICE','POMPER','POSTER','POURVU',
  'PRIERE','PRINCE','PRISON','PROFIT','PROPRE','RAMPER','RAPIDE','RASOIR',
  'RECULE','REFUGE','REGARD','REGIME','REMISE','RENARD','REPERE','RETOUR',
  'REVEIL','RIDEAU','RIVAGE','ROULER','RUINER','SAUMON','SAVEUR','SENTIR',
  'SERVIR','SIGNAL','SOMMET','SONDER','SORTIR','SOURCE','STATUE','SUIVRE',
  'TORCHE','TOUCHE','TREMPE','TRIAGE','UTILES','VALEUR','VAPEUR','VERSER',
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
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current); };
  }, []);

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
          if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
          shakeTimerRef.current = setTimeout(() => { setShake(false); shakeTimerRef.current = null; }, 300);
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

  // Responsive cell size: 6 cells + 5 gaps(6px) = need cells to fit in (screenWidth - 32px padding - 30px gaps)
  // On 375px: available = 343px - 30px = 313px => 313/6 ≈ 52px — OK
  // Keyboard: 10 keys * keyW + 9 * 4px gaps. We use percentage-based key widths.

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%', maxWidth: 500, margin: '0 auto', padding: '0 16px', boxSizing: 'border-box' }}>
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

      {/* Grid — responsive cells using clamp */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', maxWidth: 342, alignSelf: 'center' }}>
        {rows.map((row, ri) => (
          <div
            key={ri}
            style={{
              display: 'flex',
              gap: 6,
              justifyContent: 'center',
              animation: shake && ri === guesses.length ? 'shake 0.3s' : undefined,
            }}
          >
            {row.letters.map((letter, ci) => (
              <div
                key={ci}
                style={{
                  width: 'calc(min((100vw - 62px) / 6, 52px))',
                  height: 'calc(min((100vw - 62px) / 6, 52px))',
                  borderRadius: 8,
                  background: COLORS[row.states[ci]],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'clamp(16px, 4.5vw, 22px)',
                  fontWeight: 700,
                  color: '#fff',
                  border: row.states[ci] === 'empty' && letter !== ' ' ? '2px solid rgba(255,255,255,0.2)' : '2px solid transparent',
                  transition: 'background 0.3s',
                  flexShrink: 0,
                }}
              >
                {letter.trim()}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Keyboard — responsive width */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', width: '100%', maxWidth: 420 }}>
        {AZERTY_ROWS.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 'clamp(2px, 0.8vw, 4px)', justifyContent: 'center', width: '100%' }}>
            {row.map((key) => {
              const ls = letterStates[key];
              const bg = ls ? COLORS[ls] : 'rgba(255,255,255,0.1)';
              const isSpecial = key === '⏎' || key === '⌫';
              return (
                <button
                  key={key}
                  onClick={() => handleKey(key)}
                  style={{
                    flex: isSpecial ? '1.4 1 0' : '1 1 0',
                    minWidth: 0,
                    height: 44,
                    borderRadius: 6,
                    background: bg,
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: isSpecial ? 16 : 'clamp(11px, 3vw, 14px)',
                    fontWeight: 600,
                    transition: 'background 0.2s',
                    padding: '0 2px',
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
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
            <span style={{ fontSize: 16 }}>←</span>
            Arcade
          </Link>
        </div>
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
