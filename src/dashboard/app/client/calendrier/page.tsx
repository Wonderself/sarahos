'use client';

import { useState, useEffect, useMemo } from 'react';
import { useIsMobile } from '../../../lib/use-media-query';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';

// ═══════════════════════════════════════════════════
//  Freenzy.io — Calendrier
// ═══════════════════════════════════════════════════

const STORAGE_KEY = 'fz_calendar';

interface CalEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM or ''
  color: string;
  description: string;
}

const EVENT_COLORS = ['#3B82F6', '#EF4444', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];
const MONTH_NAMES = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

function uid(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

function loadEvents(): CalEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* */ }
  return [];
}

function saveEvents(events: CalEvent[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(events)); } catch { /* */ }
}

function seedEvents(): CalEvent[] {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const events: CalEvent[] = [
    { id: uid(), title: 'Réunion équipe', date: `${y}-${String(m + 1).padStart(2, '0')}-${String(Math.min(now.getDate() + 1, 28)).padStart(2, '0')}`, time: '10:00', color: '#3B82F6', description: 'Point hebdomadaire avec toute l\'équipe' },
    { id: uid(), title: 'Déjeuner client', date: `${y}-${String(m + 1).padStart(2, '0')}-${String(Math.min(now.getDate() + 3, 28)).padStart(2, '0')}`, time: '12:30', color: '#22C55E', description: 'Restaurant Le Petit Bistrot' },
    { id: uid(), title: 'Deadline projet', date: `${y}-${String(m + 1).padStart(2, '0')}-${String(Math.min(now.getDate() + 5, 28)).padStart(2, '0')}`, time: '18:00', color: '#EF4444', description: 'Livraison du prototype V2' },
    { id: uid(), title: 'Sport', date: `${y}-${String(m + 1).padStart(2, '0')}-${String(Math.max(now.getDate() - 1, 1)).padStart(2, '0')}`, time: '07:00', color: '#F59E0B', description: 'Salle de sport - cardio' },
    { id: uid(), title: 'Anniversaire Marie', date: `${y}-${String(m + 1).padStart(2, '0')}-${String(Math.min(now.getDate() + 7, 28)).padStart(2, '0')}`, time: '', color: '#EC4899', description: 'Ne pas oublier le cadeau !' },
  ];
  saveEvents(events);
  return events;
}

function getMonthDays(year: number, month: number): { date: Date; isCurrentMonth: boolean }[] {
  const firstDay = new Date(year, month, 1);
  // Monday = 0 in our grid
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;
  const days: { date: Date; isCurrentMonth: boolean }[] = [];
  // Days from prev month
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: d, isCurrentMonth: false });
  }
  // Days of current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ date: new Date(year, month, i), isCurrentMonth: true });
  }
  // Fill to 42 (6 rows)
  while (days.length < 42) {
    const d = new Date(year, month + 1, days.length - startDow - daysInMonth + 1);
    days.push({ date: d, isCurrentMonth: false });
  }
  return days;
}

function dateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

type ViewMode = 'month' | 'week' | 'list';

