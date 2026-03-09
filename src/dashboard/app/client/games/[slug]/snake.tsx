'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { recordGameScore } from '@/lib/games-engine';

type Dir = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Pos = { x: number; y: number };

const CELL = 20;
const COLS = 20;
const ROWS = 20;

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const snakeRef = useRef<Pos[]>([{ x: 10, y: 10 }]);
  const dirRef = useRef<Dir>('RIGHT');
  const nextDirRef = useRef<Dir>('RIGHT');
  const foodRef = useRef<Pos>({ x: 5, y: 5 });
  const scoreRef = useRef(0);
  const gameOverRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const placeFood = useCallback(() => {
    const snake = snakeRef.current;
    let f: Pos;
    do {
      f = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    } while (snake.some((s) => s.x === f.x && s.y === f.y));
    foodRef.current = f;
  }, []);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const w = COLS * CELL, h = ROWS * CELL;
    ctx.fillStyle = '#0f0f17';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    for (let x = 0; x < COLS; x++) {
      for (let y = 0; y < ROWS; y++) {
        ctx.strokeRect(x * CELL, y * CELL, CELL, CELL);
      }
    }

    // Food
    const f = foodRef.current;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(f.x * CELL + CELL / 2, f.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Snake
    snakeRef.current.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? '#22c55e' : '#16a34a';
      ctx.beginPath();
      ctx.roundRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2, 4);
      ctx.fill();
    });
  }, []);

  const tick = useCallback(() => {
    if (gameOverRef.current) return;
    const snake = [...snakeRef.current];
    dirRef.current = nextDirRef.current;
    const head = { ...snake[0] };

    switch (dirRef.current) {
      case 'UP': head.y--; break;
      case 'DOWN': head.y++; break;
      case 'LEFT': head.x--; break;
      case 'RIGHT': head.x++; break;
    }

    // Wall collision
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
      gameOverRef.current = true;
      setGameOver(true);
      const s = scoreRef.current;
      setHighScore((h) => Math.max(h, s));
      recordGameScore('snake', s);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    // Self collision
    if (snake.some((s) => s.x === head.x && s.y === head.y)) {
      gameOverRef.current = true;
      setGameOver(true);
      const s = scoreRef.current;
      setHighScore((h) => Math.max(h, s));
      recordGameScore('snake', s);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    snake.unshift(head);

    // Eat food
    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      scoreRef.current += 10;
      setScore(scoreRef.current);
      placeFood();
      // Speed up
      if (intervalRef.current) clearInterval(intervalRef.current);
      const speed = Math.max(60, 150 - scoreRef.current);
      intervalRef.current = setInterval(tick, speed);
    } else {
      snake.pop();
    }

    snakeRef.current = snake;
    draw();
  }, [draw, placeFood]);

  const startGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }];
    dirRef.current = 'RIGHT';
    nextDirRef.current = 'RIGHT';
    scoreRef.current = 0;
    gameOverRef.current = false;
    setScore(0);
    setGameOver(false);
    setStarted(true);
    placeFood();
    draw();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(tick, 150);
  }, [draw, placeFood, tick]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Keyboard
  useEffect(() => {
    const OPPOSITES: Record<Dir, Dir> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = { ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT' };
      const d = map[e.key];
      if (d && d !== OPPOSITES[dirRef.current]) {
        nextDirRef.current = d;
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Touch swipe
  useEffect(() => {
    let startX = 0, startY = 0;
    const OPPOSITES: Record<Dir, Dir> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
    const onTouchStart = (e: TouchEvent) => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; };
    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
      let d: Dir;
      if (Math.abs(dx) > Math.abs(dy)) d = dx > 0 ? 'RIGHT' : 'LEFT';
      else d = dy > 0 ? 'DOWN' : 'UP';
      if (d !== OPPOSITES[dirRef.current]) nextDirRef.current = d;
    };
    window.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchend', onTouchEnd);
    return () => { window.removeEventListener('touchstart', onTouchStart); window.removeEventListener('touchend', onTouchEnd); };
  }, []);

  // Initial draw
  useEffect(() => { draw(); }, [draw]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <div style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>Score : {score}</div>
        {highScore > 0 && (
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Record : {highScore}</div>
        )}
      </div>

      <canvas
        ref={canvasRef}
        width={COLS * CELL}
        height={ROWS * CELL}
        style={{
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.1)',
          background: '#0f0f17',
        }}
      />

      {!started && (
        <button
          onClick={startGame}
          style={{
            background: '#22c55e',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '12px 28px',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <span className="material-symbols-rounded" style={{ fontSize: 18, verticalAlign: 'middle', marginRight: 6 }}>
            play_arrow
          </span>
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
        Flèches directionnelles ou swipe tactile
      </p>
    </div>
  );
}
