'use client';

import React, { useRef, useEffect } from 'react';

interface CVPreviewProps {
  content: string;
  editable?: boolean;
  onEdit?: (newContent: string) => void;
}

interface CVData {
  name: string;
  title: string;
  email: string;
  phone: string;
  city: string;
  skills: { label: string; level: number }[];
  languages: { label: string; level: number }[];
  experience: { date: string; title: string; company: string; description: string }[];
  education: { date: string; title: string; school: string }[];
}

function parseCV(raw: string): CVData {
  const defaults: CVData = {
    name: 'Jean Dupont',
    title: 'Responsable Marketing Digital',
    email: 'jean.dupont@email.com',
    phone: '+33 6 12 34 56 78',
    city: 'Paris, France',
    skills: [
      { label: 'Marketing Digital', level: 90 },
      { label: 'SEO / SEA', level: 85 },
      { label: 'Gestion de Projet', level: 80 },
      { label: 'Analytics', level: 75 },
      { label: 'Design UX', level: 60 },
    ],
    languages: [
      { label: 'Français', level: 5 },
      { label: 'Anglais', level: 3 },
    ],
    experience: [
      {
        date: '2022 – Présent',
        title: 'Responsable Marketing',
        company: 'TechCorp SAS',
        description: 'Pilotage de la stratégie digitale, gestion d\'une équipe de 5 personnes.',
      },
      {
        date: '2019 – 2022',
        title: 'Chef de Projet Digital',
        company: 'AgenceWeb',
        description: 'Coordination de projets web pour des clients grands comptes.',
      },
    ],
    education: [
      {
        date: '2015 – 2019',
        title: 'Master Marketing Digital',
        school: 'Université Paris-Dauphine',
      },
    ],
  };

  try {
    const parsed = JSON.parse(raw) as Partial<CVData>;
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

function renderDots(level: number, max: number = 5): React.ReactNode {
  const dots: React.ReactNode[] = [];
  for (let i = 1; i <= max; i++) {
    dots.push(
      <span
        key={i}
        style={{
          display: 'inline-block',
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: i <= level ? '#FFFFFF' : 'rgba(255,255,255,0.25)',
          marginRight: 3,
        }}
      />
    );
  }
  return <span>{dots}</span>;
}

export default function CVPreview({
  content,
  editable = false,
  onEdit,
}: CVPreviewProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cv = parseCV(content);

  useEffect(() => {
    if (editable && textareaRef.current) {
      const ta = textareaRef.current;
      ta.style.height = 'auto';
      ta.style.height = `${ta.scrollHeight}px`;
    }
  }, [content, editable]);

  if (editable) {
    return (
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E5E5E5',
          borderRadius: 8,
          padding: 16,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div style={{ fontSize: 12, color: '#9B9B9B', marginBottom: 8 }}>
          Modifiez le contenu du CV (format JSON)
        </div>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onEdit?.(e.target.value)}
          style={{
            width: '100%',
            border: '1px solid #E5E5E5',
            borderRadius: 6,
            outline: 'none',
            resize: 'none',
            fontSize: 13,
            lineHeight: 1.5,
            color: '#1A1A1A',
            fontFamily: 'monospace',
            background: '#FAFAFA',
            padding: 12,
            overflow: 'hidden',
            minHeight: 200,
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E5E5',
        borderRadius: 4,
        overflow: 'hidden',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        display: 'flex',
        minHeight: 500,
      }}
    >
      {/* Left sidebar */}
      <div
        style={{
          width: '30%',
          background: '#1A1A1A',
          color: '#FFFFFF',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* Photo placeholder */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            margin: '0 auto',
          }}
        >
          👤
        </div>

        {/* Contact */}
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              marginBottom: 10,
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            Contact
          </div>
          <div style={{ fontSize: 12, lineHeight: 2, color: 'rgba(255,255,255,0.85)' }}>
            <div>📧 {cv.email}</div>
            <div>📱 {cv.phone}</div>
            <div>📍 {cv.city}</div>
          </div>
        </div>

        {/* Skills */}
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              marginBottom: 10,
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            Compétences
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {cv.skills.map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: 12, marginBottom: 3, color: 'rgba(255,255,255,0.85)' }}>
                  {s.label}
                </div>
                <div
                  style={{
                    height: 5,
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.15)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${s.level}%`,
                      background: '#FFFFFF',
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              marginBottom: 10,
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            Langues
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {cv.languages.map((l) => (
              <div
                key={l.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.85)',
                }}
              >
                <span>{l.label}</span>
                {renderDots(l.level)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right content */}
      <div
        style={{
          width: '70%',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* Name + Title */}
        <div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#1A1A1A',
              marginBottom: 4,
            }}
          >
            {cv.name}
          </div>
          <div style={{ fontSize: 14, color: '#6B6B6B' }}>{cv.title}</div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#E5E5E5' }} />

        {/* Experience */}
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1,
              color: '#1A1A1A',
              marginBottom: 12,
            }}
          >
            Expérience
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {cv.experience.map((exp, i) => (
              <div key={i}>
                <div style={{ fontSize: 11, color: '#9B9B9B', marginBottom: 2 }}>
                  {exp.date}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>
                  {exp.title}
                </div>
                <div style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 4 }}>
                  {exp.company}
                </div>
                <div style={{ fontSize: 13, color: '#4A4A4A', lineHeight: 1.5 }}>
                  {exp.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1,
              color: '#1A1A1A',
              marginBottom: 12,
            }}
          >
            Formation
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cv.education.map((edu, i) => (
              <div key={i}>
                <div style={{ fontSize: 11, color: '#9B9B9B', marginBottom: 2 }}>
                  {edu.date}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>
                  {edu.title}
                </div>
                <div style={{ fontSize: 13, color: '#6B6B6B' }}>
                  {edu.school}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
