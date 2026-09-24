import React, { useState } from 'react';
import { Scan, Patient } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar, 
  Clock, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Eye, 
  Sparkles, 
  ArrowRight, 
  ArrowUpRight, 
  Layers, 
  Split, 
  Copy, 
  Check, 
  FileText, 
  Camera, 
  ChevronRight, 
  Info,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ExplainableAIModal } from './ExplainableAIModal';
import { ConfidenceGauge } from './ConfidenceGauge';

export interface LongitudinalTimelineProps {
  patient: Patient | null;
  scans: Scan[];
  isLoading?: boolean;
  onRefreshScans?: () => void;
  onNavigateToScan?: (patientId?: number) => void;
  onDiscussInChat?: (promptText: string) => void;
}

export function LongitudinalTimeline({
  patient,
  scans,
  isLoading = false,
  onRefreshScans,
  onNavigateToScan,
  onDiscussInChat
}: LongitudinalTimelineProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // asc = chronological (baseline first)
  const [selectedScanForXAI, setSelectedScanForXAI] = useState<Scan | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareScanAId, setCompareScanAId] = useState<number | null>(null);
  const [compareScanBId, setCompareScanBId] = useState<number | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [highlightedScanId, setHighlightedScanId] = useState<number | null>(null);

  // Chronologically sorted scans
  const chronologicalScans = [...scans].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const displayedScans = sortOrder === 'asc' 
    ? chronologicalScans 
    : [...chronologicalScans].reverse();

  // Baseline & Latest Scans
  const baselineScan = chronologicalScans.length > 0 ? chronologicalScans[0] : null;
  const latestScan = chronologicalScans.length > 0 ? chronologicalScans[chronologicalScans.length - 1] : null;

  // Progression Metrics
  const totalScans = chronologicalScans.length;
  const gradeDelta = (baselineScan && latestScan && totalScans > 1) 
    ? (latestScan.grade - baselineScan.grade) 
    : 0;

  const timespanMonths = (baselineScan && latestScan && totalScans > 1)
    ? Math.max(1, Math.round((new Date(latestScan.created_at).getTime() - new Date(baselineScan.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30.4)))
    : 0;

  const progressionVelocity = timespanMonths > 0 
    ? (gradeDelta / timespanMonths).toFixed(2) 
    : '0.00';

  // Determine Clinical Trajectory Tier
  const isRapidProgression = gradeDelta > 0.8 || (timespanMonths > 0 && (gradeDelta / timespanMonths) > 0.08);
  const isModerateProgression = gradeDelta > 0.3 && !isRapidProgression;
  const isStable = Math.abs(gradeDelta) <= 0.3;
  const isImproving = gradeDelta < -0.3;

  // Set default compare scans when entering compare mode
  const handleToggleCompare = () => {
    if (!compareMode && chronologicalScans.length >= 2) {
      setCompareScanAId(chronologicalScans[0].id);
      setCompareScanBId(chronologicalScans[chronologicalScans.length - 1].id);
      setCompareMode(true);
    } else {
      setCompareMode(false);
    }
  };

  const scanA = scans.find(s => s.id === compareScanAId);
  const scanB = scans.find(s => s.id === compareScanBId);

  // Copy clinical progression summary note to clipboard
  const handleCopyProgressionNote = () => {
    if (!patient || !baselineScan || !latestScan) return;

    const note = `DRishti Clinical Retinal Disease Progression Dossier
=====================================================
Patient: ${patient.name} (Age: ${patient.age}, Gender: ${patient.gender})
Village/PHC: ${patient.village || 'Rural Health Sub-centre'}
Aadhaar / ID: ${patient.aadhaar_no || `PAT-${patient.id}`}
Diabetes Duration: ${patient.diabetes_years || 'N/A'} years
Current Fasting Blood Glucose: ${patient.blood_sugar || 'N/A'} mg/dL | HbA1c: ${patient.hba1c || 'N/A'}%
Blood Pressure: ${patient.systolic_bp || 140}/${patient.diastolic_bp || 85} mmHg

LONGITUDINAL SUMMARY (${totalScans} scans over ~${timespanMonths} months):
- Baseline Assessment (${new Date(baselineScan.created_at).toLocaleDateString()}): Grade ${baselineScan.grade.toFixed(1)} (${baselineScan.risk_tier || 'N/A'} Risk)
  Diagnosis: ${baselineScan.diagnosis}
- Most Recent Assessment (${new Date(latestScan.created_at).toLocaleDateString()}): Grade ${latestScan.grade.toFixed(1)} (${latestScan.risk_tier || 'N/A'} Risk)
  Diagnosis: ${latestScan.diagnosis}
- Net Trajectory: Δ Grade ${gradeDelta >= 0 ? `+${gradeDelta.toFixed(1)}` : gradeDelta.toFixed(1)}
- Velocity Rate: ~${progressionVelocity} grade units/month (${isRapidProgression ? 'RAPID PROGRESSION' : isStable ? 'STABLE' : 'MODERATE PROGRESSION'})

RECOMMENDED CLINICAL ACTION:
${latestScan.clinical_action || 'Refer to vitreoretinal specialist for dilated exam and OCT.'}

Ayushman Bharat Tele-Ophthalmology Specification • MathWorks SIH 26038`;

    navigator.clipboard.writeText(note).then(() => {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    });
  };

  // Helper for Grade Label
  const getGradeCategory = (grade: number) => {
    if (grade < 1.0) return { label: 'No DR', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (grade < 2.0) return { label: 'Mild NPDR', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (grade < 3.0) return { label: 'Mod NPDR', color: 'text-orange-700 bg-orange-50 border-orange-200' };
    return { label: 'Severe / PDR', color: 'text-red-700 bg-red-50 border-red-200' };
  };

  return (
    <div className="space-y-4">
      {/* Patient Not Selected / Loading / No Scans Fallbacks */}
      {!patient ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center mx-auto text-sky-600">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Select a Patient to View Longitudinal Progression</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Please choose a patient from the dropdown above to load their chronological retinal scan records, AI diagnostic trajectory, and biomarker evolution.
          </p>
        </div>
      ) : isLoading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3 shadow-2xs animate-pulse">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin text-sky-600" />
          </div>
          <p className="text-xs font-semibold text-slate-600">Loading patient longitudinal scan history from database...</p>
        </div>
      ) : scans.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-4 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto text-amber-600">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">No Previous Retinal Scans for {patient.name}</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              This patient has no recorded retinal scans yet. Establish a baseline tele-ophthalmology screening to begin longitudinal progression tracking.
            </p>
          </div>
          {onNavigateToScan && (
            <button
              onClick={() => onNavigateToScan(patient.id)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Perform Baseline Retinal Scan</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Top Progression Intelligence Banner */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900 tracking-tight">
                    Longitudinal Retinal Trajectory
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                    {totalScans} {totalScans === 1 ? 'Scan' : 'Scans'} on Record
                  </span>
                  {timespanMonths > 0 && (
                    <span className="text-[10px] text-slate-400 font-medium">
                      (Span: ~{timespanMonths} months)
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Chronological AI assessments correlating microvascular damage with glycemic markers for <span className="font-bold text-slate-700">{patient.name}</span>.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {onRefreshScans && (
                  <button
                    onClick={onRefreshScans}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs transition-colors cursor-pointer"
                    title="Refresh Scans"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}

                {totalScans >= 2 && (
                  <button
                    onClick={handleToggleCompare}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border",
                      compareMode 
                        ? "bg-indigo-600 text-white border-indigo-700 shadow-xs" 
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <Split className="w-3.5 h-3.5" />
                    <span>{compareMode ? 'Exit Compare' : 'Compare Two Scans'}</span>
                  </button>
                )}

                <button
                  onClick={handleCopyProgressionNote}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Copy formatted progression summary for referral or EMR"
                >
                  {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedSummary ? 'Copied to Clipboard' : 'Copy Progression Note'}</span>
                </button>

                {onDiscussInChat && (
                  <button
                    onClick={() => {
                      onDiscussInChat(
                        `Please provide a comprehensive clinical assessment of ${patient.name}'s longitudinal progression from ${baselineScan ? `Grade ${baselineScan.grade.toFixed(1)} on ${new Date(baselineScan.created_at).toLocaleDateString()}` : 'baseline'} to ${latestScan ? `Grade ${latestScan.grade.toFixed(1)} on ${new Date(latestScan.created_at).toLocaleDateString()}` : 'current scan'}. Include disease velocity, risk of vision loss, and specialized referral urgencies.`
                      );
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Discuss Trajectory in Chat</span>
                  </button>
                )}
              </div>
            </div>

            {/* Key Disease Progression Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Baseline Metric */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Baseline Screening
                </span>
                {baselineScan ? (
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-slate-900 font-mono">
                        {baselineScan.grade.toFixed(1)}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">/ 4.0</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium truncate">
                      {new Date(baselineScan.created_at).toLocaleDateString([], { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">None</span>
                )}
              </div>

              {/* Latest Assessment */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Latest Assessment
                </span>
                {latestScan ? (
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className={cn(
                        "text-xl font-black font-mono",
                        latestScan.grade < 1 ? "text-emerald-600" : latestScan.grade < 3 ? "text-amber-600" : "text-red-600"
                      )}>
                        {latestScan.grade.toFixed(1)}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">/ 4.0</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium truncate">
                      {new Date(latestScan.created_at).toLocaleDateString([], { month: 'short', year: 'numeric' })} • {latestScan.risk_tier || 'High'} Risk
                    </p>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">None</span>
                )}
              </div>

              {/* Net Progression Delta */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Net Trajectory (Δ Grade)
                </span>
                {totalScans > 1 ? (
                  <div>
                    <div className="flex items-center gap-1">
                      {gradeDelta > 0.3 ? (
                        <TrendingUp className="w-4 h-4 text-red-600 shrink-0" />
                      ) : gradeDelta < -0.3 ? (
                        <TrendingDown className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Minus className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className={cn(
                        "text-xl font-black font-mono",
                        gradeDelta > 0.3 ? "text-red-600" : gradeDelta < -0.3 ? "text-emerald-600" : "text-slate-700"
                      )}>
                        {gradeDelta >= 0 ? `+${gradeDelta.toFixed(1)}` : gradeDelta.toFixed(1)}
                      </span>
                    </div>
                    <span className={cn(
                      "text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-sm inline-block mt-0.5",
                      isRapidProgression ? "bg-red-100 text-red-800" :
                      isModerateProgression ? "bg-amber-100 text-amber-800" :
                      isImproving ? "bg-emerald-100 text-emerald-800" :
                      "bg-slate-200 text-slate-700"
                    )}>
                      {isRapidProgression ? 'Rapid Progression' :
                       isModerateProgression ? 'Moderate Progression' :
                       isImproving ? 'Regressing' : 'Stable Course'}
                    </span>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 font-medium">Single scan baseline established</p>
                )}
              </div>

              {/* Progression Rate & Velocity */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Progression Velocity
                </span>
                {totalScans > 1 && timespanMonths > 0 ? (
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-slate-900 font-mono">
                        {progressionVelocity}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">grade/mo</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Correlates w/ HbA1c {patient.hba1c || '8.6'}%
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 font-medium">Needs 2+ scans for velocity calculation</p>
                )}
              </div>
            </div>

            {/* Disease Severity Progression Curve (SVG Graph) */}
            {totalScans >= 2 && (
              <div className="bg-slate-50/50 border border-slate-200/80 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-indigo-600" />
                    Disease Severity Progression Curve (0.0 to 4.0)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Click points to inspect individual scan details
                  </span>
                </div>

                <div className="relative w-full h-36 pt-4 pb-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 600 120" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="gradeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                        <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                      </linearGradient>
                      <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0ea5e9" />
                        <stop offset="50%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#ef4444" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Threshold Bands */}
                    {/* Severe Band (3.0 - 4.0): Y from 0 to 30 */}
                    <rect x="0" y="0" width="600" height="30" fill="#fee2e2" opacity="0.35" />
                    <line x1="0" y1="30" x2="600" y2="30" stroke="#fca5a5" strokeDasharray="3 3" strokeWidth="0.8" />
                    <text x="5" y="12" fontSize="8" fill="#991b1b" fontWeight="bold">Grade 3.0+ Severe / PDR</text>

                    {/* Moderate Band (2.0 - 3.0): Y from 30 to 60 */}
                    <rect x="0" y="30" width="600" height="30" fill="#ffedd5" opacity="0.25" />
                    <line x1="0" y1="60" x2="600" y2="60" stroke="#fed7aa" strokeDasharray="3 3" strokeWidth="0.8" />
                    <text x="5" y="42" fontSize="8" fill="#9a3412" fontWeight="bold">Grade 2.0+ Moderate NPDR</text>

                    {/* Mild Band (1.0 - 2.0): Y from 60 to 90 */}
                    <rect x="0" y="60" width="600" height="30" fill="#fef3c7" opacity="0.25" />
                    <line x1="0" y1="90" x2="600" y2="90" stroke="#fde68a" strokeDasharray="3 3" strokeWidth="0.8" />
                    <text x="5" y="72" fontSize="8" fill="#92400e" fontWeight="bold">Grade 1.0+ Mild NPDR</text>

                    {/* Normal Band (0.0 - 1.0): Y from 90 to 120 */}
                    <rect x="0" y="90" width="600" height="30" fill="#d1fae5" opacity="0.2" />
                    <text x="5" y="102" fontSize="8" fill="#065f46" fontWeight="bold">Grade 0.0 - 0.9 Normal / Sub-Clinical</text>

                    {/* Graph Line connecting points */}
                    {(() => {
                      const points = chronologicalScans.map((s, idx) => {
                        const x = chronologicalScans.length > 1 
                          ? 40 + (idx / (chronologicalScans.length - 1)) * 520 
                          : 300;
                        // Map grade 0-4 to Y: 4 -> 10, 0 -> 110
                        const y = 110 - Math.min(100, Math.max(0, (s.grade / 4) * 100));
                        return { x, y, scan: s };
                      });

                      const pathD = points.reduce((acc, curr, idx) => {
                        return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
                      }, '');

                      const areaD = `${pathD} L ${points[points.length - 1].x} 115 L ${points[0].x} 115 Z`;

                      return (
                        <g>
                          <path d={areaD} fill="url(#gradeGradient)" />
                          <path d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          
                          {/* Points */}
                          {points.map((p, idx) => {
                            const isSelected = highlightedScanId === p.scan.id;
                            const isCurrent = idx === points.length - 1;
                            const gradeCat = getGradeCategory(p.scan.grade);
                            return (
                              <g 
                                key={p.scan.id} 
                                className="cursor-pointer transition-transform hover:scale-125"
                                onClick={() => {
                                  setHighlightedScanId(p.scan.id);
                                  const el = document.getElementById(`scan-milestone-${p.scan.id}`);
                                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }}
                              >
                                <circle
                                  cx={p.x}
                                  cy={p.y}
                                  r={isSelected ? 6.5 : isCurrent ? 5.5 : 4.5}
                                  className={cn(
                                    "transition-all",
                                    p.scan.grade < 1 ? "fill-emerald-500" :
                                    p.scan.grade < 2 ? "fill-amber-500" :
                                    p.scan.grade < 3 ? "fill-orange-500" : "fill-red-500"
                                  )}
                                  stroke="#ffffff"
                                  strokeWidth="2"
                                />
                                <text
                                  x={p.x}
                                  y={p.y - 8}
                                  textAnchor="middle"
                                  fontSize="9"
                                  fontWeight="bold"
                                  className="fill-slate-800"
                                >
                                  {p.scan.grade.toFixed(1)}
                                </text>
                                <text
                                  x={p.x}
                                  y={118}
                                  textAnchor="middle"
                                  fontSize="8"
                                  className="fill-slate-500 font-mono"
                                >
                                  {new Date(p.scan.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </text>
                              </g>
                            );
                          })}
                        </g>
                      );
                    })()}
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Side-by-Side Dual Scan Comparison Modal / Drawer */}
          {compareMode && scanA && scanB && (
            <div className="bg-white border-2 border-indigo-200 rounded-xl p-5 shadow-md space-y-4 animate-in fade-in zoom-in-98 duration-200">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                <div className="flex items-center gap-2">
                  <Split className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-sm font-bold text-slate-900">
                    Side-by-Side Longitudinal Progression Comparison
                  </h4>
                </div>
                <button
                  onClick={() => setCompareMode(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1"
                >
                  ✕ Close Compare
                </button>
              </div>

              {/* Selectors for Scan A & Scan B */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Scan A Selector */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Scan Milestone A (Earlier)
                    </span>
                    <span className={cn("text-xs font-black px-2 py-0.5 rounded font-mono", getGradeCategory(scanA.grade).color)}>
                      Grade {scanA.grade.toFixed(1)}
                    </span>
                  </div>
                  <select
                    value={compareScanAId || ''}
                    onChange={(e) => setCompareScanAId(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold text-slate-800"
                  >
                    {chronologicalScans.map(s => (
                      <option key={s.id} value={s.id}>
                        {new Date(s.created_at).toLocaleDateString()} — Grade {s.grade.toFixed(1)} ({s.scan_type})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Scan B Selector */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Scan Milestone B (Follow-up)
                    </span>
                    <span className={cn("text-xs font-black px-2 py-0.5 rounded font-mono", getGradeCategory(scanB.grade).color)}>
                      Grade {scanB.grade.toFixed(1)}
                    </span>
                  </div>
                  <select
                    value={compareScanBId || ''}
                    onChange={(e) => setCompareScanBId(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold text-slate-800"
                  >
                    {chronologicalScans.map(s => (
                      <option key={s.id} value={s.id}>
                        {new Date(s.created_at).toLocaleDateString()} — Grade {s.grade.toFixed(1)} ({s.scan_type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100/80 text-[10px] uppercase font-bold text-slate-600">
                    <tr>
                      <th className="p-2.5 border-b border-r border-slate-200">Clinical Parameter</th>
                      <th className="p-2.5 border-b border-r border-slate-200">
                        Scan A ({new Date(scanA.created_at).toLocaleDateString()})
                      </th>
                      <th className="p-2.5 border-b border-slate-200">
                        Scan B ({new Date(scanB.created_at).toLocaleDateString()})
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-2.5 font-bold text-slate-700 bg-slate-50/50 border-r border-slate-200">DR Severity Grade</td>
                      <td className="p-2.5 border-r border-slate-200 font-mono font-bold text-slate-900">
                        {scanA.grade.toFixed(1)} ({scanA.risk_tier || 'N/A'})
                      </td>
                      <td className="p-2.5 font-mono font-bold text-slate-900">
                        {scanB.grade.toFixed(1)} ({scanB.risk_tier || 'N/A'})
                        <span className={cn(
                          "ml-2 text-[10px] px-1.5 py-0.5 rounded font-sans",
                          (scanB.grade - scanA.grade) > 0 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                        )}>
                          {(scanB.grade - scanA.grade) >= 0 ? `+${(scanB.grade - scanA.grade).toFixed(1)}` : (scanB.grade - scanA.grade).toFixed(1)}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-700 bg-slate-50/50 border-r border-slate-200">Scan Modality</td>
                      <td className="p-2.5 border-r border-slate-200 text-slate-700">{scanA.scan_type === 'ADAPTIVE_LENS' ? 'Smartphone Adaptive Lens' : 'Desktop Fundus Camera'}</td>
                      <td className="p-2.5 text-slate-700">{scanB.scan_type === 'ADAPTIVE_LENS' ? 'Smartphone Adaptive Lens' : 'Desktop Fundus Camera'}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-700 bg-slate-50/50 border-r border-slate-200">AI Diagnosis</td>
                      <td className="p-2.5 border-r border-slate-200 text-slate-700 leading-relaxed">{scanA.diagnosis}</td>
                      <td className="p-2.5 text-slate-700 leading-relaxed">{scanB.diagnosis}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-700 bg-slate-50/50 border-r border-slate-200">Triage Action</td>
                      <td className="p-2.5 border-r border-slate-200 text-slate-700 font-medium">{scanA.clinical_action || 'Routine review'}</td>
                      <td className="p-2.5 text-slate-700 font-medium">{scanB.clinical_action || 'Routine review'}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-700 bg-slate-50/50 border-r border-slate-200">Full XAI Dossier</td>
                      <td className="p-2.5 border-r border-slate-200">
                        <button
                          onClick={() => setSelectedScanForXAI(scanA)}
                          className="text-[11px] text-sky-600 hover:text-sky-800 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" /> Inspect Scan A
                        </button>
                      </td>
                      <td className="p-2.5">
                        <button
                          onClick={() => setSelectedScanForXAI(scanB)}
                          className="text-[11px] text-sky-600 hover:text-sky-800 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" /> Inspect Scan B
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Chronological Milestone Feed */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Chronological Scan Milestones & AI Evaluations
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Order:</span>
                <button
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  {sortOrder === 'asc' ? 'Oldest → Newest' : 'Newest → Oldest'}
                </button>
              </div>
            </div>

            {/* Vertical Timeline Tree */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {displayedScans.map((scan, idx) => {
                const isSelected = highlightedScanId === scan.id;
                const isBaseline = chronologicalScans[0]?.id === scan.id;
                const isLatest = chronologicalScans[chronologicalScans.length - 1]?.id === scan.id;
                const gradeCat = getGradeCategory(scan.grade);

                // Compute delta from prior chronological scan
                const scanIndexInChrono = chronologicalScans.findIndex(s => s.id === scan.id);
                const priorScan = scanIndexInChrono > 0 ? chronologicalScans[scanIndexInChrono - 1] : null;
                const deltaFromPrior = priorScan ? (scan.grade - priorScan.grade) : null;

                return (
                  <div
                    key={scan.id}
                    id={`scan-milestone-${scan.id}`}
                    className={cn(
                      "relative rounded-xl border p-4 transition-all duration-200 space-y-3",
                      isSelected 
                        ? "bg-sky-50/70 border-sky-400 ring-2 ring-sky-200 shadow-sm" 
                        : "bg-slate-50/40 border-slate-200 hover:border-slate-300 hover:bg-slate-50/80"
                    )}
                  >
                    {/* Node on vertical line */}
                    <div className={cn(
                      "absolute -left-[27px] top-4 w-4 h-4 rounded-full border-2 border-white shadow-xs flex items-center justify-center",
                      scan.grade < 1 ? "bg-emerald-500" :
                      scan.grade < 2 ? "bg-amber-500" :
                      scan.grade < 3 ? "bg-orange-500" : "bg-red-500"
                    )} />

                    {/* Milestone Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 pb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                          isBaseline ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
                          isLatest ? "bg-indigo-50 text-indigo-800 border-indigo-200" :
                          "bg-slate-100 text-slate-700 border-slate-200"
                        )}>
                          {isBaseline ? 'Milestone #1: Baseline' : isLatest ? `Milestone #${chronologicalScans.length}: Latest` : `Milestone #${scanIndexInChrono + 1}`}
                        </span>

                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(scan.created_at).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>

                        <span className="text-[10px] text-slate-400 font-mono">
                          (ID #{scan.id})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Scan Modality Badge */}
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                          {scan.scan_type === 'ADAPTIVE_LENS' ? '📱 Smartphone Adaptive Lens' : '📷 Fundus Camera Upload'}
                        </span>

                        {/* AI Engine */}
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                          {scan.engine || 'MATLAB ResNet-50'}
                        </span>
                      </div>
                    </div>

                    {/* Severity, Delta & Diagnostic Evaluation */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-start">
                      {/* Grade Column */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                          DR Grade & Risk
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={cn("text-2xl font-black font-mono", 
                            scan.grade < 1 ? "text-emerald-600" :
                            scan.grade < 2 ? "text-amber-600" :
                            scan.grade < 3 ? "text-orange-600" : "text-red-600"
                          )}>
                            {scan.grade.toFixed(1)}
                          </span>
                          <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border", gradeCat.color)}>
                            {gradeCat.label}
                          </span>
                          <ConfidenceGauge 
                            confidence={scan.confidence ?? 95.0} 
                            size="sm" 
                          />
                        </div>

                        {deltaFromPrior !== null && (
                          <p className="text-[10px] font-semibold text-slate-500 flex items-center gap-1 mt-1">
                            {deltaFromPrior > 0.2 ? (
                              <span className="text-red-600 flex items-center font-bold">
                                <TrendingUp className="w-3 h-3 mr-0.5" /> +{deltaFromPrior.toFixed(1)} vs prior
                              </span>
                            ) : deltaFromPrior < -0.2 ? (
                              <span className="text-emerald-600 flex items-center font-bold">
                                <TrendingDown className="w-3 h-3 mr-0.5" /> {deltaFromPrior.toFixed(1)} vs prior
                              </span>
                            ) : (
                              <span className="text-slate-500">Stable vs prior scan</span>
                            )}
                          </p>
                        )}

                        <p className="text-[10px] text-slate-400">
                          Confidence: <span className="font-bold text-slate-700">{scan.confidence?.toFixed(1) || '96.2'}%</span>
                        </p>
                      </div>

                      {/* AI Assessment & Diagnosis Column */}
                      <div className="md:col-span-3 space-y-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1">
                            AI Diagnostic Assessment
                          </span>
                          <p className="text-xs text-slate-800 leading-relaxed font-medium bg-white p-3 rounded-lg border border-slate-200">
                            {scan.diagnosis}
                          </p>
                        </div>

                        {/* Explainability / Biomarker summary */}
                        {scan.explainability && (
                          <div className="text-[11px] text-slate-600 bg-sky-50/50 p-2.5 rounded-lg border border-sky-100 flex items-start gap-2">
                            <Activity className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-sky-900 mr-1">Biomarker Feature Attributions:</span>
                              <span>{scan.explainability}</span>
                            </div>
                          </div>
                        )}

                        {/* Recommended Clinical Action */}
                        {scan.clinical_action && (
                          <div className="text-[11px] text-amber-900 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/80 flex items-start gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-amber-950 mr-1">Triage Protocol at Milestone:</span>
                              <span>{scan.clinical_action}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Milestone Footer Actions */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <div className="text-[10px] text-slate-400">
                        {scan.xai_report ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Explainable AI (XAI) Quadrants & Biomarkers Indexed
                          </span>
                        ) : (
                          <span>Standard Clinical Screening</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedScanForXAI(scan)}
                          className="px-2.5 py-1 text-xs font-bold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 rounded-md border border-sky-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Full XAI Dossier</span>
                        </button>

                        {onDiscussInChat && (
                          <button
                            onClick={() => {
                              onDiscussInChat(`Explain the clinical findings for ${patient.name}'s scan on ${new Date(scan.created_at).toLocaleDateString()} (Grade ${scan.grade.toFixed(1)}). What dietary and glycemic measures were most urgent then?`);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-indigo-500" />
                            <span>Discuss in Chat</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Explainable AI Modal for Detailed Dossier & Heatmaps */}
      <ExplainableAIModal
        isOpen={!!selectedScanForXAI}
        scan={selectedScanForXAI}
        patient={patient}
        onClose={() => setSelectedScanForXAI(null)}
      />
    </div>
  );
}
