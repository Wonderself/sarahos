'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { recordGameScore } from '@/lib/games-engine';

type Dir = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Pos = { x: number; y: number };

const COLS = 20;
const ROWS = 20;

function useCanvasSize(): number {
  const [size, setSize] = useState(400);
  useEffect(() => {
    function calc() {
      setSize(Math.min(window.innerWidth - 32, 400));
    }
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);
  return size;
}

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const canvasSize = useCanvasSize();
  const cellSize = canvasSize / COLS;

  const snakeRef = useRef<Pos[]>([{ x: 10, y: 10 }]);
  const dirRef = useRef<Dir>('RIGHT');
  const nextDirRef = useRef<Dir>('RIGHT');
  const foodRef = useRef<Pos>({ x: 5, y: 5 });
  const scoreRef = useRef(0);
  const gameOverRef = useRef(false);
  const pausedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasSizeRef = useRef(canvasSize);

  // Keep ref in sync
  useEffect(() => { canvasSizeRef.current = canvasSize; }, [canvasSize]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  const placeFood = useCallback(() => {
    const snake = snakeRef.current;
    if (snake.length >= COLS * ROWS) return;
    let f: Pos;
    let attempts = 0;
    do {
      f = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
      attempts++;
    } while (snake.some((s) => s.x === f.x && s.y === f.y) && attempts < 1000);
    foodRef.current = f;
  }, []);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const cs = canvasSizeRef.current;
    const cell = cs / COLS;
    ctx.fillStyle = '#0f0f17';
    ctx.fillRect(0, 0, cs, cs);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    for (let x = 0; x < COLS; x++) {
      for (let y = 0; y < ROWS; y++) {
        ctx.strokeRect(x * cell, y * cell, cell, cell);
      }
    }

    // Food
    const f = foodRef.current;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(f.x * cell + cell / 2, f.y * cell + cell / 2, cell / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Snake
    snakeRef.current.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? '#22c55e' : '#16a34a';
      ctx.beginPath();
      ctx.roundRect(seg.x * cell + 1, seg.y * cell + 1, cell - 2, cell - 2, Math.max(2, cell * 0.2));
      ctx.fill();
    });

    // Pause overlay
    if (pausedRef.current) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, cs, cs);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSE', cs / 2, cs / 2);
    }
  }, []);

  const tick = useCallback(() => {
    if (gameOverRef.current || pausedRef.current) return;
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

  const togglePause = useCallback(() => {
    if (gameOverRef.current || !started) return;
    setPaused(p => {
      const next = !p;
      pausedRef.current = next;
      draw();
      return next;
    });
  }, [started, draw]);

  const startGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }];
    dirRef.current = 'RIGHT';
    nextDirRef.current = 'RIGHT';
    scoreRef.current = 0;
    gameOverRef.current = false;
    pausedRef.current = false;
    setScore(0);
    setGameOver(false);
    setStarted(true);
    setPaused(false);
    placeFood();
    draw();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(tick, 150);
  }, [draw, placeFood, tick]);

  const changeDir = useCallback((d: Dir) => {
    const OPPOSITES: Record<Dir, Dir> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
    if (d !== OPPOSITES[dirRef.current]) {
      nextDirRef.current = d;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        togglePause();
        return;
      }
      const map: Record<string, Dir> = { ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT' };
      const d = map[e.key];
      if (d) {
        changeDir(d);
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [changeDir, togglePause]);

  // Touch swipe
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    let startX = 0, startY = 0;
    const onTouchStart = (e: TouchEvent) => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; };
    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
      e.preventDefault();
      let d: Dir;
      if (Math.abs(dx) > Math.abs(dy)) d = dx > 0 ? 'RIGHT' : 'LEFT';
      else d = dy > 0 ? 'DOWN' : 'UP';
      changeDir(d);
    };
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: false });
    return () => { el.removeEventListener('touchstart', onTouchStart); el.removeEventListener('touchend', onTouchEnd); };
  }, [changeDir]);

  // Redraw on canvas size change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvasSize;
      canvas.height = canvasSize;
    }
    draw();
  }, [canvasSize, draw]);

  // Initial draw
  useEffect(() => { draw(); }, [draw]);

  const speed = Math.max(60, 150 - scoreRef.current);
  const level = Math.floor(scoreRef.current / 50) + 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%', maxWidth: 500, margin: '0 auto', padding: '0 16px', boxSizing: 'border-box' }}>
      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>Score : {score}</div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Niv. {level}</div>
        {highScore > 0 && (
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Record : {highScore}</div>
        )}
        {started && !gameOver && (
          <button
            onClick={togglePause}
            style={{
              background: paused ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.08)',
              color: paused ? '#22c55e' : 'rgba(255,255,255,0.6)',
              border: '1px solid ' + (paused ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'),
              borderRadius: 8,
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span style={{ fontSize: 16 }}>
              {paused ? '▶️' : '⏸️'}
            </span>
            {paused ? 'Reprendre' : 'Pause'}
          </button>
        )}
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        style={{
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.1)',
          background: '#0f0f17',
          touchAction: 'none',
          width: canvasSize,
          height: canvasSize,
        }}
      />

      {/* D-pad for mobile */}
      {started && !gameOver && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <button
            onTouchStart={(e) => { e.preventDefault(); changeDir('UP'); }}
            onClick={() => changeDir('UP')}
            style={{
              width: 56, height: 48, borderRadius: 10,
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 24 }}>▲</span>
          </button>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onTouchStart={(e) => { e.preventDefault(); changeDir('LEFT'); }}
              onClick={() => changeDir('LEFT')}
              style={{
                width: 56, height: 48, borderRadius: 10,
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: 24 }}>◀</span>
            </button>
            <button
              onTouchStart={(e) => { e.preventDefault(); changeDir('DOWN'); }}
              onClick={() => changeDir('DOWN')}
              style={{
                width: 56, height: 48, borderRadius: 10,
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: 24 }}>▼</span>
            </button>
            <button
              onTouchStart={(e) => { e.preventDefault(); changeDir('RIGHT'); }}
              onClick={() => changeDir('RIGHT')}
              style={{
                width: 56, height: 48, borderRadius: 10,
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: 24 }}>▶</span>
            </button>
          </div>
        </div>
      )}

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
          <span style={{ fontSize: 18, verticalAlign: 'middle', marginRight: 6 }}>
            ▶️
          </span>
          Jouer
        </button>
      )}

      {gameOver && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <p style={{ color: '#ef4444', fontWeight: 600, margin: 0 }}>Game Over !</p>
          <div style={{ color: '#f59e0b', fontSize: 20, fontWeight: 700 }}>Score : {score}</div>
          <button
            onClick={startGame}
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
            style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <span style={{ fontSize: 16 }}>←</span>
            Arcade
          </Link>
        </div>
      )}

      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, textAlign: 'center', margin: 0 }}>
        Flèches / swipe / D-pad — P pour pause
      </p>
    </div>
  );
}
