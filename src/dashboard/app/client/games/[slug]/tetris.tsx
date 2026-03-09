'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { recordGameScore } from '@/lib/games-engine';

const COLS = 10;
const ROWS = 20;
const CELL = 28;

const PIECES: { shape: number[][]; color: string }[] = [
  { shape: [[1,1,1,1]], color: '#06b6d4' },        // I
  { shape: [[1,1],[1,1]], color: '#eab308' },        // O
  { shape: [[0,1,0],[1,1,1]], color: '#8b5cf6' },    // T
  { shape: [[0,1,1],[1,1,0]], color: '#22c55e' },    // S
  { shape: [[1,1,0],[0,1,1]], color: '#ef4444' },    // Z
  { shape: [[1,0,0],[1,1,1]], color: '#3b82f6' },    // J
  { shape: [[0,0,1],[1,1,1]], color: '#f97316' },    // L
];

type Piece = { shape: number[][]; color: string; x: number; y: number };

function randomPiece(): Piece {
  const p = PIECES[Math.floor(Math.random() * PIECES.length)];
  return { shape: p.shape.map(r => [...r]), color: p.color, x: Math.floor((COLS - p.shape[0].length) / 2), y: 0 };
}

function rotate(shape: number[][]): number[][] {
  const rows = shape.length, cols = shape[0].length;
  const r: number[][] = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++)
      r[j][rows - 1 - i] = shape[i][j];
  return r;
}

function collides(board: (string | null)[][], piece: Piece): boolean {
  for (let r = 0; r < piece.shape.length; r++)
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (!piece.shape[r][c]) continue;
      const x = piece.x + c, y = piece.y + r;
      if (x < 0 || x >= COLS || y >= ROWS) return true;
      if (y >= 0 && board[y][x]) return true;
    }
  return false;
}

function merge(board: (string | null)[][], piece: Piece): (string | null)[][] {
  const b = board.map(r => [...r]);
  for (let r = 0; r < piece.shape.length; r++)
    for (let c = 0; c < piece.shape[r].length; c++)
      if (piece.shape[r][c]) {
        const x = piece.x + c, y = piece.y + r;
        if (y >= 0 && y < ROWS && x >= 0 && x < COLS) b[y][x] = piece.color;
      }
  return b;
}

function clearLines(board: (string | null)[][]): { board: (string | null)[][]; cleared: number } {
  const b = board.filter(row => row.some(c => !c));
  const cleared = ROWS - b.length;
  while (b.length < ROWS) b.unshift(Array(COLS).fill(null));
  return { board: b, cleared };
}

function ghostY(board: (string | null)[][], piece: Piece): number {
  let gy = piece.y;
  while (!collides(board, { ...piece, y: gy + 1 })) gy++;
  return gy;
}

