'use client';

import { useState, useEffect, useCallback } from 'react';

// ─── Service Worker Registration ───

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined') return null;
  if (!('serviceWorker' in navigator)) {
    console.warn('[PWA] Service workers are not supported in this browser');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated') {
            console.info('[PWA] New service worker activated');
          }
        });
      }
    });

    console.info('[PWA] Service worker registered successfully');
    return registration;
  } catch (error) {
    console.error('[PWA] Service worker registration failed:', error);
    return null;
  }
}

// ─── Install Prompt Utilities ───

let deferredPrompt: BeforeInstallPromptEvent | null = null;

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

export function checkInstallable(
  onInstallable?: () => void,
  onInstalled?: () => void,
): () => void {
  if (typeof window === 'undefined') return () => {};

  function handleBeforeInstallPrompt(e: Event) {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    onInstallable?.();
  }

  function handleAppInstalled() {
    deferredPrompt = null;
    onInstalled?.();
  }

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.addEventListener('appinstalled', handleAppInstalled);

  return () => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.removeEventListener('appinstalled', handleAppInstalled);
  };
}

export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) {
    console.warn('[PWA] No install prompt available');
    return false;
  }

  try {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    return outcome === 'accepted';
  } catch (error) {
    console.error('[PWA] Install prompt failed:', error);
    return false;
  }
}

// ─── Check if app is installed (standalone mode) ───

function getIsInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

// ─── usePWA Hook ───

export interface UsePWAReturn {
  isInstallable: boolean;
  isInstalled: boolean;
  promptInstall: () => Promise<boolean>;
}

export function usePWA(): UsePWAReturn {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check initial installed state
    setIsInstalled(getIsInstalled());

    // Register service worker
    registerServiceWorker();

    // Listen for install prompt availability
    const cleanup = checkInstallable(
      () => setIsInstallable(true),
      () => {
        setIsInstalled(true);
        setIsInstallable(false);
      },
    );

    // Watch for display-mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    function handleDisplayChange(e: MediaQueryListEvent) {
      setIsInstalled(e.matches);
    }
    mediaQuery.addEventListener('change', handleDisplayChange);

    return () => {
      cleanup();
      mediaQuery.removeEventListener('change', handleDisplayChange);
    };
  }, []);

  const handlePromptInstall = useCallback(async () => {
    const accepted = await promptInstall();
    if (accepted) {
      setIsInstalled(true);
      setIsInstallable(false);
    }
    return accepted;
  }, []);

  return {
    isInstallable,
    isInstalled,
    promptInstall: handlePromptInstall,
  };
}

export default usePWA;
