'use client';

import { useState, useCallback, useMemo, createElement } from 'react';
import LoginModal from '../components/LoginModal';

/**
 * Hook to guard protected actions behind authentication.
 *
 * Usage:
 * ```tsx
 * const { isAuthenticated, requireAuth, LoginModalComponent } = useAuthGuard();
 *
 * function handleSend() {
 *   if (!requireAuth('Connectez-vous pour envoyer un message')) return;
 *   // ... proceed with action
 * }
 *
 * return (
 *   <>
 *     <button onClick={handleSend}>Envoyer</button>
 *     <LoginModalComponent />
 *   </>
 * );
 * ```
 */
export function useAuthGuard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState<string | undefined>(undefined);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  const checkAuth = useCallback((): boolean => {
    try {
      const session = localStorage.getItem('fz_session');
      if (!session) return false;
      const parsed = JSON.parse(session);
      return Boolean(parsed.token);
    } catch {
      return false;
    }
  }, []);

  const isAuthenticated = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkAuth, modalOpen]); // re-evaluate after modal closes (login may have happened)

  /**
   * Guard a protected action. Returns true if authenticated, false if not.
   * When not authenticated, opens the login modal with the given message.
   *
   * @param message - Context message shown in the modal
   * @param onSuccess - Optional callback executed after successful login
   * @returns true if the user is already authenticated
   */
  const requireAuth = useCallback((message?: string, onSuccess?: () => void): boolean => {
    if (checkAuth()) return true;
    setModalMessage(message);
    setPendingCallback(() => onSuccess ?? null);
    setModalOpen(true);
    return false;
  }, [checkAuth]);

  const handleClose = useCallback(() => {
    setModalOpen(false);
    setPendingCallback(null);
  }, []);

  const handleAuthenticated = useCallback(() => {
    setModalOpen(false);
    if (pendingCallback) {
      // Small delay to let state settle after login
      setTimeout(() => {
        pendingCallback();
        setPendingCallback(null);
      }, 100);
    }
  }, [pendingCallback]);

  const loginModalProps = {
    open: modalOpen,
    onClose: handleClose,
    onAuthenticated: handleAuthenticated,
    message: modalMessage,
  };

  /** Ready-to-render LoginModal element — just include {LoginModalComponent} in JSX */
  const LoginModalComponent = createElement(LoginModal, loginModalProps);

  return {
    /** Whether the user currently has a valid session */
    isAuthenticated,
    /** Guard function: returns true if authed, opens modal if not */
    requireAuth,
    /** Props to spread on LoginModal */
    loginModalProps,
    /** Pre-built LoginModal element — add {LoginModalComponent} to your JSX */
    LoginModalComponent,
  };
}
