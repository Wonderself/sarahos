'use client';

import { useState, useEffect, useRef } from 'react';

interface CounterData {
  total_actions_week: number;
  total_documents_generated: number;
  total_active_teams: number;
  total_assistants_used: number;
}

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (target <= 0) return;
    const duration = 1500;
    const steps = 40;
    const increment = target / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      if (step >= steps) {
        setCurrent(target);
        clearInterval(timer);
      } else {
        setCurrent(Math.round(increment * step));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target]);

  return <span ref={ref}>{current.toLocaleString('fr-FR')}{suffix}</span>;
}

export default function LiveCounters() {
  const [data, setData] = useState<CounterData | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check cache first
    try {
      const cached = sessionStorage.getItem('fz_public_counters');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.ts < 3600000) {
          setData(parsed.data);
          setVisible(true);
          return;
        }
      }
    } catch { /* */ }

    fetch('/api/public/counters')
      .then(r => r.json())
      .then(d => {
        // Only show if numbers are meaningful (> 10)
        if (d.total_actions_week > 10) {
          setData(d);
          setVisible(true);
          try { sessionStorage.setItem('fz_public_counters', JSON.stringify({ data: d, ts: Date.now() })); } catch { /* */ }
        }
      })
      .catch(() => { /* hide gracefully */ });
  }, []);

  if (!visible || !data) return null;

  const counters = [
    { value: data.total_actions_week, label: 'actions cette semaine', icon: '⚡' },
    { value: data.total_documents_generated, label: 'documents générés', icon: '📄' },
    { value: data.total_active_teams, label: 'équipes actives', icon: '👥' },
    { value: data.total_assistants_used, label: 'assistants utilisés', icon: '🤖' },
  ];

  return (
    <div style={{ padding: '48px 0', textAlign: 'center' }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>
        Freenzy en chiffres — cette semaine
      </h2>
      <p style={{ fontSize: 14, color: '#9B9B9B', marginBottom: 32 }}>
        Des entreprises utilisent Freenzy chaque jour
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 16,
        maxWidth: 800,
        margin: '0 auto',
      }}>
        {counters.map((c, i) => (
          <div key={i} style={{
            background: '#FAFAFA',
            border: '1px solid #E5E5E5',
            borderRadius: 12,
            padding: '24px 16px',
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#1A1A1A' }}>
              <AnimatedCounter target={c.value} />
            </div>
            <div style={{ fontSize: 13, color: '#6B6B6B', marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