export default function CalendrierPage() {
  const isMobile = useIsMobile();
  const meta = PAGE_META['calendrier'];
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>('month');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formColor, setFormColor] = useState(EVENT_COLORS[0]);
  const [formDesc, setFormDesc] = useState('');

  useEffect(() => {
    setMounted(true);
    const loaded = loadEvents();
    setEvents(loaded.length > 0 ? loaded : seedEvents());
  }, []);

  const persist = (updated: CalEvent[]) => { setEvents(updated); saveEvents(updated); };
  const todayStr = dateStr(new Date());

  const openForm = (date?: string, ev?: CalEvent) => {
    setFormTitle(ev?.title || '');
    setFormDate(ev?.date || date || todayStr);
    setFormTime(ev?.time || '');
    setFormColor(ev?.color || EVENT_COLORS[0]);
    setFormDesc(ev?.description || '');
    setEditId(ev?.id || null);
    setShowForm(true);
  };

  const saveEvent = () => {
    if (!formTitle.trim() || !formDate) return;
    if (editId) {
      persist(events.map(e => e.id === editId ? { ...e, title: formTitle.trim(), date: formDate, time: formTime, color: formColor, description: formDesc } : e));
    } else {
      const ev: CalEvent = { id: uid(), title: formTitle.trim(), date: formDate, time: formTime, color: formColor, description: formDesc };
      persist([...events, ev]);
    }
    setShowForm(false); setEditId(null);
  };

  const deleteEvent = (id: string) => { persist(events.filter(e => e.id !== id)); };

  const monthDays = useMemo(() => getMonthDays(year, month), [year, month]);

  const eventsMap = useMemo(() => {
    const map: Record<string, CalEvent[]> = {};
    events.forEach(e => { if (!map[e.date]) map[e.date] = []; map[e.date].push(e); });
    return map;
  }, [events]);

  const selectedEvents = selectedDate ? (eventsMap[selectedDate] || []).sort((a, b) => a.time.localeCompare(b.time)) : [];

  // Week view
  const weekDays = useMemo(() => {
    const d = new Date(year, month, new Date().getDate());
    const dow = d.getDay() === 0 ? 6 : d.getDay() - 1;
    const monday = new Date(d);
    monday.setDate(d.getDate() - dow);
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      return day;
    });
  }, [year, month]);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };

  if (!mounted) return null;

  const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-primary)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14 };
  const btnStyle: React.CSSProperties = { padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 };

  return (
    <div style={{ padding: isMobile ? 16 : 32, maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: 28 }}>{meta.emoji}</span>
        <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{meta.title}</h1>
        <PageExplanation pageId="calendrier" text={meta.helpText} />
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 14 }}>{meta.subtitle}</p>

      {/* Nav + view toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={prevMonth} style={{ ...btnStyle, background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)', padding: '6px 12px' }}>◀</button>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', minWidth: 180, textAlign: 'center' }}>{MONTH_NAMES[month]} {year}</span>
          <button onClick={nextMonth} style={{ ...btnStyle, background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)', padding: '6px 12px' }}>▶</button>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['month', 'week', 'list'] as ViewMode[]).map(v => (
            <button key={v} onClick={() => setView(v)} style={{ ...btnStyle, background: view === v ? 'var(--accent)' : 'var(--bg-secondary)', color: view === v ? '#fff' : 'var(--text-secondary)', border: view === v ? 'none' : '1px solid var(--border-primary)', fontSize: 13, padding: '6px 14px' }}>
              {v === 'month' ? 'Mois' : v === 'week' ? 'Semaine' : 'Liste'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, flexDirection: isMobile ? 'column' : 'row' }}>
        {/* Calendar grid area */}
        <div style={{ flex: 1 }}>
          {view === 'month' && (
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: isMobile ? 8 : 16, border: '1px solid var(--border-primary)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                {DAY_NAMES.map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', padding: 6 }}>{d}</div>
                ))}
                {monthDays.map(({ date, isCurrentMonth }, i) => {
                  const ds = dateStr(date);
                  const isToday = ds === todayStr;
                  const isSelected = ds === selectedDate;
                  const dayEvents = eventsMap[ds] || [];
                  return (
                    <div key={i} onClick={() => setSelectedDate(ds)} style={{ minHeight: isMobile ? 40 : 64, padding: 4, borderRadius: 8, cursor: 'pointer', background: isSelected ? 'var(--accent)' + '22' : 'var(--bg-primary)', border: isToday ? '2px solid var(--accent)' : isSelected ? '2px solid var(--accent)' : '1px solid transparent', opacity: isCurrentMonth ? 1 : 0.35, transition: 'background 0.15s' }}>
                      <div style={{ fontSize: 13, fontWeight: isToday ? 700 : 400, color: isToday ? 'var(--accent)' : 'var(--text-primary)', textAlign: 'center' }}>{date.getDate()}</div>
                      <div style={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', marginTop: 2 }}>
                        {dayEvents.slice(0, 3).map(ev => (
                          <div key={ev.id} style={{ width: 6, height: 6, borderRadius: '50%', background: ev.color }} />
                        ))}
                      </div>
                      {!isMobile && dayEvents.slice(0, 2).map(ev => (
                        <div key={ev.id} style={{ fontSize: 10, color: ev.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 }}>{ev.time ? ev.time + ' ' : ''}{ev.title}</div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {view === 'week' && (
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: isMobile ? 8 : 16, border: '1px solid var(--border-primary)', overflowX: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: `60px repeat(7, 1fr)`, gap: 1, minWidth: isMobile ? 600 : undefined }}>
                {/* Header */}
                <div />
                {weekDays.map(d => {
                  const ds = dateStr(d);
                  const isToday = ds === todayStr;
                  return (
                    <div key={ds} style={{ textAlign: 'center', padding: 6, fontWeight: isToday ? 700 : 400, color: isToday ? 'var(--accent)' : 'var(--text-primary)', fontSize: 13 }}>
                      {DAY_NAMES[d.getDay() === 0 ? 6 : d.getDay() - 1]} {d.getDate()}
                    </div>
                  );
                })}
                {/* Hours */}
                {HOURS.filter((_, i) => i >= 7 && i <= 21).map(hour => (
                  <>
                    <div key={`h-${hour}`} style={{ fontSize: 11, color: 'var(--text-secondary)', textAlign: 'right', paddingRight: 6, paddingTop: 2 }}>{hour}</div>
                    {weekDays.map(d => {
                      const ds = dateStr(d);
                      const hourEvents = (eventsMap[ds] || []).filter(e => e.time && e.time.startsWith(hour.slice(0, 2)));
                      return (
                        <div key={`${ds}-${hour}`} onClick={() => { setSelectedDate(ds); }} style={{ minHeight: 32, borderTop: '1px solid var(--border-primary)', padding: 2, cursor: 'pointer' }}>
                          {hourEvents.map(ev => (
                            <div key={ev.id} onClick={e => { e.stopPropagation(); openForm(undefined, ev); }} style={{ fontSize: 10, background: ev.color + '33', color: ev.color, borderRadius: 4, padding: '1px 4px', marginBottom: 1, cursor: 'pointer', fontWeight: 600 }}>{ev.title}</div>
                          ))}
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>
            </div>
          )}

          {view === 'list' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {events.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
                  <p>Aucun événement. Ajoutez-en un !</p>
                </div>
              ) : (
                [...events].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)).map(ev => (
                  <div key={ev.id} style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-primary)', borderLeft: `4px solid ${ev.color}` }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{ev.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {new Date(ev.date + 'T00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                        {ev.time ? ` à ${ev.time}` : ''}
                      </div>
                      {ev.description && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{ev.description}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openForm(undefined, ev)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>✏️</button>
                      <button onClick={() => deleteEvent(ev.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, opacity: 0.5 }}>🗑️</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Side panel: selected day */}
        {view !== 'list' && (
          <div style={{ width: isMobile ? '100%' : 300, flexShrink: 0 }}>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: isMobile ? 16 : 20, border: '1px solid var(--border-primary)', position: isMobile ? 'static' : 'sticky', top: 80 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                {selectedDate ? new Date(selectedDate + 'T00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Sélectionnez un jour'}
              </h3>
              {selectedDate && (
                <>
                  {selectedEvents.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Aucun événement ce jour.</p>}
                  {selectedEvents.map(ev => (
                    <div key={ev.id} style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: 10, marginBottom: 8, borderLeft: `3px solid ${ev.color}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{ev.title}</span>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button onClick={() => openForm(undefined, ev)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}>✏️</button>
                          <button onClick={() => deleteEvent(ev.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, opacity: 0.5 }}>🗑️</button>
                        </div>
                      </div>
                      {ev.time && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{ev.time}</div>}
                      {ev.description && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{ev.description}</div>}
                    </div>
                  ))}
                  <button onClick={() => openForm(selectedDate)} style={{ ...btnStyle, background: 'var(--accent)', color: '#fff', width: '100%', marginTop: 8 }}>+ Ajouter</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Event form modal */}
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }} onClick={() => setShowForm(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: 24, maxWidth: 440, width: '100%', border: '1px solid var(--border-primary)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{editId ? 'Modifier' : 'Nouvel'} événement</h3>
            <input placeholder="Titre" value={formTitle} onChange={e => setFormTitle(e.target.value)} style={{ ...inputStyle, marginBottom: 10 }} />
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
              <input type="time" value={formTime} onChange={e => setFormTime(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
            </div>
            <textarea placeholder="Description (optionnel)" value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={3} style={{ ...inputStyle, marginBottom: 10, resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
              {EVENT_COLORS.map(c => (
                <button key={c} onClick={() => setFormColor(c)} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: formColor === c ? '3px solid var(--text-primary)' : '2px solid transparent', cursor: 'pointer' }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{ ...btnStyle, background: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' }}>Annuler</button>
              <button onClick={saveEvent} style={{ ...btnStyle, background: 'var(--accent)', color: '#fff' }}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* Floating add button (list/month views) */}
      {view !== 'list' && !showForm && (
        <button onClick={() => openForm(selectedDate || todayStr)} style={{ position: 'fixed', bottom: 24, right: 24, width: 56, height: 56, borderRadius: '50%', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 24, fontWeight: 700, boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 100 }}>+</button>
      )}
    </div>
  );
}