export default function TetrisGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [nextPiece, setNextPiece] = useState<Piece | null>(null);

  const boardRef = useRef<(string | null)[][]>(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
  const pieceRef = useRef<Piece>(randomPiece());
  const nextRef = useRef<Piece>(randomPiece());
  const scoreRef = useRef(0);
  const linesRef = useRef(0);
  const gameOverRef = useRef(false);
  const dropRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const w = COLS * CELL, h = ROWS * CELL;
    ctx.fillStyle = '#0f0f17';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        ctx.strokeRect(c * CELL, r * CELL, CELL, CELL);

    // Board
    const board = boardRef.current;
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (board[r][c]) {
          ctx.fillStyle = board[r][c]!;
          ctx.beginPath();
          ctx.roundRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2, 3);
          ctx.fill();
        }

    // Ghost
    const piece = pieceRef.current;
    const gy = ghostY(board, piece);
    for (let r = 0; r < piece.shape.length; r++)
      for (let c = 0; c < piece.shape[r].length; c++)
        if (piece.shape[r][c]) {
          const x = (piece.x + c) * CELL, y = (gy + r) * CELL;
          ctx.strokeStyle = piece.color + '44';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x + 2, y + 2, CELL - 4, CELL - 4);
        }

    // Current piece
    for (let r = 0; r < piece.shape.length; r++)
      for (let c = 0; c < piece.shape[r].length; c++)
        if (piece.shape[r][c]) {
          const x = (piece.x + c) * CELL, y = (piece.y + r) * CELL;
          ctx.fillStyle = piece.color;
          ctx.beginPath();
          ctx.roundRect(x + 1, y + 1, CELL - 2, CELL - 2, 3);
          ctx.fill();
        }
  }, []);

  const lock = useCallback(() => {
    const board = merge(boardRef.current, pieceRef.current);
    const { board: cleared, cleared: n } = clearLines(board);
    boardRef.current = cleared;
    const pts = [0, 100, 300, 500, 800][n] || 0;
    scoreRef.current += pts;
    linesRef.current += n;
    setScore(scoreRef.current);
    setLines(linesRef.current);

    pieceRef.current = nextRef.current;
    nextRef.current = randomPiece();
    setNextPiece({ ...nextRef.current });

    if (collides(boardRef.current, pieceRef.current)) {
      gameOverRef.current = true;
      setGameOver(true);
      if (dropRef.current) clearInterval(dropRef.current);
      recordGameScore('tetris', scoreRef.current);
    }
  }, []);

  const tick = useCallback(() => {
    if (gameOverRef.current) return;
    const p = pieceRef.current;
    if (!collides(boardRef.current, { ...p, y: p.y + 1 })) {
      pieceRef.current = { ...p, y: p.y + 1 };
    } else {
      lock();
    }
    draw();
  }, [draw, lock]);

  const move = useCallback((dx: number) => {
    if (gameOverRef.current) return;
    const p = pieceRef.current;
    if (!collides(boardRef.current, { ...p, x: p.x + dx })) {
      pieceRef.current = { ...p, x: p.x + dx };
      draw();
    }
  }, [draw]);

  const rotatePiece = useCallback(() => {
    if (gameOverRef.current) return;
    const p = pieceRef.current;
    const newShape = rotate(p.shape);
    const newPiece = { ...p, shape: newShape };
    if (!collides(boardRef.current, newPiece)) {
      pieceRef.current = newPiece;
      draw();
    }
  }, [draw]);

  const hardDrop = useCallback(() => {
    if (gameOverRef.current) return;
    const p = pieceRef.current;
    const gy = ghostY(boardRef.current, p);
    scoreRef.current += (gy - p.y) * 2;
    setScore(scoreRef.current);
    pieceRef.current = { ...p, y: gy };
    lock();
    draw();
  }, [draw, lock]);

  const startGame = useCallback(() => {
    boardRef.current = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    pieceRef.current = randomPiece();
    nextRef.current = randomPiece();
    scoreRef.current = 0;
    linesRef.current = 0;
    gameOverRef.current = false;
    setScore(0);
    setLines(0);
    setGameOver(false);
    setStarted(true);
    setNextPiece({ ...nextRef.current });
    draw();
    if (dropRef.current) clearInterval(dropRef.current);
    dropRef.current = setInterval(tick, 500);
  }, [draw, tick]);

  useEffect(() => {
    return () => { if (dropRef.current) clearInterval(dropRef.current); };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!started || gameOverRef.current) return;
      switch (e.key) {
        case 'ArrowLeft': move(-1); e.preventDefault(); break;
        case 'ArrowRight': move(1); e.preventDefault(); break;
        case 'ArrowDown': tick(); e.preventDefault(); break;
        case 'ArrowUp': rotatePiece(); e.preventDefault(); break;
        case ' ': hardDrop(); e.preventDefault(); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [started, move, tick, rotatePiece, hardDrop]);

  useEffect(() => { draw(); }, [draw]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>Score : {score}</div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Lignes : {lines}</div>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <canvas
          ref={canvasRef}
          width={COLS * CELL}
          height={ROWS * CELL}
          style={{
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.1)',
            background: '#0f0f17',
          }}
        />

        {/* Next piece preview */}
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 12, minWidth: 80 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textAlign: 'center' }}>Suivant</div>
          {nextPiece && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              {nextPiece.shape.map((row, ri) => (
                <div key={ri} style={{ display: 'flex', gap: 2 }}>
                  {row.map((cell, ci) => (
                    <div
                      key={ci}
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 2,
                        background: cell ? nextPiece.color : 'transparent',
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {!started && (
        <button
          onClick={startGame}
          style={{
            background: '#8b5cf6',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '12px 28px',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Jouer
        </button>
      )}

      {gameOver && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#ef4444', fontWeight: 600, marginBottom: 12 }}>Game Over !</p>
          <button
            onClick={startGame}
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
            Rejouer
          </button>
        </div>
      )}

      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, textAlign: 'center' }}>
        Flèches : déplacer/tourner — Espace : poser
      </p>
    </div>
  );
}
