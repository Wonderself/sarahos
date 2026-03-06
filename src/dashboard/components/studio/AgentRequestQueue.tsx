'use client';

import { useState, useEffect } from 'react';
import {
  type StudioRequest,
  getRequestsByType,
  startWorkOnRequest,
  fulfillRequest,
  cancelRequest,
  deleteRequest,
  formatRequestAge,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
} from '../../lib/studio-requests';

interface AgentRequestQueueProps {
  type: 'photo' | 'video';
  activeRequestId: string | null;
  completedMediaUrl: string | null; // current generated media URL, to assign to a request
  onTakeRequest: (req: StudioRequest) => void; // loads request into workspace
  onRequestFulfilled?: () => void;
}

export default function AgentRequestQueue({
  type,
  activeRequestId,
  completedMediaUrl,
  onTakeRequest,
  onRequestFulfilled,
}: AgentRequestQueueProps) {
  const [requests, setRequests] = useState<StudioRequest[]>([]);
  const [expanded, setExpanded] = useState(true);
  const [fulfilling, setFulfilling] = useState<string | null>(null);

  const reload = () => {
    setRequests(getRequestsByType(type).filter(r => r.status !== 'cancelled'));
  };

  useEffect(() => { reload(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pending = requests.filter(r => r.status === 'pending' || r.status === 'in-progress');
  const completed = requests.filter(r => r.status === 'completed');

  if (requests.length === 0) return null;

  const handleTake = (req: StudioRequest) => {
    startWorkOnRequest(req.id);
    reload();
    onTakeRequest(req);
  };

  const handleFulfill = (req: StudioRequest) => {
    if (!completedMediaUrl) return;
    setFulfilling(req.id);
    setTimeout(() => {
      fulfillRequest(req.id, [completedMediaUrl]);
      reload();
      setFulfilling(null);
      onRequestFulfilled?.();
    }, 500);
  };

  const handleCancel = (id: string) => {
    cancelRequest(id);
    reload();
  };

  const handleDelete = (id: string) => {
    deleteRequest(id);
    reload();
  };

  return (
    <div style={{ borderTop: '1px solid #e5e7eb', background: 'white' }}>
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', padding: '10px 16px', background: 'none', border: 'none',
          cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: expanded ? '1px solid #f3f4f6' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-symbols-rounded" style={{ fontSize: 14 }}>inbox</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#1d1d1f' }}>
            Demandes d&apos;agents
          </span>
          {pending.length > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 700, background: '#ef4444', color: 'white',
              padding: '1px 7px', borderRadius: 10,
            }}>
              {pending.length}
            </span>
          )}
          {completed.length > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 600, color: '#10b981',
              padding: '1px 7px', borderRadius: 10, background: '#d1fae5',
            }}>
              {completed.length} complété{completed.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <span style={{ fontSize: 10, color: '#9ca3af' }}>
          {expanded ? '▲ Masquer' : '▼ Afficher'}
        </span>
      </button>

      {expanded && (
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Pending / In-progress requests */}
          {pending.map(req => {
            const isActive = req.id === activeRequestId;
            const canFulfill = isActive && !!completedMediaUrl;
            const isFulfilling = fulfilling === req.id;

            return (
              <div
                key={req.id}
                style={{
                  borderRadius: 10, border: `1px solid ${isActive ? req.agentColor + '60' : '#e5e7eb'}`,
                  background: isActive ? req.agentColor + '08' : 'white',
                  overflow: 'hidden',
                  boxShadow: isActive ? `0 0 0 2px ${req.agentColor}20` : 'none',
                }}
              >
                {/* Card header */}
                <div style={{
                  padding: '10px 12px', display: 'flex', alignItems: 'flex-start', gap: 10,
                  borderBottom: '1px solid #f3f4f6',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: req.agentColor + '18', border: `1px solid ${req.agentColor}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16,
                  }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 16 }}>{req.agentEmoji}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#1d1d1f' }}>
                        {req.agentName}
                      </span>
                      {req.priority && req.priority !== 'normal' && (
                        <span style={{
                          fontSize: 9, fontWeight: 700,
                          color: PRIORITY_COLORS[req.priority] || '#6b7280',
                          background: (PRIORITY_COLORS[req.priority] || '#6b7280') + '15',
                          padding: '1px 6px', borderRadius: 6,
                        }}>
                          {PRIORITY_LABELS[req.priority]}
                        </span>
                      )}
                      {isActive && (
                        <span style={{
                          fontSize: 9, fontWeight: 700, color: '#5b6cf7',
                          background: '#5b6cf715', padding: '1px 6px', borderRadius: 6,
                        }}>
                          En cours
                        </span>
                      )}
                      <span style={{ fontSize: 9, color: '#9ca3af', marginLeft: 'auto' }}>
                        {formatRequestAge(req.createdAt)}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginTop: 2 }}>
                      {req.title}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div style={{ padding: '8px 12px' }}>
                  <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5, marginBottom: 8 }}>
                    {req.description}
                  </div>

                  {/* Specs */}
                  {(req.specs.style || req.specs.dimensions || req.specs.quantity) && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                      {req.specs.quantity && (
                        <span style={{
                          fontSize: 9, background: '#f3f4f6', color: '#374151',
                          padding: '2px 8px', borderRadius: 8, fontWeight: 600,
                        }}>
                          {req.specs.quantity}× {type === 'photo' ? 'image' : 'vidéo'}{req.specs.quantity > 1 ? 's' : ''}
                        </span>
                      )}
                      {req.specs.style && (
                        <span style={{
                          fontSize: 9, background: '#f5f3ff', color: '#7c3aed',
                          padding: '2px 8px', borderRadius: 8, fontWeight: 600,
                        }}>
                          Style: {req.specs.style}
                        </span>
                      )}
                      {req.specs.dimensions && (
                        <span style={{
                          fontSize: 9, background: '#f0f9ff', color: '#0284c7',
                          padding: '2px 8px', borderRadius: 8, fontWeight: 600,
                        }}>
                          {req.specs.dimensions}
                        </span>
                      )}
                      {req.specs.format && (
                        <span style={{
                          fontSize: 9, background: '#fef3c7', color: '#92400e',
                          padding: '2px 8px', borderRadius: 8, fontWeight: 600,
                        }}>
                          {req.specs.format}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {!isActive ? (
                      <button
                        onClick={() => handleTake(req)}
                        style={{
                          padding: '6px 14px', borderRadius: 7, border: 'none', fontSize: 11,
                          fontWeight: 700, cursor: 'pointer',
                          background: req.agentColor || '#5b6cf7', color: 'white',
                        }}
                      >
                        Prendre en charge
                      </button>
                    ) : canFulfill ? (
                      <button
                        onClick={() => handleFulfill(req)}
                        disabled={isFulfilling}
                        style={{
                          padding: '6px 14px', borderRadius: 7, border: 'none', fontSize: 11,
                          fontWeight: 700, cursor: isFulfilling ? 'wait' : 'pointer',
                          background: isFulfilling ? '#94a3b8' : '#10b981', color: 'white',
                        }}
                      >
                        {isFulfilling ? <><span className="material-symbols-rounded" style={{ fontSize: 11 }}>hourglass_empty</span> Envoi...</> : <><span className="material-symbols-rounded" style={{ fontSize: 11 }}>check_circle</span> Valider &amp; envoyer à {req.agentName.replace('Agent ', '')}</>}
                      </button>
                    ) : (
                      <span style={{ fontSize: 11, color: '#5b6cf7', fontStyle: 'italic', padding: '6px 0' }}>
                        Générez un média pour valider cette demande
                      </span>
                    )}

                    <button
                      onClick={() => handleCancel(req.id)}
                      style={{
                        padding: '6px 10px', borderRadius: 7, border: '1px solid #e5e7eb',
                        background: 'white', color: '#6b7280', fontSize: 11, cursor: 'pointer',
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Completed requests (collapsed) */}
          {completed.length > 0 && (
            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                Complétées ({completed.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {completed.map(req => (
                  <div key={req.id} style={{
                    padding: '6px 10px', borderRadius: 8, background: '#f9fafb',
                    border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 12 }}>{req.agentEmoji}</span>
                    <span style={{ fontSize: 11, color: '#6b7280', flex: 1 }}>
                      {req.title}
                    </span>
                    <span style={{ fontSize: 10, color: '#10b981', fontWeight: 600 }}><span className="material-symbols-rounded" style={{ fontSize: 10 }}>check</span> Envoyé</span>
                    <button
                      onClick={() => handleDelete(req.id)}
                      style={{
                        fontSize: 10, color: '#9ca3af', background: 'none', border: 'none',
                        cursor: 'pointer', padding: 0,
                      }}
                      title="Supprimer"
                    >
                      <span className="material-symbols-rounded" style={{ fontSize: 10 }}>close</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
