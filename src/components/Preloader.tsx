import React, { useState, useEffect, useRef } from 'react';
import { DrishtiLogo } from './DrishtiLogo';

interface PreloaderProps {
  onComplete: () => void;
  durationMs?: number; // 1200ms (~1.2 seconds)
}

export function Preloader({ onComplete, durationMs = 1200 }: PreloaderProps) {
  const [fadeOut, setFadeOut] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const finishedRef = useRef(false);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setFadeOut(true);
    setTimeout(onComplete, 300); // 300ms smooth fade transition
  };

  useEffect(() => {
    // Failsafe timer: automatically finish after 1.2s (or durationMs)
    const timer = setTimeout(() => {
      finish();
    }, durationMs);

    // Allow user to skip by pressing Escape, Space, or clicking anywhere
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        finish();
      }
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKey);
    };
  }, [durationMs]);

  return (
    <div
      onClick={finish}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-300 select-none cursor-pointer overflow-hidden ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Video Container */}
      <div className="w-full h-full max-w-4xl max-h-[85vh] flex items-center justify-center p-4">
        <video
          ref={videoRef}
          src="/preloader.mp4"
          autoPlay
          muted
          playsInline
          onEnded={finish}
          onError={() => {
            // If preloader.mp4 is missing, fallback cleanly
          }}
          className="w-full h-full object-contain"
        >
          {/* Fallback image if video is not yet placed */}
          <DrishtiLogo size="xl" className="h-44 sm:h-52 md:h-64 w-auto max-w-[85vw] animate-pulse drop-shadow-2xl" />
        </video>
      </div>

      {/* Subtle Skip Indicator at top right */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          finish();
        }}
        className="absolute top-5 right-6 text-[11px] font-mono uppercase tracking-wider text-slate-400 hover:text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 px-3 py-1 rounded-full transition-all"
      >
        Skip [Esc]
      </button>
    </div>
  );
}
