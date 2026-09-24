import React, { useState } from 'react';

interface DrishtiLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  variant?: 'dark' | 'light' | 'full' | 'mark' | 'icon' | string;
  alt?: string;
}

// Fallback order strictly within the public/ folder.
// Checks high-res PNG, vector SVG, and JPG uploaded by user.
const PUBLIC_LOGO_CANDIDATES = [
  '/Logo.png',
  '/Logo.svg',
  '/Logo.jpg',
  '/favicon.png',
  '/favicon.ico',
];

/**
 * Universal DRishtii Brand Logo
 * Guarantees that logo assets are ALWAYS loaded from the /public directory.
 * Generous sizing across all screens per user specifications.
 */
export function DrishtiLogo({
  className = '',
  size = 'md',
  alt = 'DRishtii Tele-Ophthalmology AI Diagnostic Logo',
}: DrishtiLogoProps) {
  const [candidateIndex, setCandidateIndex] = useState<number>(0);
  const [hasError, setHasError] = useState<boolean>(false);

  // Generous, prominent dimensions as requested
  const sizeStyles: Record<string, string> = {
    xs: 'h-8 w-auto',
    sm: 'h-11 sm:h-12 w-auto',
    md: 'h-14 sm:h-16 w-auto',
    lg: 'h-32 sm:h-36 md:h-44 w-auto max-w-[340px]',
    xl: 'h-44 sm:h-56 md:h-64 w-auto max-w-[500px]',
    custom: '',
  };

  const handleImageError = () => {
    if (candidateIndex < PUBLIC_LOGO_CANDIDATES.length - 1) {
      setCandidateIndex((prev) => prev + 1);
    } else {
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div className={`flex items-center gap-2.5 font-black text-slate-800 tracking-tight select-none ${size !== 'custom' ? sizeStyles[size] || sizeStyles.md : ''} ${className}`}>
        <span className="text-sky-600 text-2xl">👁️</span>
        <span className="font-extrabold text-xl tracking-tight text-slate-900">DRishtii</span>
      </div>
    );
  }

  const currentSrc = PUBLIC_LOGO_CANDIDATES[candidateIndex];

  return (
    <img
      src={currentSrc}
      alt={alt}
      onError={handleImageError}
      className={`object-contain select-none transition-all duration-200 ${
        size !== 'custom' ? sizeStyles[size] || sizeStyles.md : ''
      } ${className}`}
      loading="eager"
    />
  );
}
