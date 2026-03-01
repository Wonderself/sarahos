interface TestimonialCardProps {
  name: string;
  company: string;
  role: string;
  quote: string;
  rating: number;
  avatarColor?: string;
}

export default function TestimonialCard({
  name, company, role, quote, rating, avatarColor = '#6366f1',
}: TestimonialCardProps) {
  const initials = name.split(' ').map(n => n[0]).join('');

  return (
    <div className="card card-lift" style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Stars */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill={i < rating ? '#f59e0b' : '#e5e7eb'}>
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        ))}
      </div>

      {/* Quote */}
      <p style={{
        flex: 1, fontSize: 14, lineHeight: 1.7,
        color: 'var(--text-secondary)', fontStyle: 'italic',
        margin: '0 0 20px 0',
      }}>
        &laquo;&nbsp;{quote}&nbsp;&raquo;
      </p>

      {/* Author */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: avatarColor, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 14,
        }}>
          {initials}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{role}, {company}</div>
        </div>
      </div>
    </div>
  );
}
