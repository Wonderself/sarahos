'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import HeroSection from './HeroSection';
import AgentsGrid from './AgentsGrid';
import ApprovalWidget from './ApprovalWidget';
import MetricsWidget from './MetricsWidget';
import QuickActions from './QuickActions';
import OnboardingChecklist from './OnboardingChecklist';
import ResetDashboardButton from './ResetDashboardButton';

// ─── Types ──────────────────────────────────────────────────
interface DashboardSection {
  id: string;
  type: string;
  visible: boolean;
  props: Record<string, unknown>;
}

interface DashboardConfig {
  sections: DashboardSection[];
  greeting: string;
  subtitle: string;
  accentColor: string;
}

interface DashboardLayoutProps {
  userId: string;
  profession: string;
  orgId?: string;
}

// ─── Sortable wrapper ───────────────────────────────────────
function SortableSection({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        {...attributes}
        {...listeners}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          cursor: 'grab',
          padding: '4px 8px',
          borderRadius: 4,
          background: '#FAFAFA',
          border: '1px solid #E5E5E5',
          fontSize: 12,
          color: '#9B9B9B',
          zIndex: 2,
          userSelect: 'none',
        }}
        title="Glisser pour réorganiser"
      >
        ⠿
      </div>
      {children}
    </div>
  );
}

// ─── Default config ─────────────────────────────────────────
const DEFAULT_CONFIG: DashboardConfig = {
  sections: [
    { id: 'hero', type: 'hero', visible: true, props: {} },
    { id: 'quick-actions', type: 'quick-actions', visible: true, props: {} },
    { id: 'metrics', type: 'metrics', visible: true, props: {} },
    { id: 'agents', type: 'agents', visible: true, props: {} },
    { id: 'approvals', type: 'approvals', visible: true, props: {} },
    { id: 'onboarding', type: 'onboarding', visible: true, props: {} },
  ],
  greeting: 'Bonjour',
  subtitle: 'Votre tableau de bord personnel',
  accentColor: '#1A1A1A',
};

// ─── Component ──────────────────────────────────────────────
export default function DashboardLayout({ userId, profession, orgId }: DashboardLayoutProps) {
  const [config, setConfig] = useState<DashboardConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Fetch config on mount
  useEffect(() => {
    const params = new URLSearchParams({ userId, profession });
    if (orgId) params.set('orgId', orgId);

    fetch(`/api/dashboard/config?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Erreur chargement configuration');
        return res.json();
      })
      .then((data: DashboardConfig) => {
        setConfig(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [userId, profession, orgId]);

  // Drag end handler — reorder sections
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setConfig((prev) => {
        const oldIndex = prev.sections.findIndex((s) => s.id === active.id);
        const newIndex = prev.sections.findIndex((s) => s.id === over.id);
        const newSections = arrayMove(prev.sections, oldIndex, newIndex);
        return { ...prev, sections: newSections };
      });
    },
    []
  );

  // Render a section by type
  const renderSection = (section: DashboardSection) => {
    if (!section.visible) return null;

    switch (section.type) {
      case 'hero':
        return (
          <HeroSection
            greeting={config.greeting}
            subtitle={config.subtitle}
            accentColor={config.accentColor}
            userName={String(section.props['userName'] ?? '')}
            profession={profession}
          />
        );
      case 'agents':
        return (
          <AgentsGrid
            agents={(section.props['agents'] as Array<{ id: string; name: string; icon: string; description: string }>) ?? []}
            onAgentClick={() => {}}
          />
        );
      case 'approvals':
        return (
          <ApprovalWidget
            approvals={(section.props['approvals'] as Array<{ id: string; title: string; requester: string; date: string; type: string }>) ?? []}
          />
        );
      case 'metrics':
        return (
          <MetricsWidget
            metrics={(section.props['metrics'] as Array<{ label: string; value: string; change: number; icon: string }>) ?? []}
          />
        );
      case 'quick-actions':
        return (
          <QuickActions
            actions={(section.props['actions'] as Array<{ label: string; icon: string; href: string }>) ?? []}
          />
        );
      case 'onboarding':
        return (
          <OnboardingChecklist
            steps={(section.props['steps'] as Array<{ label: string; completed: boolean }>) ?? []}
            onComplete={() => {}}
          />
        );
      default:
        return null;
    }
  };

  // ─── Loading state ──────────────────────────────────
  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#9B9B9B', fontSize: 14 }}>
        Chargement du tableau de bord...
      </div>
    );
  }

  // ─── Error state ────────────────────────────────────
  if (error) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: '#DC2626', fontSize: 14, marginBottom: 12 }}>{error}</p>
        <ResetDashboardButton />
      </div>
    );
  }

  const visibleSections = config.sections.filter((s) => s.visible);

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '24px 20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#1A1A1A',
        background: '#FFFFFF',
        minHeight: '100vh',
      }}
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={visibleSections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {visibleSections.map((section) => (
              <SortableSection key={section.id} id={section.id}>
                {renderSection(section)}
              </SortableSection>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }}>
        <ResetDashboardButton />
      </div>
    </div>
  );
}
