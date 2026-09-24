import React from 'react';
import { cn } from '../lib/utils';
import { ShieldCheck, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

export interface ConfidenceGaugeProps {
  confidence: number; // 0 to 100 (e.g. 96.5)
  size?: 'sm' | 'md' | 'lg';
  showValidationBadge?: boolean;
  showTicks?: boolean;
  className?: string;
}

export function ConfidenceGauge({
  confidence,
  size = 'md',
  showValidationBadge = true,
  showTicks = true,
  className
}: ConfidenceGaugeProps) {
  // Normalize & clamp confidence score
  const safeScore = typeof confidence === 'number' && !isNaN(confidence) ? confidence : 95.0;
  const clampedScore = Math.min(100, Math.max(0, safeScore));

  // Clinical validation threshold criteria (SIH #26038 specifies >85% specificity / >90% sensitivity)
  const isHighConfidence = clampedScore >= 90.0;
  const isValidated = clampedScore >= 85.0;
  const isBorderline = clampedScore >= 70.0 && clampedScore < 85.0;
  const isLowConfidence = clampedScore < 70.0;

  // Geometry for semi-circle arc (viewBox 0 0 120 72)
  const cx = 60;
  const cy = 58;
  const radius = 42;
  const arcLength = Math.PI * radius; // ~ 131.95
  const strokeOffset = arcLength - (clampedScore / 100) * arcLength;

  // Needle angle: 0% -> Math.PI (left, 180°), 100% -> 0 (right, 0°)
  const angleRad = Math.PI - (clampedScore / 100) * Math.PI;
  const needleLength = 32;
  const needleX = cx + needleLength * Math.cos(angleRad);
  const needleY = cy - needleLength * Math.sin(angleRad);

  // Color scheme based on clinical tier
  const strokeColor = isHighConfidence
    ? '#10b981' // emerald-500
    : isValidated
    ? '#0284c7' // sky-600
    : isBorderline
    ? '#f59e0b' // amber-500
    : '#ef4444'; // red-500

  // Compact Mini Gauge (for table rows, compact cards)
  if (size === 'sm') {
    return (
      <div 
        className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border bg-white/90 shadow-2xs", className)}
        title={`Clinical Confidence: ${clampedScore.toFixed(1)}% (${isValidated ? 'Meets Clinical Validation Requirements' : 'Borderline'})`}
      >
        <div className="relative w-7 h-4 shrink-0 overflow-hidden">
          <svg viewBox="0 0 60 36" className="w-full h-full overflow-visible">
            {/* Background Arc */}
            <path
              d="M 8,32 A 22,22 0 0,1 52,32"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="5"
              strokeLinecap="round"
              className="confidence-gauge-track"
            />
            {/* Active Arc */}
            <path
              d="M 8,32 A 22,22 0 0,1 52,32"
              fill="none"
              stroke={strokeColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={Math.PI * 22}
              strokeDashoffset={Math.PI * 22 - (clampedScore / 100) * (Math.PI * 22)}
            />
          </svg>
        </div>
        <div className="flex items-center gap-1 font-mono font-bold text-[10px]">
          <span className={cn(
            isHighConfidence ? "text-emerald-700" : isValidated ? "text-sky-700" : isBorderline ? "text-amber-700" : "text-rose-700"
          )}>
            {clampedScore.toFixed(1)}%
          </span>
          <span className="text-[9px] text-slate-400 font-sans font-medium uppercase tracking-tighter">conf</span>
        </div>
      </div>
    );
  }

  // Standard (md) and Large (lg) Gauge
  const isLarge = size === 'lg';

  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-2.5 rounded-xl bg-white/90 border border-slate-200/80 shadow-2xs backdrop-blur-xs",
      isLarge ? "min-w-[170px]" : "min-w-[140px]",
      className
    )}>
      {/* Gauge Header */}
      <div className="w-full flex items-center justify-between gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
        <span className="flex items-center gap-1">
          <ShieldCheck className={cn("w-3 h-3", isHighConfidence ? "text-emerald-600" : isValidated ? "text-sky-600" : "text-amber-600")} />
          Confidence Score
        </span>
        <span className="font-mono text-[9px] text-slate-400">0-100%</span>
      </div>

      {/* SVG Radial Gauge */}
      <div className={cn("relative overflow-visible", isLarge ? "w-36 h-20" : "w-30 h-18")}>
        <svg viewBox="0 0 120 72" className="w-full h-full overflow-visible">
          <defs>
            {/* Multi-zone gradient */}
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="85%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            <filter id="needleGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#0f172a" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Background Track with segmented tick markers */}
          <path
            d="M 18,58 A 42,42 0 0,1 102,58"
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="9"
            strokeLinecap="round"
            className="confidence-gauge-track"
          />

          {/* Clinical Validation Threshold Indicator Ring (>85% Target Zone) */}
          <path
            d="M 18,58 A 42,42 0 0,1 102,58"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="7"
            strokeLinecap="round"
            className="confidence-gauge-threshold"
          />

          {/* Active Colored Arc */}
          <path
            d="M 18,58 A 42,42 0 0,1 102,58"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeOffset}
            className="transition-all duration-700 ease-out"
          />

          {/* Clinical Tick Marks at 0%, 50%, 85% (Threshold), 100% */}
          {showTicks && (
            <g className="text-slate-400 select-none">
              {/* 0% Tick */}
              <line x1="18" y1="58" x2="22" y2="58" stroke="#94a3b8" strokeWidth="1.5" />
              {/* 50% Tick (top) */}
              <line x1="60" y1="16" x2="60" y2="20" stroke="#94a3b8" strokeWidth="1.5" />
              {/* 85% Clinical Target Tick */}
              <line 
                x1={60 + 42 * Math.cos(Math.PI * 0.15)} 
                y1={58 - 42 * Math.sin(Math.PI * 0.15)} 
                x2={60 + 36 * Math.cos(Math.PI * 0.15)} 
                y2={58 - 36 * Math.sin(Math.PI * 0.15)} 
                stroke="#10b981" 
                strokeWidth="2" 
              />
              {/* 100% Tick */}
              <line x1="102" y1="58" x2="98" y2="58" stroke="#94a3b8" strokeWidth="1.5" />
            </g>
          )}

          {/* Precision Indicator Needle */}
          <g filter="url(#needleGlow)" className="transition-all duration-700 ease-out">
            <line
              x1={cx}
              y1={cy}
              x2={needleX}
              y2={needleY}
              stroke="#0f172a"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Glowing Pointer Tip */}
            <circle
              cx={needleX}
              cy={needleY}
              r="2.5"
              fill={strokeColor}
              stroke="#ffffff"
              strokeWidth="1"
            />
            {/* Base Hub */}
            <circle
              cx={cx}
              cy={cy}
              r="4.5"
              fill="#0f172a"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          </g>

          {/* Scale Labels */}
          <text x="14" y="68" fontSize="7" fill="#94a3b8" textAnchor="middle" fontFamily="monospace" fontWeight="bold">0%</text>
          <text x="60" y="27" fontSize="6.5" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">50%</text>
          <text x="106" y="68" fontSize="7" fill="#94a3b8" textAnchor="middle" fontFamily="monospace" fontWeight="bold">100%</text>
        </svg>

        {/* Center Digital Percentage Readout */}
        <div className="absolute -bottom-1 left-0 right-0 text-center">
          <span className={cn(
            "font-mono font-black tracking-tight",
            isLarge ? "text-base sm:text-lg" : "text-sm sm:text-base",
            isHighConfidence ? "text-emerald-700" : isValidated ? "text-sky-700" : isBorderline ? "text-amber-700" : "text-rose-700"
          )}>
            {clampedScore.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Clinical Validation Status Badge */}
      {showValidationBadge && (
        <div className="mt-1 w-full pt-1 border-t border-slate-100 flex items-center justify-center">
          {isValidated ? (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded tracking-tight">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
              <span>Validated (≥85%)</span>
            </span>
          ) : isBorderline ? (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded tracking-tight">
              <AlertTriangle className="w-2.5 h-2.5 text-amber-600 shrink-0" />
              <span>Borderline Confidence</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-200/80 px-1.5 py-0.5 rounded tracking-tight">
              <AlertCircle className="w-2.5 h-2.5 text-rose-600 shrink-0" />
              <span>Low (&lt;70%) • Recapture</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
