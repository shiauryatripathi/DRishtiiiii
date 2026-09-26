import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Cookie, 
  Check, 
  X, 
  Settings, 
  Info, 
  Lock,
  FileText
} from 'lucide-react';
import { cn } from '../lib/utils';

interface CookieConsentBannerProps {
  onOpenLegalModal: (tab: 'privacy' | 'terms' | 'cookies' | 'refund' | 'dpdp' | 'business') => void;
}

export function CookieConsentBanner({ onOpenLegalModal }: CookieConsentBannerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always true (session auth, CSRF, triage state)
    analytics: false, // In-memory hardware performance metrics only
    preferences: true // Dark room mode, outdoor contrast, audio chimes
  });
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('drishti_cookie_consent_v1');
    if (!consent) {
      // Delay display slightly so it doesn't jarringly block initial render
      const timer = setTimeout(() => setShowBanner(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const consentData = {
      essential: true,
      analytics: true,
      preferences: true,
      timestamp: new Date().toISOString(),
      version: '1.1.2.9',
      standard: 'DPDP-2023-DISHA-Compliant'
    };
    localStorage.setItem('drishti_cookie_consent_v1', JSON.stringify(consentData));
    setShowBanner(false);
  };

  const handleAcceptNecessaryOnly = () => {
    const consentData = {
      essential: true,
      analytics: false,
      preferences: false,
      timestamp: new Date().toISOString(),
      version: '1.1.2.9',
      standard: 'DPDP-2023-Strict-Minimal'
    };
    localStorage.setItem('drishti_cookie_consent_v1', JSON.stringify(consentData));
    setShowBanner(false);
  };

  const handleSaveCustom = () => {
    const consentData = {
      essential: true,
      analytics: preferences.analytics,
      preferences: preferences.preferences,
      timestamp: new Date().toISOString(),
      version: '1.1.2.9',
      standard: 'DPDP-2023-Custom-Choice'
    };
    localStorage.setItem('drishti_cookie_consent_v1', JSON.stringify(consentData));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <aside 
      aria-label="Privacy & Cookie Consent"
      role="region"
      className="fixed bottom-3 left-3 right-3 sm:left-6 sm:right-auto sm:max-w-xl z-50 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-2xl p-4 sm:p-5 text-slate-800 dark:text-slate-100 animate-in slide-in-from-bottom-5 duration-300 ring-1 ring-slate-900/10"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 rounded-xl shrink-0 mt-0.5" aria-hidden="true">
          <Cookie className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              Data Privacy &amp; Essential Storage Notice
            </h3>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              DPDP Act 2023
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            DRishtii is an offline-capable medical tele-ophthalmology platform. We strictly use minimal browser storage to maintain secure clinician authentication, optical themes, and real-time clinic station synchronization. 
            <strong className="font-semibold text-slate-900 dark:text-white"> We do NOT use third-party advertising cookies or track cross-site identities.</strong>
          </p>

          {/* Detailed Preferences Panel */}
          {showPreferences && (
            <div className="mt-3.5 pt-3.5 border-t border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">1. Essential Clinical Cookies</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Required for session tokens, CSRF protection, and ABHA registration state.</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400 px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded">Always Active</span>
              </div>

              <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">2. Optical Preferences</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Remembers Dark Room mode, outdoor contrast, and audio alert volume.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.preferences}
                  onChange={e => setPreferences(prev => ({ ...prev, preferences: e.target.checked }))}
                  className="w-4 h-4 text-sky-600 rounded cursor-pointer accent-sky-600"
                  aria-label="Toggle Optical Preferences Storage"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">3. Local Edge Diagnostics Metrics</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Anonymous on-device hardware inference latency and queue metrics.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.analytics}
                  onChange={e => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                  className="w-4 h-4 text-sky-600 rounded cursor-pointer accent-sky-600"
                  aria-label="Toggle Edge Diagnostics Metrics Storage"
                />
              </label>
            </div>
          )}

          {/* Links to policies */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 text-[11px] text-sky-600 dark:text-sky-400 font-semibold">
            <button
              type="button"
              onClick={() => onOpenLegalModal('cookies')}
              className="hover:underline cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500 rounded"
            >
              Cookies Policy
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onOpenLegalModal('privacy')}
              className="hover:underline cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500 rounded"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onOpenLegalModal('dpdp')}
              className="hover:underline cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500 rounded"
            >
              DPDP Act Compliance
            </button>
          </div>

          {/* Action buttons with clear, accessible labels */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            {!showPreferences ? (
              <>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  aria-label="Accept all functional and preference cookies"
                  className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400"
                >
                  Accept All
                </button>
                <button
                  type="button"
                  onClick={handleAcceptNecessaryOnly}
                  aria-label="Accept only necessary clinical session cookies"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  Essential Only
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreferences(true)}
                  aria-label="Customize cookie and storage preferences"
                  className="px-2.5 py-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-medium transition-all cursor-pointer flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-slate-400 rounded"
                >
                  <Settings className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Customize</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  aria-label="Save customized storage choices"
                  className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400"
                >
                  Save My Preferences
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreferences(false)}
                  aria-label="Cancel customization"
                  className="px-3 py-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 text-xs font-semibold cursor-pointer"
                >
                  Back
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
