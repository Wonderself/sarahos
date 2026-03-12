interface TestimonialCardProps {
  name: string;
  company: string;
  role: string;
  quote: string;
  rating: number;
  avatarColor?: string;
}

export default function TestimonialCard({
  name, company, role, quote, rating, avatarColor = '#1A1A1A',
}: TestimonialCardProps) {
  const initials = name.split(' ').map(n => n[0]).join('');

  return (
    <div style={{
      padding: 28, height: '100%', display: 'flex', flexDirection: 'column',
      borderRadius: 20, background: '#fafafa',
    }}>
      {/* Stars */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 18 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < rating ? '#9B9B9B' : '#e5e7eb'}>
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        ))}
      </div>

      {/* Quote */}
      <p style={{
        flex: 1, fontSize: 14, lineHeight: 1.7,
        color: '#6b7280', fontStyle: 'italic',
        margin: '0 0 24px 0',
      }}>
        &laquo;&nbsp;{quote}&nbsp;&raquo;
      </p>

      {/* Author */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: avatarColor, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 600, fontSize: 13,
        }}>
          {initials}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{name}</div>
          <div style={{ fontSize: 12, color: '#9B9B9B' }}>{role}, {company}</div>
        </div>
      </div>
    </div>
  );
}
