import React, { useEffect } from 'react';
import { X, Keyboard, Command, Sparkles, Navigation, Monitor, ArrowRight } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navigationShortcuts = [
    { key: '1', altKey: 'Alt + 1', letter: 'D', action: 'Diagnostic Desk', desc: 'Real-time triage stream & SIH ResNet-50 dashboard' },
    { key: '2', altKey: 'Alt + 2', letter: 'P', action: 'Patient Database', desc: 'Aadhaar registry, health records & clinical histories' },
    { key: '3', altKey: 'Alt + 3', letter: 'S', action: 'New AI Scan', desc: 'Retinal screening via Adaptive Lens burst or fundus upload' },
    { key: '4', altKey: 'Alt + 4', letter: 'A', action: 'AI Care Advisor', desc: 'Offline clinical intelligence & dietary care advisor' },
    { key: '5', altKey: 'Alt + 5', letter: '5', action: 'MathWorks SIH 26038', desc: 'MATLAB & Simulink telemedicine pipeline & benchmark validation' },
    { key: '6', altKey: 'Alt + 6', letter: ',', action: 'System Settings', desc: 'System configuration, optical themes & diagnostics center' },
  ];

  const controlShortcuts = [
    { key: 'M', altKey: 'Alt + B', extra: '[', action: 'Toggle Sidebar', desc: 'Switch YouTube expanded/mini sidebar or mobile drawer' },
    { key: '?', altKey: 'Shift + /', action: 'Keyboard Help', desc: 'Open or close this quick shortcut reference dialog' },
    { key: 'Esc', action: 'Close Dialogs', desc: 'Dismiss active dialogs, overlays, or mobile drawer' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200" 
        onClick={onClose} 
      />

      {/* Dialog Box */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
              <Keyboard className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Global Keyboard Shortcuts</h3>
              <p className="text-xs text-sky-100/90 font-medium">Instant clinical navigation for camps & health centres</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Navigation */}
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              <Navigation className="w-3.5 h-3.5 text-sky-600" />
              <span>Direct View Switching</span>
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {navigationShortcuts.map((sc, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-sky-50/60 hover:border-sky-200 transition-colors"
                >
                  <div className="pr-4">
                    <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      {sc.action}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{sc.desc}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <kbd className="px-2 py-1 text-xs font-mono font-bold bg-white text-slate-800 border border-slate-300 rounded-md shadow-2xs">
                      {sc.key}
                    </kbd>
                    <span className="text-[10px] text-slate-400 font-medium">or</span>
                    <kbd className="px-1.5 py-1 text-xs font-mono font-bold bg-white text-slate-700 border border-slate-300 rounded-md shadow-2xs">
                      {sc.letter}
                    </kbd>
                    <span className="text-[10px] text-slate-400 font-medium">or</span>
                    <kbd className="px-1.5 py-1 text-[11px] font-mono font-semibold bg-sky-50 text-sky-800 border border-sky-200 rounded-md shadow-2xs">
                      {sc.altKey}
                    </kbd>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Workspace Controls */}
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              <Monitor className="w-3.5 h-3.5 text-indigo-600" />
              <span>Workspace & Display</span>
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {controlShortcuts.map((sc, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-indigo-50/50 hover:border-indigo-200 transition-colors"
                >
                  <div className="pr-4">
                    <p className="text-sm font-semibold text-slate-800">{sc.action}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{sc.desc}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <kbd className="px-2 py-1 text-xs font-mono font-bold bg-white text-slate-800 border border-slate-300 rounded-md shadow-2xs">
                      {sc.key}
                    </kbd>
                    {sc.altKey && (
                      <>
                        <span className="text-[10px] text-slate-400 font-medium">or</span>
                        <kbd className="px-1.5 py-1 text-[11px] font-mono font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-md shadow-2xs">
                          {sc.altKey}
                        </kbd>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Pro-tip note */}
          <div className="p-3 bg-amber-50/80 border border-amber-200/70 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
            <span className="text-base leading-none">💡</span>
            <div className="leading-relaxed">
              <span className="font-bold text-amber-950">Smart Focus Protection: </span>
              Single-letter keys (<code className="bg-amber-100/80 px-1 py-0.5 rounded text-[11px] font-bold">1-4</code>, <code className="bg-amber-100/80 px-1 py-0.5 rounded text-[11px] font-bold">D, P, S, A</code>) activate when browsing. When typing inside search or patient form fields, <code className="bg-amber-100/80 px-1 py-0.5 rounded text-[11px] font-bold">Alt + 1/2/3/4</code> provides instant uninterrupted switching.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-700 font-bold shadow-2xs">?</kbd>
            <span>anytime to toggle this cheatsheet</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium transition-colors cursor-pointer shadow-xs"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
