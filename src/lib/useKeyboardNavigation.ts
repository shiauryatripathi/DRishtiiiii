import { useEffect, useState, useCallback } from 'react';

interface UseKeyboardNavigationProps {
  currentView: string;
  onChangeView: (view: string) => void;
  onToggleSidebar: () => void;
  isShortcutsModalOpen: boolean;
  onToggleShortcutsModal: () => void;
  onCloseModals: () => void;
  onOpenSettings?: () => void;
  enabled?: boolean;
}

export function useKeyboardNavigation({
  currentView,
  onChangeView,
  onToggleSidebar,
  isShortcutsModalOpen,
  onToggleShortcutsModal,
  onCloseModals,
  onOpenSettings,
  enabled = true,
}: UseKeyboardNavigationProps) {
  const [hudFeedback, setHudFeedback] = useState<{ title: string; keyHint: string } | null>(null);

  const showHud = useCallback((title: string, keyHint: string) => {
    setHudFeedback({ title, keyHint });
    const timer = setTimeout(() => {
      setHudFeedback(prev => (prev?.title === title ? null : prev));
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't intercept if Ctrl or Meta (Command on Mac) is pressed (allow browser shortcuts like Ctrl+R, Ctrl+C)
      if (event.ctrlKey || event.metaKey) return;

      const target = event.target as HTMLElement | null;
      const isEditable = !!(
        target && (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable
        )
      );

      // Escape key handles closing modals/drawers from anywhere
      if (event.key === 'Escape') {
        onCloseModals();
        return;
      }

      // 1. Alt-based shortcuts (Always active, even if focused in an input field)
      if (event.altKey) {
        if (event.key === '1' || event.key.toLowerCase() === 'd') {
          event.preventDefault();
          onChangeView('dashboard');
          showHud('Diagnostic Desk', 'Alt + 1');
          return;
        }
        if (event.key === '2' || event.key.toLowerCase() === 'p') {
          event.preventDefault();
          onChangeView('patients');
          showHud('Patient Database', 'Alt + 2');
          return;
        }
        if (event.key === '3' || event.key.toLowerCase() === 's') {
          event.preventDefault();
          onChangeView('new_scan');
          showHud('Diagnose', 'Alt + 3');
          return;
        }
        if (event.key === '4' || event.key.toLowerCase() === 'a') {
          event.preventDefault();
          onChangeView('advisor');
          showHud('AI Care Advisor', 'Alt + 4');
          return;
        }
        if (event.key === '5') {
          event.preventDefault();
          onChangeView('mathworks');
          showHud('MathWorks SIH 26038', 'Alt + 5');
          return;
        }
        if (event.key === '6' || event.key === ',') {
          event.preventDefault();
          onOpenSettings?.();
          showHud('System Settings', 'Alt + 6');
          return;
        }
        if (event.key.toLowerCase() === 'b') {
          event.preventDefault();
          onToggleSidebar();
          showHud('Toggle Sidebar', 'Alt + B');
          return;
        }
        return;
      }

      // If user is actively typing in a form input/textarea, do not trigger single-key actions
      if (isEditable) {
        return;
      }

      // 2. Direct single key navigation shortcuts (Active when browsing)
      if (event.key === '?' || (event.key === '/' && event.shiftKey)) {
        event.preventDefault();
        onToggleShortcutsModal();
        return;
      }

      if (event.key === '1' || event.key.toLowerCase() === 'd') {
        event.preventDefault();
        onChangeView('dashboard');
        showHud('Diagnostic Desk', event.key === '1' ? '1' : 'D');
        return;
      }

      if (event.key === '2' || event.key.toLowerCase() === 'p') {
        event.preventDefault();
        onChangeView('patients');
        showHud('Patient Database', event.key === '2' ? '2' : 'P');
        return;
      }

      if (event.key === '3' || event.key.toLowerCase() === 's') {
        event.preventDefault();
        onChangeView('new_scan');
        showHud('Diagnose', event.key === '3' ? '3' : 'S');
        return;
      }

      if (event.key === '4' || event.key.toLowerCase() === 'a') {
        event.preventDefault();
        onChangeView('advisor');
        showHud('AI Care Advisor', event.key === '4' ? '4' : 'A');
        return;
      }

      if (event.key === '5') {
        event.preventDefault();
        onChangeView('mathworks');
        showHud('MathWorks SIH 26038', '5');
        return;
      }

      if (event.key === '6' || event.key === ',') {
        event.preventDefault();
        onOpenSettings?.();
        showHud('System Settings', event.key === '6' ? '6' : ',');
        return;
      }

      if (event.key.toLowerCase() === 'm' || event.key === '[') {
        event.preventDefault();
        onToggleSidebar();
        showHud('Toggle Sidebar', event.key.toUpperCase());
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    enabled,
    onChangeView,
    onToggleSidebar,
    onToggleShortcutsModal,
    onCloseModals,
    onOpenSettings,
    showHud,
  ]);

  return {
    hudFeedback,
  };
}
