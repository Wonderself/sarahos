'use client';

/**
 * SARAH OS — Optimized Image Component
 * Lazy loading via IntersectionObserver, placeholder support, fade-in animation.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';

// ── Types ──

interface ImageSource {
  src: string;
  width: number;
}

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  lazy?: boolean;
  placeholder?: 'blur' | 'skeleton';
  className?: string;
  style?: React.CSSProperties;
  fallback?: React.ReactNode;
  srcSet?: ImageSource[];
  onLoad?: () => void;
  onError?: () => void;
}

// ── Placeholder Styles ──

const skeletonKeyframes = `
@keyframes sarah-skeleton-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}
`;

const fadeInKeyframes = `
@keyframes sarah-image-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
`;

let stylesInjected = false;

function injectStyles(): void {
  if (stylesInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = skeletonKeyframes + fadeInKeyframes;
  document.head.appendChild(style);
  stylesInjected = true;
}

// ── Broken Image Fallback ──

function BrokenImageIcon({ width, height }: { width?: number; height?: number }) {
  return (
    <div
      style={{
        width: width ?? 100,
        height: height ?? 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        color: '#999',
        fontSize: 14,
      }}
      role="img"
      aria-label="Image failed to load"
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
        <line x1="2" y1="2" x2="22" y2="22" />
      </svg>
    </div>
  );
}

// ── Component ──

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  lazy = true,
  placeholder = 'skeleton',
  className,
  style,
  fallback,
  srcSet,
  onLoad: onLoadProp,
  onError: onErrorProp,
}: OptimizedImageProps) {
  const [isInView, setIsInView] = useState(!lazy);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Inject global keyframe styles once
  useEffect(() => {
    injectStyles();
  }, []);

  // IntersectionObserver for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    const element = containerRef.current;
    if (!element) return;

    // Fallback for environments without IntersectionObserver
    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(element);
          }
        }
      },
      { rootMargin: '200px', threshold: 0.01 },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [lazy, isInView]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
    onLoadProp?.();
  }, [onLoadProp]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(false);
    onErrorProp?.();
  }, [onErrorProp]);

  // Build srcSet string from array of sources
  const srcSetString = srcSet
    ? srcSet.map((s) => `${s.src} ${s.width}w`).join(', ')
    : undefined;

  // Placeholder rendering
  const renderPlaceholder = () => {
    if (isLoaded || hasError) return null;

    if (placeholder === 'blur') {
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
            opacity: isLoaded ? 0 : 1,
            transition: 'opacity 0.3s ease',
          }}
          aria-hidden="true"
        />
      );
    }

    // Skeleton placeholder
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#e0e0e0',
          animation: 'sarah-skeleton-pulse 1.5s ease-in-out infinite',
          borderRadius: 'inherit',
        }}
        aria-hidden="true"
      />
    );
  };

  // Error fallback rendering
  if (hasError) {
    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          position: 'relative',
          width: width ?? 'auto',
          height: height ?? 'auto',
          overflow: 'hidden',
          ...style,
        }}
      >
        {fallback ?? <BrokenImageIcon width={width} height={height} />}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        width: width ?? 'auto',
        height: height ?? 'auto',
        overflow: 'hidden',
        ...style,
      }}
    >
      {renderPlaceholder()}
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          width={width}
          height={height}
          srcSet={srcSetString}
          sizes={srcSet ? `${width ?? 100}px` : undefined}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isLoaded ? 1 : 0,
            animation: isLoaded ? 'sarah-image-fade-in 0.3s ease forwards' : 'none',
            transition: 'opacity 0.3s ease',
          }}
        />
      )}
    </div>
  );
}
