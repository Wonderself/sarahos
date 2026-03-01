import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: { label: string; variant?: string };
  actions?: React.ReactNode;
  backHref?: string;
}

export default function PageHeader({ title, subtitle, badge, actions, backHref }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="flex items-center gap-12">
        {backHref && (
          <Link href={backHref} className="btn btn-ghost btn-icon" aria-label="Retour">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </Link>
        )}
        <div>
          <div className="flex items-center gap-8">
            <h1 className="page-title">{title}</h1>
            {badge && (
              <span className={`badge ${badge.variant || 'badge-accent'}`}>{badge.label}</span>
            )}
          </div>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}
