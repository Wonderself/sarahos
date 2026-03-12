'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { recordGameScore } from '@/lib/games-engine';
import Link from 'next/link';

const ROWS = 9;
const COLS = 9;
const MINES = 10;

interface Cell {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  neighbors: number;
}

type Board = Cell[][];

function createBoard(firstR: number, firstC: number): Board {
  const board: Board = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      mine: false, revealed: false, flagged: false, neighbors: 0,
    }))
  );

  // Place mines avoiding first click and its neighbors
  const forbidden = new Set<string>();
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++)
      forbidden.add(`${firstR + dr}-${firstC + dc}`);

  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (board[r][c].mine || forbidden.has(`${r}-${c}`)) continue;
    board[r][c].mine = true;
    placed++;
  }

  // Count neighbors
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      let count = 0;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].mine) count++;
        }
      board[r][c].neighbors = count;
    }

  return board;
}

function revealCell(board: Board, r: number, c: number): Board {
  const b = board.map((row) => row.map((cell) => ({ ...cell })));
  const stack: [number, number][] = [[r, c]];
  while (stack.length > 0) {
    const [cr, cc] = stack.pop()!;
    if (cr < 0 || cr >= ROWS || cc < 0 || cc >= COLS) continue;
    if (b[cr][cc].revealed || b[cr][cc].flagged) continue;
    b[cr][cc].revealed = true;
    if (b[cr][cc].neighbors === 0 && !b[cr][cc].mine) {
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++)
          if (dr !== 0 || dc !== 0) stack.push([cr + dr, cc + dc]);
    }
  }
  return b;
}

const NUM_COLORS = ['', '#3b82f6', '#22c55e', '#ef4444', '#1e3a5f', '#7f1d1d', '#06b6d4', '#000', '#888'];

