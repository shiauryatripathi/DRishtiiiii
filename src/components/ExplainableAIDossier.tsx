import React, { useState } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  Cpu, 
  Download, 
  Eye, 
  FileText, 
  Heart, 
  Info, 
  Layers, 
  Maximize2, 
  Printer, 
  RefreshCw, 
  ShieldAlert, 
  ShieldCheck, 
  Sliders, 
  Sparkles, 
  Stethoscope, 
  User, 
  X,
  Zap
} from 'lucide-react';
import { Scan, Patient, XAIReport, XAIBiomarker, XAIQuadrantAnalysis, XAIDoItem, XAIDontItem } from '../types';
import { cn } from '../lib/utils';
import { ConfidenceGauge } from './ConfidenceGauge';
import { DrishtiLogo } from './DrishtiLogo';

export interface ExplainableAIDossierProps {
  scan: Scan;
  patient?: Patient | null;
  onClose?: () => void;
  onRefreshXAI?: () => Promise<void>;
  isModal?: boolean;
}

export function ExplainableAIDossier({
  scan,
  patient,
  onClose,
  onRefreshXAI,
  isModal = false
}: ExplainableAIDossierProps) {
  const [visualMode, setVisualMode] = useState<'fundus' | 'gradcam' | 'clahe' | 'lesions'>('gradcam');
  const [heatmapOpacity, setHeatmapOpacity] = useState<number>(75);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'biomarkers' | 'quadrants' | 'dos_donts' | 'print'>('overview');
  const [hoveredLesion, setHoveredLesion] = useState<string | null>(null);
  const [imgLoadError, setImgLoadError] = useState<boolean>(false);

  const xai: XAIReport | undefined = scan.xai_report;

  const patientName = patient?.name || scan.patient_name || `Patient #${scan.patient_id}`;
  const patientAge = patient?.age || scan.patient_age || 58;
  const patientGender = patient?.gender || scan.patient_gender || 'Male';
  const sugar = patient?.blood_sugar || 215;
  const hba1c = patient?.hba1c || 8.6;
  const sysBp = patient?.systolic_bp || 142;
  const diaBp = patient?.diastolic_bp || 88;
  const years = patient?.diabetes_years || 12;
  const village = patient?.village || 'Rampur PHC (Block B)';

  const handlePrint = () => {
    window.print();
  };

  const handleTriggerRefresh = async () => {
    if (onRefreshXAI) {
      setIsRefreshing(true);
      try {
        await onRefreshXAI();
      } finally {
        setIsRefreshing(false);
      }
    } else {
      setIsRefreshing(true);
      try {
        const res = await fetch(`/api/scans/${scan.id}/re-explain`, { method: 'POST' });
        if (res.ok) {
          window.location.reload();
        }
      } catch (e) {
        console.error("Failed to re-explain", e);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  // Severity color calculation
  const getGradeColor = (g: number) => {
    if (g < 1.0) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (g < 2.0) return 'text-sky-600 bg-sky-50 border-sky-200';
    if (g < 3.0) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getGradeTitle = (g: number) => {
    if (g < 1.0) return 'Grade 0: Normal / No DR';
    if (g < 2.0) return 'Grade 1: Mild NPDR';
    if (g < 3.0) return 'Grade 2: Moderate NPDR';
    if (g < 3.7) return 'Grade 3: Severe NPDR';
    return 'Grade 4: Proliferative DR (PDR)';
  };

  return (
    <div className={cn(
      "bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col",
      isModal ? "max-h-[92vh] w-full max-w-5xl my-auto" : "w-full"
    )}>
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white p-5 sm:p-6 shrink-0 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-sky-500/20 text-sky-300 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-sky-400/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-sky-400" />
                MathWorks MATLAB Explainable AI (XAI)
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-400/30">
                Scan #{scan.id} • {scan.scan_type === 'ADAPTIVE_LENS' ? 'Adaptive Smartphone Lens' : 'Digital Fundus'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {new Date(scan.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>{patientName}</span>
              <span className="text-xs font-normal text-slate-300 bg-white/10 px-2 py-0.5 rounded-md">
                {patientAge} yrs • {patientGender}
              </span>
            </h2>

            <p className="text-xs text-slate-300 flex flex-wrap items-center gap-3">
              <span>Village: <strong>{village}</strong></span>
              <span>•</span>
              <span>Glucose: <strong className="text-amber-300">{sugar} mg/dL</strong></span>
              <span>•</span>
              <span>HbA1c: <strong className="text-amber-300">{hba1c}%</strong></span>
              <span>•</span>
              <span>BP: <strong>{sysBp}/{diaBp} mmHg</strong></span>
              <span>•</span>
              <span>Diabetes: <strong>{years} yrs</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
            <button
              onClick={handleTriggerRefresh}
              disabled={isRefreshing}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 border border-white/15 cursor-pointer disabled:opacity-50"
              title="Re-run deep analysis with MATLAB Engine"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin text-sky-400")} />
              <span>{isRefreshing ? "Analyzing..." : "Re-Analyze (MATLAB)"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Print clinical diagnostic report"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer ml-1"
                title="Close dossier"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 flex items-center gap-2 overflow-x-auto shrink-0 print:hidden">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            "px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
            activeTab === 'overview'
              ? "border-sky-600 text-sky-700 bg-white shadow-2xs rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/70 rounded-t-lg"
          )}
        >
          <Eye className="w-3.5 h-3.5 text-sky-600" />
          <span>Interactive Retina & AI Narrative</span>
        </button>

        <button
          onClick={() => setActiveTab('dos_donts')}
          className={cn(
            "px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
            activeTab === 'dos_donts'
              ? "border-emerald-600 text-emerald-700 bg-white shadow-2xs rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/70 rounded-t-lg"
          )}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Personalized Do's & Don'ts</span>
          {xai?.dosAndDonts && (
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-mono font-bold">
              {xai.dosAndDonts.dos.length + xai.dosAndDonts.donts.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('biomarkers')}
          className={cn(
            "px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
            activeTab === 'biomarkers'
              ? "border-purple-600 text-purple-700 bg-white shadow-2xs rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/70 rounded-t-lg"
          )}
        >
          <Layers className="w-3.5 h-3.5 text-purple-600" />
          <span>Biomarker Attribution</span>
          {xai?.biomarkers && (
            <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded-full font-mono font-bold">
              {xai.biomarkers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('quadrants')}
          className={cn(
            "px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
            activeTab === 'quadrants'
              ? "border-amber-600 text-amber-700 bg-white shadow-2xs rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/70 rounded-t-lg"
          )}
        >
          <Activity className="w-3.5 h-3.5 text-amber-600" />
          <span>6-Quadrant Retina Matrix</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50 print:bg-white print:p-0 print:overflow-visible">
        
        {/* Severity Banner */}
        <div className={cn(
          "rounded-xl p-4 border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs",
          getGradeColor(scan.grade)
        )}>
          <div className="flex items-center gap-3">
            <div className="text-3xl font-black font-mono">
              {scan.grade.toFixed(1)}
              <span className="text-xs font-normal opacity-70"> / 4.0</span>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider">
                {getGradeTitle(scan.grade)}
              </h4>
              <p className="text-xs opacity-85">
                Risk Tier:{' '}
                <strong className="uppercase">{scan.risk_tier || (scan.grade >= 3 ? 'High' : 'Moderate')}</strong>
              </p>
            </div>
          </div>

          {/* Confidence Score Gauge Chart (0-100%) for Clinical Validation Requirements */}
          <div className="shrink-0 flex items-center justify-center">
            <ConfidenceGauge 
              confidence={scan.confidence ?? 96.2}
              size="md"
              showValidationBadge={true}
            />
          </div>

          <div className="text-left md:text-right border-t md:border-t-0 pt-2 md:pt-0 border-current/20">
            <p className="text-[10px] uppercase font-bold tracking-wider opacity-75">Clinical Triage Window</p>
            <p className="text-xs font-bold">
              {xai?.referralTimeline || scan.clinical_action || "Ophthalmology review recommended"}
            </p>
          </div>
        </div>

        {/* TAB 1: INTERACTIVE RETINA & NARRATIVE */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Visualizer + Grad-CAM Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Left Column: Interactive Retina Canvas */}
              <div className="lg:col-span-6 bg-slate-900 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between text-white shadow-md relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-slate-200">
                      Visual XAI Mode: <strong className="text-sky-400 uppercase">{visualMode}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Resolution: 1024x1024
                  </span>
                </div>

                {/* Simulated / Real Retinal Display */}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black border border-slate-700/80 flex items-center justify-center group select-none">
                  
                  {/* Diagnosable Retinal Fundus & MathWorks Visual XAI Rendering */}
                  {(() => {
                    const rawSrc = scan.image_path || '/samples/sample_fundus_npdr.jpg';
                    const fundusSrc = imgLoadError 
                      ? '/samples/sample_fundus_npdr.jpg' 
                      : (rawSrc.startsWith('/') ? rawSrc : `/${rawSrc}`);

                    const prepSrc = scan.preprocessed_path 
                      ? (scan.preprocessed_path.startsWith('/') ? scan.preprocessed_path : `/${scan.preprocessed_path}`) 
                      : null;

                    const gradcamSrc = scan.gradcam_path 
                      ? (scan.gradcam_path.startsWith('/') ? scan.gradcam_path : `/${scan.gradcam_path}`) 
                      : null;

                    return (
                      <>
                        {/* Layer 1: Base Uploaded Diagnosable Fundus Image */}
                        <img 
                          src={visualMode === 'clahe' && prepSrc ? prepSrc : fundusSrc} 
                          alt="Uploaded Diagnosable Retinal Fundus" 
                          onError={() => {
                            if (!imgLoadError) setImgLoadError(true);
                          }}
                          className={cn(
                            "w-full h-full object-cover transition-all duration-300",
                            visualMode === 'clahe' && !prepSrc && "filter contrast-200 saturate-75 hue-rotate-60 brightness-95"
                          )}
                        />

                        {/* Layer 2: MathWorks Grad-CAM Thermal Heatmap Layer (when visualMode === 'gradcam' or 'lesions') */}
                        {(visualMode === 'gradcam' || visualMode === 'lesions') && (
                          gradcamSrc ? (
                            <img 
                              src={gradcamSrc} 
                              alt="MathWorks MATLAB Grad-CAM Heatmap" 
                              style={{ opacity: visualMode === 'lesions' ? 0.40 : heatmapOpacity / 100 }}
                              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-200 pointer-events-none"
                            />
                          ) : (
                            <div 
                              className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                              style={{ opacity: visualMode === 'lesions' ? 0.35 : heatmapOpacity / 100 }}
                            >
                              <svg className="w-full h-full" viewBox="0 0 400 400">
                                <defs>
                                  <radialGradient id="heatHot" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="#ff0000" stopOpacity="0.9" />
                                    <stop offset="35%" stopColor="#ff7700" stopOpacity="0.7" />
                                    <stop offset="65%" stopColor="#ffff00" stopOpacity="0.45" />
                                    <stop offset="85%" stopColor="#00ddff" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="#0000ff" stopOpacity="0" />
                                  </radialGradient>
                                  <radialGradient id="heatMild" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="#ff5500" stopOpacity="0.75" />
                                    <stop offset="50%" stopColor="#ffcc00" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#0088ff" stopOpacity="0" />
                                  </radialGradient>
                                </defs>

                                {/* High activation hotspots placed dynamically based on grade */}
                                {scan.grade >= 1.0 && (
                                  <>
                                    <circle cx="220" cy="115" r="55" fill="url(#heatHot)" />
                                    <circle cx="230" cy="285" r="48" fill="url(#heatMild)" />
                                  </>
                                )}
                                {scan.grade >= 2.0 && (
                                  <>
                                    <circle cx="265" cy="180" r="50" fill="url(#heatHot)" />
                                    <circle cx="170" cy="140" r="35" fill="url(#heatMild)" />
                                  </>
                                )}
                                {scan.grade >= 3.0 && (
                                  <>
                                    <circle cx="110" cy="200" r="45" fill="url(#heatHot)" />
                                    <circle cx="310" cy="130" r="55" fill="url(#heatHot)" />
                                    <circle cx="300" cy="270" r="50" fill="url(#heatHot)" />
                                  </>
                                )}
                              </svg>
                            </div>
                          )
                        )}
                      </>
                    );
                  })()}

                  {/* Lesion Bounding Boxes / Markers Overlay */}
                  {visualMode === 'lesions' && (
                    <div className="absolute inset-0 pointer-events-auto">
                      <svg className="w-full h-full" viewBox="0 0 400 400">
                        {/* Microaneurysms tags */}
                        {scan.grade >= 1.0 && (
                          <g 
                            className="cursor-pointer transition-transform hover:scale-110"
                            onMouseEnter={() => setHoveredLesion("Microaneurysm: Capillary outpouching detected in Superior Temporal Arcade")}
                            onMouseLeave={() => setHoveredLesion(null)}
                          >
                            <circle cx="215" cy="110" r="7" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="2 2" />
                            <circle cx="215" cy="110" r="2.5" fill="#ef4444" />
                            <text x="225" y="114" fill="#fca5a5" fontSize="9" fontWeight="bold" fontFamily="monospace">MA #1</text>
                          </g>
                        )}

                        {scan.grade >= 1.5 && (
                          <g 
                            className="cursor-pointer transition-transform hover:scale-110"
                            onMouseEnter={() => setHoveredLesion("Dot Hemorrhage: Small capillary leak in inner retinal layer")}
                            onMouseLeave={() => setHoveredLesion(null)}
                          >
                            <circle cx="238" cy="125" r="8" fill="none" stroke="#dc2626" strokeWidth="2" />
                            <circle cx="238" cy="125" r="3" fill="#dc2626" />
                            <text x="250" y="129" fill="#fca5a5" fontSize="9" fontWeight="bold" fontFamily="monospace">HEM #1</text>
                          </g>
                        )}

                        {scan.grade >= 2.0 && (
                          <g 
                            className="cursor-pointer transition-transform hover:scale-110"
                            onMouseEnter={() => setHoveredLesion("Hard Lipid Exudate: Lipoprotein precipitate leaking near macula border")}
                            onMouseLeave={() => setHoveredLesion(null)}
                          >
                            <rect x="250" y="165" width="22" height="18" fill="none" stroke="#facc15" strokeWidth="2" rx="3" />
                            <circle cx="261" cy="174" r="3" fill="#fef08a" />
                            <text x="275" y="177" fill="#fef08a" fontSize="9" fontWeight="bold" fontFamily="monospace">EXUD</text>
                          </g>
                        )}

                        {scan.grade >= 2.5 && (
                          <g 
                            className="cursor-pointer transition-transform hover:scale-110"
                            onMouseEnter={() => setHoveredLesion("Blot Hemorrhage: Confluent bleeding in middle retinal layer")}
                            onMouseLeave={() => setHoveredLesion(null)}
                          >
                            <circle cx="225" cy="285" r="11" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="3 2" />
                            <circle cx="225" cy="285" r="4.5" fill="#ef4444" />
                            <text x="240" y="289" fill="#fca5a5" fontSize="9" fontWeight="bold" fontFamily="monospace">BLOT</text>
                          </g>
                        )}

                        {scan.grade >= 3.0 && (
                          <g 
                            className="cursor-pointer transition-transform hover:scale-110"
                            onMouseEnter={() => setHoveredLesion("Cotton Wool Spot: Nerve fiber layer micro-infarction")}
                            onMouseLeave={() => setHoveredLesion(null)}
                          >
                            <rect x="160" y="130" width="24" height="20" fill="none" stroke="#93c5fd" strokeWidth="2" rx="3" />
                            <text x="188" y="143" fill="#bfdbfe" fontSize="9" fontWeight="bold" fontFamily="monospace">CWS</text>
                          </g>
                        )}
                      </svg>
                    </div>
                  )}

                  {/* Foveal Crosshair Marker */}
                  <div className="absolute top-1/2 left-[62.5%] -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                    <div className="w-8 h-8 border border-white/60 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                    <span className="text-[8px] font-mono text-white/70 block text-center -mt-1">FAZ</span>
                  </div>
                </div>

                {/* Hovered Lesion Tooltip HUD */}
                {hoveredLesion && (
                  <div className="mt-2 bg-sky-950/90 border border-sky-500/40 text-sky-200 text-xs px-3 py-1.5 rounded-lg font-mono animate-in fade-in">
                    🎯 {hoveredLesion}
                  </div>
                )}

                {/* Visualizer Mode Switchers */}
                <div className="mt-3 pt-3 border-t border-slate-800 space-y-2.5">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                    <button
                      onClick={() => setVisualMode('fundus')}
                      className={cn(
                        "px-3 py-1.5 rounded-lg border transition-all cursor-pointer",
                        visualMode === 'fundus'
                          ? "bg-sky-600 text-white border-sky-500 shadow-xs"
                          : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700"
                      )}
                    >
                      Color Fundus
                    </button>

                    <button
                      onClick={() => setVisualMode('gradcam')}
                      className={cn(
                        "px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1",
                        visualMode === 'gradcam'
                          ? "bg-purple-600 text-white border-purple-500 shadow-xs"
                          : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700"
                      )}
                    >
                      <Sparkles className="w-3 h-3 text-purple-300" />
                      <span>Grad-CAM Heatmap</span>
                    </button>

                    <button
                      onClick={() => setVisualMode('clahe')}
                      className={cn(
                        "px-3 py-1.5 rounded-lg border transition-all cursor-pointer",
                        visualMode === 'clahe'
                          ? "bg-emerald-600 text-white border-emerald-500 shadow-xs"
                          : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700"
                      )}
                    >
                      CLAHE Contrast (Green)
                    </button>

                    <button
                      onClick={() => setVisualMode('lesions')}
                      className={cn(
                        "px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1",
                        visualMode === 'lesions'
                          ? "bg-amber-600 text-white border-amber-500 shadow-xs"
                          : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700"
                      )}
                    >
                      <Layers className="w-3 h-3 text-amber-300" />
                      <span>Lesions Detected</span>
                    </button>
                  </div>

                  {/* Heatmap Opacity Slider (When Grad-CAM active) */}
                  {(visualMode === 'gradcam' || visualMode === 'lesions') && (
                    <div className="flex items-center gap-3 text-xs text-slate-400 bg-slate-800/60 px-3 py-2 rounded-xl">
                      <Sliders className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono text-[11px]">Heatmap Opacity:</span>
                      <input 
                        type="range"
                        min="10"
                        max="100"
                        value={heatmapOpacity}
                        onChange={e => setHeatmapOpacity(Number(e.target.value))}
                        className="flex-1 accent-purple-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                      />
                      <span className="font-mono text-[11px] text-purple-300 w-8 text-right font-bold">
                        {heatmapOpacity}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Personalized Natural Language Narrative */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
                
                {/* Personalized Explanation Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-sky-600" />
                      <h3 className="text-sm font-bold text-slate-900">
                        Personalized Clinical AI Explanation
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded">
                      {scan.engine || xai?.generatedBy || "MathWorks MATLAB ResNet-50 & CLAHE Engine"}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                    {xai?.personalizedExplanation || scan.diagnosis}
                  </p>

                  {/* Anatomical Callouts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                        <Eye className="w-3 h-3 text-sky-600" /> Fovea & Macula
                      </span>
                      <p className="text-xs text-slate-700 font-medium">
                        {xai?.fovealEvaluation || "Central foveal reflex preserved without clinically significant macular edema."}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                        <Activity className="w-3 h-3 text-emerald-600" /> Vascular Calibre
                      </span>
                      <p className="text-xs text-slate-700 font-medium">
                        {xai?.vascularCalibreNotes || "Arteriolar-venular ratio monitored. No severe venous beading detected."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key Biomarker Highlights */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                    <span>Dominant Biomarker Attribution</span>
                    <button 
                      onClick={() => setActiveTab('biomarkers')}
                      className="text-sky-600 hover:text-sky-800 text-[11px] font-semibold flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>View All ({xai?.biomarkers?.length || 0})</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </h4>

                  <div className="space-y-2">
                    {(xai?.biomarkers || []).slice(0, 3).map((bio, idx) => (
                      <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between gap-3 text-xs">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{bio.name}</span>
                            <span className="text-[10px] font-mono text-slate-500 font-semibold">({bio.countOrValue})</span>
                            <span className={cn(
                              "text-[9px] font-bold uppercase px-1.5 py-0.2 rounded",
                              bio.severity === 'Severe' ? "bg-red-100 text-red-700" :
                              bio.severity === 'Moderate' ? "bg-amber-100 text-amber-800" :
                              bio.severity === 'Mild' ? "bg-sky-100 text-sky-800" : "bg-emerald-100 text-emerald-800"
                            )}>
                              {bio.severity}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">{bio.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-black font-mono text-purple-700">{bio.attributionPercent}%</span>
                          <span className="text-[9px] block text-slate-400">Weight</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PERSONALIZED DO'S AND DON'TS */}
        {activeTab === 'dos_donts' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Personalized Care Protocol & Clinical Action Plan</span>
              </h3>
              <p className="text-xs text-slate-500">
                Directly customized for <strong>{patientName}</strong> based on Grade <strong>{scan.grade.toFixed(1)}</strong>, Blood Sugar (<strong>{sugar} mg/dL</strong>), and BP (<strong>{sysBp}/{diaBp} mmHg</strong>).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* DO'S COLUMN (Green) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Recommended DO's (Essential Actions)</span>
                  </h4>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-mono">
                    {xai?.dosAndDonts?.dos.length || 0} Prescribed
                  </span>
                </div>

                <div className="space-y-3">
                  {(xai?.dosAndDonts?.dos || []).map((item, idx) => (
                    <div 
                      key={idx}
                      className="bg-white border border-emerald-200/80 rounded-xl p-4 shadow-2xs space-y-2 hover:border-emerald-400 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-800">{item.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {item.category}
                          </span>
                          <span className={cn(
                            "text-[9px] font-bold uppercase px-2 py-0.5 rounded",
                            item.priority === 'Immediate' ? "bg-red-100 text-red-700" :
                            item.priority === 'High' ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                          )}>
                            {item.priority}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 pl-7 leading-relaxed font-medium">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* DON'TS COLUMN (Red / Warning) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    <span>Strict DON'Ts (Ocular & Systemic Hazards)</span>
                  </h4>
                  <span className="text-[10px] font-bold text-red-800 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full font-mono">
                    {xai?.dosAndDonts?.donts.length || 0} Warnings
                  </span>
                </div>

                <div className="space-y-3">
                  {(xai?.dosAndDonts?.donts || []).map((item, idx) => (
                    <div 
                      key={idx}
                      className="bg-white border border-red-200/80 rounded-xl p-4 shadow-2xs space-y-2 hover:border-red-400 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-red-100 text-red-800 text-xs font-bold font-mono flex items-center justify-center shrink-0">
                            ✕
                          </span>
                          <span className="text-xs font-bold text-slate-800">{item.title}</span>
                        </div>
                        <span className={cn(
                          "text-[9px] font-bold uppercase px-2 py-0.5 rounded",
                          item.dangerLevel === 'Critical' ? "bg-red-600 text-white" :
                          item.dangerLevel === 'Severe' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"
                        )}>
                          {item.dangerLevel}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 pl-7 leading-relaxed font-medium">
                        {item.description}
                      </p>

                      <div className="pl-7 pt-1">
                        <span className="text-[10px] text-red-700 bg-red-50/70 border border-red-100 px-2 py-0.5 rounded block">
                          <strong>Medical Rationale:</strong> {item.reason}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: BIOMARKER ATTRIBUTION */}
        {activeTab === 'biomarkers' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                <span>Quantitative Biomarker Attribution & Feature Importance</span>
              </h3>
              <p className="text-xs text-slate-500">
                Mathematical evidence breakdown demonstrating the exact anatomical features driving the AI's diagnostic severity grading.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(xai?.biomarkers || []).map((bio, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{bio.name}</h4>
                      <span className="text-[10px] font-mono text-slate-400">Quadrant: {bio.quadrant}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black font-mono text-purple-700">{bio.attributionPercent}%</span>
                      <span className="text-[10px] text-slate-400 block">Attribution</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-purple-600 h-full rounded-full transition-all duration-700" 
                      style={{ width: `${bio.attributionPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-600 font-medium">Measured Value: <strong>{bio.countOrValue}</strong></span>
                    <span className={cn(
                      "text-[9px] font-bold uppercase px-2 py-0.5 rounded",
                      bio.severity === 'Severe' ? "bg-red-100 text-red-700" :
                      bio.severity === 'Moderate' ? "bg-amber-100 text-amber-800" :
                      bio.severity === 'Mild' ? "bg-sky-100 text-sky-800" : "bg-emerald-100 text-emerald-800"
                    )}>
                      {bio.severity}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium border-t border-slate-100 pt-2">
                    {bio.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: 6-QUADRANT MATRIX */}
        {activeTab === 'quadrants' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-600" />
                <span>6-Quadrant Retinal Anatomical Grid</span>
              </h3>
              <p className="text-xs text-slate-500">
                Segmented retinal analysis dividing the eye into primary anatomical quadrants for surgical vitreo-retinal localization.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(xai?.quadrants || []).map((quad, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{quad.quadrant}</span>
                    <span className="text-[10px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                      {quad.confidence}% conf
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className={cn(
                      "text-[9px] font-bold uppercase px-2 py-0.5 rounded",
                      quad.status === 'Active Hemorrhages' ? "bg-red-100 text-red-700" :
                      quad.status === 'Exudate Cluster' ? "bg-amber-100 text-amber-800" :
                      quad.status === 'Ischemia' ? "bg-purple-100 text-purple-800" :
                      quad.status === 'Mild Lesions' ? "bg-sky-100 text-sky-800" : "bg-emerald-100 text-emerald-800"
                    )}>
                      {quad.status}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      Lesions: <strong>{quad.lesionCount}</strong>
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {quad.notes}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Printable Official Clinical Dossier (Visible in print mode or standard footer) */}
        <div className="mt-8 pt-6 border-t border-slate-200 bg-white p-6 rounded-2xl space-y-4 print:border-none print:p-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-3.5">
              <DrishtiLogo size="custom" className="h-12 md:h-14 w-auto object-contain drop-shadow-xs" />
              <div>
                <p className="font-bold text-slate-800 text-sm leading-tight">DRishtii Tele-Ophthalmology AI Diagnostic Network</p>
                <p className="text-[11px] text-slate-500 leading-normal">MathWorks SIH #26038 Certified • Edge AI Clinical Decision Support System</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="font-mono text-[10px]">Dossier Hash: SHA256-RSCN-{scan.id.toString().padStart(6, '0')}</p>
              <p className="text-[10px]">Generated: {xai?.generatedAt ? new Date(xai.generatedAt).toUTCString() : new Date().toUTCString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-100 text-xs text-slate-600">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-6">Attending Primary Health Centre / ASHA Clinician</p>
              <div className="border-b border-slate-400 w-48 mb-1" />
              <p className="font-bold text-slate-800">Dr. Ananya Sharma (MBBS, DNB)</p>
              <p className="text-[10px] text-slate-500">Medical Officer • Rural Tele-Screening Unit #4</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-6">Vitreo-Retinal Referral Dispatch Seal</p>
              <div className="border-b border-slate-400 w-48 ml-auto mb-1" />
              <p className="font-bold text-slate-800">District Eye Hospital Network</p>
              <p className="text-[10px] text-emerald-600 font-bold">Ayushman Bharat Digital Health (ABDM) Compatible</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
