'use client';

import Link from 'next/link';
import type { HomeScreenApp } from '../lib/home-screen-apps';

interface HomeScreenIconProps {
  app: HomeScreenApp;
  isEditing?: boolean;
  badgeCount?: number;
  onLongPress?: () => void;
  onHide?: (id: string) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  isDragOver?: boolean;
}

export default function HomeScreenIcon({
  app,
  isEditing = false,
  badgeCount,
  onLongPress,
  onHide,
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging = false,
  isDragOver = false,
}: HomeScreenIconProps) {
  const longPressTimer = { current: null as ReturnType<typeof setTimeout> | null };

  const handlePointerDown = () => {
    if (!onLongPress) return;
    longPressTimer.current = setTimeout(() => {
      onLongPress();
    }, 400);
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handlePointerLeave = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const iconContent = (
    <div
      className={`hs-icon${isDragging ? ' hs-dragging' : ''}${isDragOver ? ' hs-drag-over' : ''}`}
      draggable={draggable}
      onDragStart={onDragStart ? (e) => onDragStart(e, app.id) : undefined}
      onDragOver={onDragOver ? (e) => { e.preventDefault(); onDragOver(e, app.id); } : undefined}
      onDrop={onDrop ? (e) => onDrop(e, app.id) : undefined}
      onDragEnd={onDragEnd}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      <div
        className="hs-icon-box"
        style={{
          background: `linear-gradient(135deg, ${app.gradient[0]}, ${app.gradient[1]})`,
        }}
      >
        <span
          className="material-symbols-rounded"
          style={{ fontSize: 26, color: '#fff' }}
        >
          {app.icon}
        </span>

        {/* Badge */}
        {badgeCount !== undefined && badgeCount > 0 && (
          <span className="hs-badge">
            {badgeCount > 99 ? '99+' : badgeCount}
          </span>
        )}

        {/* Hide button in edit mode */}
        {isEditing && onHide && (
          <button
            className="hs-hide-btn"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onHide(app.id); }}
            aria-label={`Masquer ${app.label}`}
          >
            <span className="material-symbols-rounded" style={{ fontSize: 14, color: '#fff' }}>close</span>
          </button>
        )}
      </div>

      <span className="hs-icon-label">{app.label}</span>
    </div>
  );

  if (isEditing) return iconContent;

  return (
    <Link href={app.href} style={{ textDecoration: 'none' }}>
      {iconContent}
    </Link>
  );
}
