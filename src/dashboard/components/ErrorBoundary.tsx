'use client';

import React from 'react';

// ═══════════════════════════════════════════════════
//   SARAH OS — Error Boundary
//   Catches render errors and displays a friendly UI
// ═══════════════════════════════════════════════════

// ── Types ──

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
}

// ── Error Boundary Class Component ──

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to console in development
    if (typeof window !== 'undefined') {
      console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, showDetails: false });
  };

  toggleDetails = (): void => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    // Allow custom fallback
    if (this.props.fallback) {
      return this.props.fallback;
    }

    const { error, showDetails } = this.state;

    return (
      <div style={styles.container}>
        <div style={styles.card}>
          {/* Icon */}
          <div style={styles.iconWrapper}>
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: '#ef4444' }}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          {/* Title */}
          <h2 style={styles.title}>Quelque chose s&apos;est mal pass&eacute;</h2>
          <p style={styles.subtitle}>
            Une erreur inattendue est survenue. Vous pouvez r&eacute;essayer ou signaler le probl&egrave;me.
          </p>

          {/* Actions */}
          <div style={styles.actions}>
            <button onClick={this.handleReset} style={styles.retryButton}>
              R&eacute;essayer
            </button>
            <a
              href="mailto:support@sarah-os.com?subject=Rapport%20d%27erreur%20SARAH%20OS"
              style={styles.reportLink}
            >
              Signaler
            </a>
          </div>

          {/* Expandable error details */}
          {error && (
            <div style={styles.detailsContainer}>
              <button onClick={this.toggleDetails} style={styles.detailsToggle}>
                <span style={styles.detailsToggleIcon}>
                  {showDetails ? '\u25BC' : '\u25B6'}
                </span>
                D&eacute;tails de l&apos;erreur
              </button>
              {showDetails && (
                <div style={styles.detailsContent}>
                  <code style={styles.errorCode}>
                    {error.name}: {error.message}
                  </code>
                  {error.stack && (
                    <pre style={styles.errorStack}>{error.stack}</pre>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}

// ── HOC Wrapper ──

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>,
): React.FC<P> {
  const WrappedComponent: React.FC<P> = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  const displayName = Component.displayName || Component.name || 'Component';
  WrappedComponent.displayName = `withErrorBoundary(${displayName})`;

  return WrappedComponent;
}

// ── Styles ──

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
    padding: 24,
    width: '100%',
  },
  card: {
    backgroundColor: 'var(--card-bg, #1a1a2e)',
    border: '1px solid var(--border, #2a2a3e)',
    borderRadius: 16,
    padding: '40px 32px',
    maxWidth: 520,
    width: '100%',
    textAlign: 'center',
  },
  iconWrapper: {
    marginBottom: 20,
    display: 'flex',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--text, #e0e0f0)',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: 14,
    color: 'var(--text-muted, #a0a0b8)',
    margin: '0 0 24px 0',
    lineHeight: 1.5,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: 'var(--accent, #6366f1)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '10px 24px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  reportLink: {
    color: 'var(--text-muted, #a0a0b8)',
    fontSize: 14,
    textDecoration: 'none',
    padding: '10px 16px',
    borderRadius: 8,
    border: '1px solid var(--border, #2a2a3e)',
    transition: 'color 0.2s, border-color 0.2s',
  },
  detailsContainer: {
    borderTop: '1px solid var(--border, #2a2a3e)',
    paddingTop: 16,
    textAlign: 'left',
  },
  detailsToggle: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted, #a0a0b8)',
    fontSize: 13,
    cursor: 'pointer',
    padding: '4px 0',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontWeight: 500,
  },
  detailsToggleIcon: {
    fontSize: 10,
    lineHeight: 1,
  },
  detailsContent: {
    marginTop: 12,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    border: '1px solid var(--border, #2a2a3e)',
    overflow: 'auto',
    maxHeight: 300,
  },
  errorCode: {
    color: '#ef4444',
    fontSize: 13,
    fontFamily: 'monospace',
    wordBreak: 'break-all',
    display: 'block',
    marginBottom: 8,
  },
  errorStack: {
    color: 'var(--text-muted, #a0a0b8)',
    fontSize: 11,
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    margin: 0,
    lineHeight: 1.6,
  },
};

export default ErrorBoundary;
