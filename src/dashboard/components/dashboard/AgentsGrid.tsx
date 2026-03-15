'use client';

import React from 'react';

interface Agent {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface AgentsGridProps {
  agents: Agent[];
  onAgentClick: (agentId: string) => void;
}

export default function AgentsGrid({ agents, onAgentClick }: AgentsGridProps) {
  if (agents.length === 0) {
    return (
      <div
        style={{
          padding: '24px',
          border: '1px solid #E5E5E5',
          borderRadius: 8,
          background: '#FAFAFA',
          textAlign: 'center',
          color: '#9B9B9B',
          fontSize: 13,
        }}
      >
        Aucun agent disponible
      </div>
    );
  }

  return (
    <div
      style={{
        border: '1px solid #E5E5E5',
        borderRadius: 8,
        background: '#FFFFFF',
        padding: '20px 24px',
      }}
    >
      <h2
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: '#1A1A1A',
          margin: '0 0 16px',
        }}
      >
        🤖 Agents
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 12,
        }}
      >
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} onClick={() => onAgentClick(agent.id)} />
        ))}
      </div>
    </div>
  );
}

function AgentCard({ agent, onClick }: { agent: Agent; onClick: () => void }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '14px 16px',
        borderRadius: 6,
        border: '1px solid #E5E5E5',
        background: hovered ? '#FAFAFA' : '#FFFFFF',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.15s',
        width: '100%',
      }}
    >
      <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>{agent.icon}</span>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: '#1A1A1A',
            marginBottom: 2,
          }}
        >
          {agent.name}
        </div>
        <div
          style={{
            fontSize: 12,
            color: '#6B6B6B',
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {agent.description}
        </div>
      </div>
    </button>
  );
}