export default function MinesweeperGame() {
  const [board, setBoard] = useState<Board | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [timer, setTimer] = useState(0);
  const [flags, setFlags] = useState(0);
  const [started, setStarted] = useState(false);
  const [flagMode, setFlagMode] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerValRef = useRef(0);

  // Timer effect: runs when started & not gameOver
  useEffect(() => {
    if (started && !gameOver) {
      timerRef.current = setInterval(() => {
        timerValRef.current += 1;
        setTimer(timerValRef.current);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, gameOver]);

  const initGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    timerValRef.current = 0;
    setBoard(null);
    setGameOver(false);
    setWon(false);
    setTimer(0);
    setFlags(0);
    setStarted(false);
    setFlagMode(false);
  }, []);

  const handleClick = useCallback(
    (r: number, c: number) => {
      if (gameOver) return;

      // In flag mode, toggle flag instead of revealing
      if (flagMode && board) {
        const cell = board[r][c];
        if (cell.revealed) return;
        const newBoard = board.map((row) => row.map((cl) => ({ ...cl })));
        newBoard[r][c].flagged = !newBoard[r][c].flagged;
        setBoard(newBoard);
        setFlags((f) => f + (newBoard[r][c].flagged ? 1 : -1));
        return;
      }

      let b = board;
      if (!b) {
        // First click — board generated around safe zone
        b = createBoard(r, c);
        setStarted(true);
      }

      const cell = b[r][c];
      if (cell.revealed || cell.flagged) return;

      if (cell.mine) {
        // Game over — reveal all mines
        const final = b.map((row) =>
          row.map((cl) => (cl.mine ? { ...cl, revealed: true } : { ...cl }))
        );
        setBoard(final);
        setGameOver(true);
        setWon(false);
        recordGameScore('minesweeper', 0);
        return;
      }

      const newBoard = revealCell(b, r, c);
      setBoard(newBoard);

      // Check win
      const unrevealed = newBoard.flat().filter((cl) => !cl.revealed && !cl.mine).length;
      if (unrevealed === 0) {
        setGameOver(true);
        setWon(true);
        const score = Math.max(100, 1000 - timerValRef.current * 5);
        recordGameScore('minesweeper', score);
      }
    },
    [board, gameOver, flagMode]
  );

  const handleRightClick = useCallback(
    (e: React.MouseEvent, r: number, c: number) => {
      e.preventDefault();
      if (gameOver || !board) return;
      const cell = board[r][c];
      if (cell.revealed) return;
      const newBoard = board.map((row) => row.map((cl) => ({ ...cl })));
      newBoard[r][c].flagged = !newBoard[r][c].flagged;
      setBoard(newBoard);
      setFlags((f) => f + (newBoard[r][c].flagged ? 1 : -1));
    },
    [board, gameOver]
  );

  const displayBoard = board || Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      mine: false, revealed: false, flagged: false, neighbors: 0,
    }))
  );

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // Dynamic cell size: fit 9 cols within available width (max 500px container - 32px padding - 12px grid padding - gaps)
  // cellSize = (availableWidth - gridPadding*2 - gap*(cols-1)) / cols
  // We use CSS calc via max-width on the grid, cells are 1fr
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%', maxWidth: 500, margin: '0 auto', padding: '0 16px', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
          {'🚩'}{' '}
          {MINES - flags}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
          {'⏱️'}{' '}
          {formatTime(timer)}
        </div>
        {/* Flag mode toggle — near header for easy access */}
        <button
          onClick={() => setFlagMode((f) => !f)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: flagMode ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)',
            border: flagMode ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, padding: '6px 14px',
            color: flagMode ? '#ef4444' : 'rgba(255,255,255,0.6)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <span style={{ fontSize: 16 }}>
            {flagMode ? '🚩' : '👆'}
          </span>
          {flagMode ? 'Drapeau' : 'Révéler'}
        </button>
      </div>

      {/* Board — responsive grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gap: 2,
          padding: 6,
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 10,
          width: '100%',
          maxWidth: 340,
          touchAction: 'manipulation',
        }}
      >
        {displayBoard.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              onClick={() => handleClick(r, c)}
              onContextMenu={(e) => handleRightClick(e, r, c)}
              style={{
                aspectRatio: '1',
                borderRadius: 4,
                background: cell.revealed
                  ? cell.mine
                    ? 'rgba(239,68,68,0.25)'
                    : 'rgba(255,255,255,0.08)'
                  : 'rgba(255,255,255,0.05)',
                border: cell.revealed
                  ? '1px solid rgba(255,255,255,0.08)'
                  : '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: cell.revealed || gameOver ? 'default' : 'pointer',
                fontSize: 'min(3.5vw, 14px)',
                fontWeight: 700,
                color: cell.revealed && cell.neighbors > 0 ? NUM_COLORS[cell.neighbors] : 'transparent',
                transition: 'background 0.1s',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {cell.flagged && !cell.revealed ? (
                <span>🚩</span>
              ) : cell.revealed && cell.mine ? (
                <span>💣</span>
              ) : cell.revealed && cell.neighbors > 0 ? (
                cell.neighbors
              ) : null}
            </div>
          ))
        )}
      </div>

      {!started && !board && (
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
          Cliquez sur une case pour commencer
        </p>
      )}

      {gameOver && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: won ? '#22c55e' : '#ef4444', fontWeight: 700, fontSize: 20, marginBottom: 4 }}>
            {won ? 'Bravo ! Toutes les mines trouvées !' : 'Boom ! Vous avez touché une mine.'}
          </p>
          {won && (
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 16 }}>
              Score : {Math.max(100, 1000 - timerValRef.current * 5)}
            </p>
          )}
          {!won && (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 16 }}>
              Score : 0
            </p>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={initGame}
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
              style={{
                color: 'rgba(255,255,255,0.5)',
                textDecoration: 'none',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {'←'}{' '}
              Arcade
            </Link>
          </div>
        </div>
      )}

      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
        Clic gauche : révéler — Clic droit ou mode drapeau : drapeau
      </p>
    </div>
  );
}
