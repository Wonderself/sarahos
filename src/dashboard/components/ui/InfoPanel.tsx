interface InfoPanelProps {
  variant?: 'info' | 'success' | 'warning' | 'danger' | 'accent';
  icon?: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const variantMap: Record<string, string> = {
  info: 'info-card-info',
  success: 'info-card-success',
  warning: 'info-card-warning',
  danger: 'info-card-danger',
  accent: '',
};

export default function InfoPanel({ variant = 'accent', icon, title, children, className = '' }: InfoPanelProps) {
  return (
    <div className={`info-card ${variantMap[variant] || ''} ${className}`}>
      {(icon || title) && (
        <div className="flex items-center gap-8 mb-8">
          {icon && <span className="text-lg">{icon}</span>}
          {title && <span className="font-semibold text-base">{title}</span>}
        </div>
      )}
      <div className="text-md text-secondary leading-relaxed">{children}</div>
    </div>
  );
}
