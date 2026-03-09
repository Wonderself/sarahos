'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { recordGameScore } from '@/lib/games-engine';

const COLS = 10;
const ROWS = 20;

const PIECES: { shape: number[][]; color: string }[] = [
  { shape: [[1,1,1,1]], color: '#06b6d4' },        // I
  { shape: [[1,1],[1,1]], color: '#eab308' },        // O
  { shape: [[0,1,0],[1,1,1]], color: '#7c3aed' },    // T
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

function useCanvasSize(): number {
  const [cellSize, setCellSize] = useState(28);
  useEffect(() => {
    function calc() {
      // Canvas width = COLS * cellSize. Needs to fit: canvasWidth + nextPiecePanel(~96px) + gap(16px) + padding(32px)
      // On 375px: available for canvas = 375 - 32 - 16 - 96 = 231px => cellSize = 23
      // But if screen is narrow, drop side panel and go full width
      const availableWidth = window.innerWidth - 32; // padding
      if (availableWidth < 340) {
        // No side panel — full width
        setCellSize(Math.min(Math.floor(availableWidth / COLS), 28));
      } else {
        // With side panel
        const forCanvas = availableWidth - 96 - 16;
        setCellSize(Math.min(Math.floor(forCanvas / COLS), 28));
      }
    }
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);
  return cellSize;
}

export default function TetrisGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [nextPiece, setNextPiece] = useState<Piece | null>(null);
  const CELL = useCanvasSize();

  const boardRef = useRef<(string | null)[][]>(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
  const pieceRef = useRef<Piece>(randomPiece());
  const nextRef = useRef<Piece>(randomPiece());
  const scoreRef = useRef(0);
  const linesRef = useRef(0);
  const gameOverRef = useRef(false);
  const dropRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cellRef = useRef(CELL);

  useEffect(() => { cellRef.current = CELL; }, [CELL]);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const cell = cellRef.current;
    const w = COLS * cell, h = ROWS * cell;
    ctx.fillStyle = '#0f0f17';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        ctx.strokeRect(c * cell, r * cell, cell, cell);

    // Board
    const board = boardRef.current;
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (board[r][c]) {
          ctx.fillStyle = board[r][c]!;
          ctx.beginPath();
          ctx.roundRect(c * cell + 1, r * cell + 1, cell - 2, cell - 2, 3);
          ctx.fill();
        }

    // Ghost
    const piece = pieceRef.current;
    const gy = ghostY(board, piece);
    for (let r = 0; r < piece.shape.length; r++)
      for (let c = 0; c < piece.shape[r].length; c++)
        if (piece.shape[r][c]) {
          const x = (piece.x + c) * cell, y = (gy + r) * cell;
          ctx.strokeStyle = piece.color + '44';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x + 2, y + 2, cell - 4, cell - 4);
        }

    // Current piece
    for (let r = 0; r < piece.shape.length; r++)
      for (let c = 0; c < piece.shape[r].length; c++)
        if (piece.shape[r][c]) {
          const x = (piece.x + c) * cell, y = (piece.y + r) * cell;
          ctx.fillStyle = piece.color;
          ctx.beginPath();
          ctx.roundRect(x + 1, y + 1, cell - 2, cell - 2, 3);
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
    const offsets = [0, -1, 1, -2, 2];
    for (const dx of offsets) {
      const newPiece = { ...p, shape: newShape, x: p.x + dx };
      if (!collides(boardRef.current, newPiece)) {
        pieceRef.current = newPiece;
        draw();
        return;
      }
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

  // Redraw when cell size changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = COLS * CELL;
      canvas.height = ROWS * CELL;
    }
    draw();
  }, [CELL, draw]);

  useEffect(() => { draw(); }, [draw]);

  const level = Math.floor(linesRef.current / 10) + 1;
  const showSidePanel = typeof window !== 'undefined' && window.innerWidth >= 340;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%', maxWidth: 500, margin: '0 auto', padding: '0 16px', boxSizing: 'border-box' }}>
      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>Score : {score}</div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Lignes : {lines}</div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Niv. {level}</div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', justifyContent: 'center' }}>
        <canvas
          ref={canvasRef}
          width={COLS * CELL}
          height={ROWS * CELL}
          style={{
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.1)',
            background: '#0f0f17',
            width: COLS * CELL,
            height: ROWS * CELL,
          }}
        />

        {/* Next piece preview */}
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 10, minWidth: 70 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textAlign: 'center' }}>Suivant</div>
          {nextPiece && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              {nextPiece.shape.map((row, ri) => (
                <div key={ri} style={{ display: 'flex', gap: 2 }}>
                  {row.map((cell, ci) => (
                    <div
                      key={ci}
                      style={{
                        width: 14,
                        height: 14,
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
          Jouer
        </button>
      )}

      {gameOver && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <p style={{ color: '#ef4444', fontWeight: 600, margin: 0 }}>Game Over !</p>
          <div style={{ color: '#f59e0b', fontSize: 20, fontWeight: 700 }}>Score : {score}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
            {lines} ligne{lines !== 1 ? 's' : ''} — Niveau {level}
          </div>
          <button
            onClick={startGame}
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
            <span className="material-symbols-rounded" style={{ fontSize: 16 }}>arrow_back</span>
            Arcade
          </Link>
        </div>
      )}

      {/* Mobile touch controls */}
      {started && !gameOver && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <button
            onTouchStart={(e) => { e.preventDefault(); rotatePiece(); }}
            onClick={rotatePiece}
            style={{
              width: 56, height: 44, borderRadius: 8,
              background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)',
              color: '#7c3aed', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: 18 }}>rotate_right</span>
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onTouchStart={(e) => { e.preventDefault(); move(-1); }}
              onClick={() => move(-1)}
              style={{
                width: 56, height: 44, borderRadius: 8,
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', fontSize: 18, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: 20 }}>chevron_left</span>
            </button>
            <button
              onTouchStart={(e) => { e.preventDefault(); tick(); }}
              onClick={tick}
              style={{
                width: 56, height: 44, borderRadius: 8,
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', fontSize: 18, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: 20 }}>keyboard_arrow_down</span>
            </button>
            <button
              onTouchStart={(e) => { e.preventDefault(); move(1); }}
              onClick={() => move(1)}
              style={{
                width: 56, height: 44, borderRadius: 8,
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', fontSize: 18, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: 20 }}>chevron_right</span>
            </button>
          </div>
          <button
            onTouchStart={(e) => { e.preventDefault(); hardDrop(); }}
            onClick={hardDrop}
            style={{
              width: 130, height: 40, borderRadius: 8,
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: 16 }}>vertical_align_bottom</span>
            Poser
          </button>
        </div>
      )}

      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, textAlign: 'center', margin: 0 }}>
        Flèches : déplacer/tourner — Espace : poser
      </p>
    </div>
  );
}
