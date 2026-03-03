'use client';

import { useMemo } from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface AnalyticsChartProps {
  data: DataPoint[];
  type: 'bar' | 'line' | 'pie';
  title: string;
  color?: string;
}

const CHART_COLORS = [
  'var(--accent)',
  'var(--success)',
  'var(--warning)',
  'var(--danger)',
  'var(--info)',
  'var(--purple)',
];

function BarChart({ data, color }: { data: DataPoint[]; color: string }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
      {data.map((item, i) => {
        const pct = (item.value / maxValue) * 100;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              className="text-xs text-secondary"
              style={{
                minWidth: 80,
                textAlign: 'right',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={item.label}
            >
              {item.label}
            </span>
            <div
              style={{
                flex: 1,
                height: 24,
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: color,
                  borderRadius: 'var(--radius-sm)',
                  transition: 'width 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  animation: 'barGrow 0.8s ease-out forwards',
                  animationDelay: `${i * 0.08}s`,
                }}
              />
              <span
                className="text-xs font-semibold"
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: pct > 50 ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {item.value}
              </span>
            </div>
          </div>
        );
      })}
      <style>{`
        @keyframes barGrow {
          from { width: 0%; }
        }
      `}</style>
    </div>
  );
}

function LineChart({ data, color }: { data: DataPoint[]; color: string }) {
  const svgWidth = 400;
  const svgHeight = 200;
  const padding = { top: 20, right: 20, bottom: 40, left: 20 };
  const chartW = svgWidth - padding.left - padding.right;
  const chartH = svgHeight - padding.top - padding.bottom;

  const maxValue = Math.max(...data.map(d => d.value), 1);

  const points = useMemo(() => {
    return data.map((d, i) => {
      const x = padding.left + (data.length > 1 ? (i / (data.length - 1)) * chartW : chartW / 2);
      const y = padding.top + chartH - (d.value / maxValue) * chartH;
      return { x, y, label: d.label, value: d.value };
    });
  }, [data, maxValue, chartW, chartH]);

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  // Area fill path
  const areaPath = points.length > 0
    ? `M${points[0].x},${padding.top + chartH} ` +
      points.map(p => `L${p.x},${p.y}`).join(' ') +
      ` L${points[points.length - 1].x},${padding.top + chartH} Z`
    : '';

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      style={{ width: '100%', height: 'auto' }}
      role="img"
      aria-label="Line chart"
    >
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
        <line
          key={i}
          x1={padding.left}
          y1={padding.top + chartH * (1 - pct)}
          x2={padding.left + chartW}
          y2={padding.top + chartH * (1 - pct)}
          stroke="var(--border-primary)"
          strokeWidth="1"
          strokeDasharray="4,4"
        />
      ))}

      {/* Area fill */}
      <path d={areaPath} fill={color} opacity="0.1" />

      {/* Line */}
      <polyline
        points={polylinePoints}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 1000,
          strokeDashoffset: 1000,
          animation: 'lineDrawIn 1.2s ease-out forwards',
        }}
      />

      {/* Data points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="5" fill="var(--bg-primary)" stroke={color} strokeWidth="2.5" />
          <text
            x={p.x}
            y={padding.top + chartH + 20}
            textAnchor="middle"
            fontSize="11"
            fill="var(--text-muted)"
            fontFamily="var(--font-sans)"
          >
            {p.label}
          </text>
        </g>
      ))}

      <style>{`
        @keyframes lineDrawIn {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </svg>
  );
}

function PieChart({ data, color: _color }: { data: DataPoint[]; color: string }) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const centerX = 120;
  const centerY = 120;

  let cumulativeOffset = 0;

  const segments = data.map((d, i) => {
    const pct = d.value / total;
    const dashLength = pct * circumference;
    const dashGap = circumference - dashLength;
    const offset = -cumulativeOffset;
    cumulativeOffset += dashLength;

    return {
      ...d,
      pct,
      dashArray: `${dashLength} ${dashGap}`,
      dashOffset: offset,
      segmentColor: CHART_COLORS[i % CHART_COLORS.length],
    };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
      <svg
        viewBox="0 0 240 240"
        style={{ width: 200, height: 200, flexShrink: 0 }}
        role="img"
        aria-label="Pie chart"
      >
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke={seg.segmentColor}
            strokeWidth="36"
            strokeDasharray={seg.dashArray}
            strokeDashoffset={seg.dashOffset}
            transform={`rotate(-90 ${centerX} ${centerY})`}
            style={{
              transition: 'stroke-dasharray 0.6s ease, stroke-dashoffset 0.6s ease',
              opacity: 0,
              animation: `pieSliceFadeIn 0.4s ease-out ${i * 0.1}s forwards`,
            }}
          />
        ))}
        {/* Center text */}
        <text
          x={centerX}
          y={centerY - 6}
          textAnchor="middle"
          fontSize="22"
          fontWeight="800"
          fill="var(--text-primary)"
          fontFamily="var(--font-sans)"
        >
          {total}
        </text>
        <text
          x={centerX}
          y={centerY + 14}
          textAnchor="middle"
          fontSize="11"
          fill="var(--text-muted)"
          fontFamily="var(--font-sans)"
        >
          Total
        </text>
        <style>{`
          @keyframes pieSliceFadeIn {
            to { opacity: 1; }
          }
        `}</style>
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: seg.segmentColor,
                flexShrink: 0,
              }}
            />
            <span className="text-sm text-secondary" style={{ whiteSpace: 'nowrap' }}>
              {seg.label}
            </span>
            <span className="text-xs text-muted font-semibold">
              {Math.round(seg.pct * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsChart({ data, type, title, color }: AnalyticsChartProps) {
  const chartColor = color || 'var(--accent)';

  if (!data || data.length === 0) {
    return (
      <div
        className="card"
        style={{
          padding: 20,
          textAlign: 'center',
          color: 'var(--text-muted)',
        }}
      >
        <div className="text-base font-bold mb-8">{title}</div>
        <div className="text-sm">Aucune donnee disponible</div>
      </div>
    );
  }

  return (
    <div
      className="card"
      style={{
        padding: 20,
        width: '100%',
      }}
    >
      <div className="text-base font-bold mb-16" style={{ color: 'var(--text-primary)' }}>
        {title}
      </div>
      {type === 'bar' && <BarChart data={data} color={chartColor} />}
      {type === 'line' && <LineChart data={data} color={chartColor} />}
      {type === 'pie' && <PieChart data={data} color={chartColor} />}
    </div>
  );
}
