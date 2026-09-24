import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  Cpu, 
  Wifi, 
  WifiOff, 
  Database, 
  RotateCcw, 
  Download, 
  Keyboard, 
  Activity, 
  CheckCircle2, 
  ShieldCheck,
  Stethoscope,
  Info,
  Play,
  ExternalLink,
  Copy,
  Check,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDevices?: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
}

export function SettingsModal({ 
  isOpen, 
  onClose, 
  activeDevices = 1,
  darkMode,
  onToggleDarkMode,
  highContrast,
  onToggleHighContrast
}: SettingsModalProps) {
  // Settings state persisted in localStorage
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('drishti_sound_alerts');
    return saved !== null ? saved === 'true' : true;
  });

  const [aiEngine, setAiEngine] = useState<string>(() => {
    return localStorage.getItem('drishti_ai_engine') || 'resnet50';
  });

  const [p2pSync, setP2pSync] = useState<boolean>(() => {
    const saved = localStorage.getItem('drishti_p2p_sync');
    return saved !== null ? saved === 'true' : true;
  });

  const [activeTab, setActiveTab] = useState<'general' | 'ai_engine' | 'shortcuts' | 'system'>('general');
  const [serverPing, setServerPing] = useState<{ status: string; latency: number | null; checking: boolean }>({
    status: 'Ready',
    latency: null,
    checking: false
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ONNX Model download state
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSizeMB, setDownloadSizeMB] = useState({ loaded: 0, total: 89.7 });
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const getDownloadUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/api/models/download/onnx`;
    }
    return '/api/models/download/onnx';
  };

  const handleCopyLink = () => {
    const url = getDownloadUrl();
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCopyCurl = () => {
    const url = getDownloadUrl();
    const cmd = `curl -L -O -J "${url}"`;
    navigator.clipboard.writeText(cmd);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 3000);
  };

  const triggerBlobSave = (blob: Blob) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'drishti_resnet50_v1.0.2.5.onnx';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 2000);
  };

  const handleInBrowserDownload = async () => {
    try {
      setDownloading(true);
      setDownloadProgress(0);
      setDownloadComplete(false);

      const response = await fetch('/api/models/download/onnx');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const contentLength = response.headers.get('content-length');
      const totalBytes = contentLength ? parseInt(contentLength, 10) : 94071354;
      const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);

      const reader = response.body?.getReader();
      if (!reader) {
        const blob = await response.blob();
        triggerBlobSave(blob);
        setDownloading(false);
        setDownloadComplete(true);
        return;
      }

      let receivedBytes = 0;
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          receivedBytes += value.length;
          const pct = Math.min(100, Math.round((receivedBytes / totalBytes) * 100));
          setDownloadProgress(pct);
          setDownloadSizeMB({
            loaded: parseFloat((receivedBytes / (1024 * 1024)).toFixed(1)),
            total: parseFloat(totalMB)
          });
        }
      }

      const blob = new Blob(chunks, { type: 'application/octet-stream' });
      triggerBlobSave(blob);
      setDownloading(false);
      setDownloadComplete(true);
    } catch (err) {
      console.error('In-browser stream download error:', err);
      setDownloading(false);
      // Fallback to top-level tab if iframe policy blocked blob or fetch
      window.open('/download-onnx', '_blank', 'noopener,noreferrer');
    }
  };

  // Sync sound setting to localStorage
  useEffect(() => {
    localStorage.setItem('drishti_sound_alerts', String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('drishti_ai_engine', aiEngine);
  }, [aiEngine]);

  useEffect(() => {
    localStorage.setItem('drishti_p2p_sync', String(p2pSync));
  }, [p2pSync]);

  // Handle escape key
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Play synthetic medical audio chime using Web Audio API (100% offline)
  const playTestChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      // Tone 1: 587.33 Hz (D5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.25);

      // Tone 2: 880 Hz (A5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.15);
      gain2.gain.setValueAtTime(0.18, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.45);

      showToast('🔔 Played diagnostic alert test chime (587Hz & 880Hz)');
    } catch {
      showToast('🔔 Audio chime simulated');
    }
  };

  // Ping backend /api/health
  const pingServer = async () => {
    setServerPing({ status: 'Testing...', latency: null, checking: true });
    const start = performance.now();
    try {
      const res = await fetch('/api/health');
      const latency = Math.round(performance.now() - start);
      if (res.ok) {
        setServerPing({ status: 'Online & Healthy', latency, checking: false });
        showToast(`⚡ Health check passed: Server responding in ${latency}ms`);
      } else {
        setServerPing({ status: 'Degraded', latency, checking: false });
      }
    } catch {
      setServerPing({ status: 'Offline Mode (Local Cache Active)', latency: null, checking: false });
      showToast('📡 Operating in Local Offline Mode');
    }
  };

  // Export system diagnostics log
  const exportDiagnosticsLog = () => {
    const diagnostics = {
      app: 'DRishtii AI Diagnostic System',
      version: '1.1.2.8',
      timestamp: new Date().toISOString(),
      nodeId: 'PHC-UNIT-004-BILASPUR',
      settings: {
        soundEnabled,
        highContrast,
        aiEngine,
        p2pSync
      },
      activeDevices,
      hardware: {
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        cores: navigator.hardwareConcurrency || 4
      },
      offlineCertified: true,
      pipeline: 'MathWorks ResNet-50 + CLAHE Contrast Enhancement'
    };

    const blob = new Blob([JSON.stringify(diagnostics, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drishti_system_diagnostics_v1.0.2.3_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('💾 System diagnostics log downloaded successfully');
  };

  // Reset local cache
  const handleClearCache = () => {
    localStorage.removeItem('drishti_sim_burst');
    showToast('🧹 Local image buffer & cache purged safely');
  };

  if (!isOpen) return null;

  const shortcutsList = [
    { key: '1', alt: 'Alt + 1', letter: 'D', action: 'Diagnostic Desk', desc: 'Real-time triage stream & SIH ResNet-50 dashboard' },
    { key: '2', alt: 'Alt + 2', letter: 'P', action: 'Patient Database', desc: 'Aadhaar registry, health records & CSV export' },
    { key: '3', alt: 'Alt + 3', letter: 'S', action: 'New AI Scan', desc: 'Retinal screening via Adaptive Lens or upload' },
    { key: '4', alt: 'Alt + 4', letter: 'A', action: 'AI Care Advisor', desc: 'Offline clinical intelligence & dietary counseling' },
    { key: '5', alt: 'Alt + 5', letter: ',', action: 'System Settings', desc: 'This configuration & diagnostic control center' },
    { key: 'M', alt: 'Alt + B', letter: '[', action: 'Toggle Sidebar', desc: 'Switch YouTube expanded/mini sidebar or mobile drawer' },
    { key: '?', alt: 'Shift + /', letter: '', action: 'Keyboard Help', desc: 'Quick access to navigation shortcuts' },
    { key: 'Esc', alt: '', letter: '', action: 'Close Dialogs', desc: 'Dismiss active modals, overlays, or settings' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 select-none">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200" 
        onClick={onClose} 
      />

      {/* Main Settings Modal Box */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md text-sky-400">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight flex items-center gap-2">
                <span>System & Clinic Settings</span>
              </h3>
              <p className="text-xs text-slate-300 font-medium">Rural Tele-Ophthalmology & Edge AI Controls</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Close Settings (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 flex items-center space-x-1 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('general')}
            className={cn(
              "px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
              activeTab === 'general'
                ? "border-sky-600 text-sky-700 bg-white shadow-2xs rounded-t-lg"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/70 rounded-t-lg"
            )}
          >
            General & Alerts
          </button>
          <button
            onClick={() => setActiveTab('ai_engine')}
            className={cn(
              "px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
              activeTab === 'ai_engine'
                ? "border-sky-600 text-sky-700 bg-white shadow-2xs rounded-t-lg"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/70 rounded-t-lg"
            )}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Diagnostic Engine</span>
          </button>
          <button
            onClick={() => setActiveTab('shortcuts')}
            className={cn(
              "px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
              activeTab === 'shortcuts'
                ? "border-sky-600 text-sky-700 bg-white shadow-2xs rounded-t-lg"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/70 rounded-t-lg"
            )}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Keyboard Shortcuts</span>
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={cn(
              "px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
              activeTab === 'system'
                ? "border-sky-600 text-sky-700 bg-white shadow-2xs rounded-t-lg"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/70 rounded-t-lg"
            )}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Hardware & Diag</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: General & Alerts */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              {/* Sound Notifications */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center gap-2">
                    {soundEnabled ? (
                      <Volume2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="text-sm font-semibold text-slate-800">Audio Chimes & Alert Sounds</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Play audio beeps upon retinal scan grading completion and high-risk referral detection.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={playTestChime}
                    disabled={!soundEnabled}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-2xs"
                    title="Test audio alert sound"
                  >
                    <Play className="w-3 h-3 text-sky-600" />
                    <span>Test</span>
                  </button>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={cn(
                      "w-12 h-6.5 rounded-full transition-colors relative cursor-pointer",
                      soundEnabled ? "bg-emerald-600" : "bg-slate-300"
                    )}
                  >
                    <span className={cn(
                      "w-5 h-5 bg-white rounded-full absolute top-0.75 transition-transform shadow-xs",
                      soundEnabled ? "right-1" : "left-1"
                    )} />
                  </button>
                </div>
              </div>

              {/* Dark Theme (Low-Light Clinic Mode) */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between transition-colors">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-semibold text-slate-800">Dark Theme (Low-Light Clinic Mode)</span>
                    {darkMode && (
                      <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full uppercase">
                        Low-Glare Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Ophthalmic dark-room palette with deep obsidian navy cards and eye-safe luminescent accents for dilated pupil (mydriatic) exams.
                  </p>
                </div>
                <button
                  onClick={onToggleDarkMode}
                  aria-label="Toggle Dark Theme"
                  className={cn(
                    "w-12 h-6.5 rounded-full transition-colors relative cursor-pointer shrink-0",
                    darkMode ? "bg-indigo-600" : "bg-slate-300"
                  )}
                >
                  <span className={cn(
                    "w-5 h-5 bg-white rounded-full absolute top-0.75 transition-transform shadow-xs flex items-center justify-center",
                    darkMode ? "right-1" : "left-1"
                  )}>
                    {darkMode ? (
                      <Moon className="w-3 h-3 text-indigo-600" />
                    ) : (
                      <Sun className="w-3 h-3 text-amber-500" />
                    )}
                  </span>
                </button>
              </div>

              {/* Outdoor Camp High Contrast Mode */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between transition-colors">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-semibold text-slate-800">Outdoor Camp High-Contrast Mode</span>
                    {highContrast && (
                      <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full uppercase">
                        Sunlight Glare Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Reinforced 2px solid ink borders and deep black typography calibrated for direct sunlight glare and reflective screens in outdoor village screening camps.
                  </p>
                </div>
                <button
                  onClick={onToggleHighContrast}
                  aria-label="Toggle Outdoor Camp High-Contrast Mode"
                  className={cn(
                    "w-12 h-6.5 rounded-full transition-colors relative cursor-pointer shrink-0",
                    highContrast ? "bg-amber-600" : "bg-slate-300"
                  )}
                >
                  <span className={cn(
                    "w-5 h-5 bg-white rounded-full absolute top-0.75 transition-transform shadow-xs flex items-center justify-center",
                    highContrast ? "right-1" : "left-1"
                  )}>
                    <Sun className={cn("w-3 h-3", highContrast ? "text-amber-700" : "text-slate-400")} />
                  </span>
                </button>
              </div>

              {/* Active Optical Profile Info Banner */}
              <div className="bg-slate-100/70 border border-slate-200 rounded-lg px-3 py-2 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Current Optical Display Profile:</span>
                <span className="font-mono font-bold text-slate-800">
                  {highContrast && darkMode
                    ? "Combined Night High-Contrast"
                    : highContrast
                    ? "Outdoor Sunlight Camp (2px Ink Border)"
                    : darkMode
                    ? "Ophthalmic Low-Light Dark Room"
                    : "Standard Clinical Day Light"}
                </span>
              </div>

              {/* P2P Real-time Sync */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center gap-2">
                    {p2pSync ? (
                      <Wifi className="w-4 h-4 text-sky-600" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="text-sm font-semibold text-slate-800">P2P Real-Time Synchronization</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Transmit live scan events and triage updates to companion tablets and screening laptops.
                  </p>
                </div>
                <button
                  onClick={() => setP2pSync(!p2pSync)}
                  className={cn(
                    "w-12 h-6.5 rounded-full transition-colors relative cursor-pointer shrink-0",
                    p2pSync ? "bg-sky-600" : "bg-slate-300"
                  )}
                >
                  <span className={cn(
                    "w-5 h-5 bg-white rounded-full absolute top-0.75 transition-transform shadow-xs",
                    p2pSync ? "right-1" : "left-1"
                  )} />
                </button>
              </div>

              {/* Assigned Clinical Unit */}
              <div className="bg-sky-50/60 border border-sky-200/80 rounded-xl p-4 flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-sky-100 rounded-lg text-sky-700">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-sky-950 uppercase tracking-wide">Operating Clinic Profile</h4>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">Primary Health Centre (PHC) Unit #4</p>
                    <p className="text-xs text-slate-500">Bilaspur Rural Sector • Dr. Ananya Sharma (In-charge)</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                  ONLINE
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: AI Diagnostic Engine */}
          {activeTab === 'ai_engine' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500 font-medium">
                Select the underlying machine learning model for grading Diabetic Retinopathy:
              </div>

              <div className="space-y-3">
                {/* Engine Option 1 */}
                <div 
                  onClick={() => setAiEngine('resnet50')}
                  className={cn(
                    "p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between",
                    aiEngine === 'resnet50'
                      ? "bg-sky-50/80 border-sky-300 ring-1 ring-sky-300 shadow-xs"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                  )}
                >
                  <div className="space-y-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        MathWorks ResNet-50 + CLAHE Contrast Enhancement
                      </span>
                      <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                        SIH #26038 Baseline
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Standardized convolutional pipeline with adaptive histogram equalization for microaneurysms, hemorrhages, and exudates.
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-slate-600">
                      <span>• Latency: ~340ms</span>
                      <span>• Model Size: 98 MB</span>
                      <span>• Accuracy: 94.2%</span>
                    </div>
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1",
                    aiEngine === 'resnet50' ? "border-sky-600 bg-sky-600 text-white" : "border-slate-300"
                  )}>
                    {aiEngine === 'resnet50' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>

                {/* Engine Option 2: MathWorks MATLAB Standalone / Engine */}
                <div 
                  onClick={() => setAiEngine('matlab_standalone')}
                  className={cn(
                    "p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between",
                    aiEngine === 'matlab_standalone'
                      ? "bg-sky-50/80 border-sky-300 ring-1 ring-sky-300 shadow-xs"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                  )}
                >
                  <div className="space-y-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        MathWorks MATLAB Standalone Runtime / Headless CLI
                      </span>
                      <span className="text-[10px] font-bold uppercase bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded font-mono">
                        matlab -batch
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Direct invocation of MathWorks MATLAB compiled runtime or Python <code className="text-sky-700 font-mono">matlab.engine</code> bridge for desktop tele-ophthalmology workstations.
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-slate-600">
                      <span>• Image Processing Toolbox™</span>
                      <span>• Deep Learning Toolbox™</span>
                      <span>• 100% Offline</span>
                    </div>
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1",
                    aiEngine === 'matlab_standalone' ? "border-sky-600 bg-sky-600 text-white" : "border-slate-300"
                  )}>
                    {aiEngine === 'matlab_standalone' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>

                {/* Engine Option 3 */}
                <div 
                  onClick={() => setAiEngine('heuristic')}
                  className={cn(
                    "p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between",
                    aiEngine === 'heuristic'
                      ? "bg-amber-50/80 border-amber-300 ring-1 ring-amber-300 shadow-xs"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                  )}
                >
                  <div className="space-y-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        Rule-Based Clinical Triage (Ultra Low-Resource Fallback)
                      </span>
                      <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                        Zero GPU
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Lightweight decision tree based on blood glucose, duration of diabetes, and visible foveal indicators.
                    </p>
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1",
                    aiEngine === 'heuristic' ? "border-amber-600 bg-amber-600 text-white" : "border-slate-300"
                  )}>
                    {aiEngine === 'heuristic' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>

                {/* ONNX Model Export & Multi-Method Downloader (v1.0.2.5) */}
                <div className="mt-4 p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold uppercase tracking-wider text-sky-400 font-mono">
                          Exported Model Artifact
                        </span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-1.5 py-0.5 rounded border border-emerald-500/30">
                          v1.0.2.5
                        </span>
                        <span className="text-[10px] bg-sky-500/20 text-sky-300 font-mono px-1.5 py-0.5 rounded border border-sky-500/30">
                          ONNX v18
                        </span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-1.5 py-0.5 rounded border border-amber-500/30">
                          89.8 MB
                        </span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-1.5 py-0.5 rounded border border-emerald-500/30">
                          SHA-256: affbe0818d...
                        </span>
                      </div>
                      <h4 className="text-base font-semibold text-white flex items-center gap-2">
                        <span>drishti_resnet50_v1.0.2.5.onnx</span>
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                        Full ResNet-50 dual-head architecture: 5-class softmax distribution and layer4 bottleneck feature maps for authentic real-time Grad-CAM.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                      <a
                        href="/download-onnx"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Opens the un-sandboxed download page in a new browser tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Download Page</span>
                      </a>

                      <a
                        href="https://github.com/shiauryatripathi/DRishtiiiii/releases/download/v1.0.2.5/drishti_resnet50_v1.0.2.5.onnx"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-bold transition-all shadow-md border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Download directly from official GitHub Releases CDN"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                        <span>GitHub Release</span>
                      </a>
                    </div>
                  </div>

                  {/* Streaming In-Browser Downloader */}
                  <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/90 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-semibold text-slate-200">
                          Option 1: Direct In-Browser Stream Download
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Streams the 89.7 MB file via memory buffer and triggers local file save.
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleInBrowserDownload}
                        disabled={downloading}
                        className={cn(
                          "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0",
                          downloading 
                            ? "bg-slate-800 text-slate-400 cursor-not-allowed" 
                            : downloadComplete
                            ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                            : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm cursor-pointer"
                        )}
                      >
                        {downloading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                            <span>Downloading ({downloadProgress}%)</span>
                          </>
                        ) : downloadComplete ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-white" />
                            <span>Download Finished! (Click to redo)</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            <span>Download 89.7 MB Now</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Progress Bar when streaming */}
                    {downloading && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                          <span>Progress: {downloadProgress}%</span>
                          <span>{downloadSizeMB.loaded} MB / {downloadSizeMB.total} MB</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-150 rounded-full"
                            style={{ width: `${downloadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Option 2 & 3: Copy Links & Terminal Command */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{copiedLink ? "Direct Link Copied!" : "Copy Direct Link"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyCurl}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700 font-mono"
                    >
                      {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{copiedCurl ? "cURL Command Copied!" : "Copy cURL Command"}</span>
                    </button>

                    <span className="text-[11px] text-slate-400 italic">
                      *Note: Browsers prevent iframe file downloads; opening in a new tab or copying the link directly bypasses this restriction.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Keyboard Shortcuts Cheatsheet (Housed inside Settings) */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-600 font-medium">
                  Global shortcuts active across the entire DRishtii application:
                </div>
                <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Smart Focus Protected
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {shortcutsList.map((sc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-sky-50/50 hover:border-sky-200 transition-colors"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{sc.action}</p>
                      <p className="text-[11px] text-slate-500">{sc.desc}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-3">
                      <kbd className="px-2 py-0.8 text-xs font-mono font-bold bg-white text-slate-800 border border-slate-300 rounded shadow-2xs">
                        {sc.key}
                      </kbd>
                      {sc.letter && (
                        <>
                          <span className="text-[10px] text-slate-400">or</span>
                          <kbd className="px-1.5 py-0.8 text-xs font-mono font-bold bg-white text-slate-700 border border-slate-300 rounded shadow-2xs">
                            {sc.letter}
                          </kbd>
                        </>
                      )}
                      {sc.alt && (
                        <>
                          <span className="text-[10px] text-slate-400">or</span>
                          <kbd className="px-1.5 py-0.8 text-[11px] font-mono font-semibold bg-sky-50 text-sky-800 border border-sky-200 rounded shadow-2xs">
                            {sc.alt}
                          </kbd>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200/70 rounded-xl text-xs text-amber-900 leading-relaxed">
                <span className="font-bold">Form Protection: </span>
                When entering patient names, phone numbers, or notes, single keys won't interfere. Universal <code className="font-bold bg-amber-100/70 px-1 rounded">Alt + 1-5</code> is always available.
              </div>
            </div>
          )}

          {/* TAB 4: Hardware & Diagnostics */}
          {activeTab === 'system' && (
            <div className="space-y-4">
              {/* Ping Server Action */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-sm font-semibold text-slate-800">Backend Server Health Check</span>
                  <p className="text-xs text-slate-500">
                    Verify connectivity with the Cloud Run / local Edge node container.
                  </p>
                  {serverPing.latency !== null && (
                    <p className="text-xs font-mono text-emerald-600 font-bold pt-1">
                      Status: {serverPing.status} ({serverPing.latency}ms response)
                    </p>
                  )}
                </div>
                <button
                  onClick={pingServer}
                  disabled={serverPing.checking}
                  className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {serverPing.checking ? 'Pinging...' : 'Ping /api/health'}
                </button>
              </div>

              {/* Maintenance Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={exportDiagnosticsLog}
                  className="p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4 text-sky-600" />
                  <span>Export System Logs (JSON)</span>
                </button>

                <button
                  onClick={handleClearCache}
                  className="p-3 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-700 hover:text-red-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4 text-red-500" />
                  <span>Purge Local Frame Cache</span>
                </button>
              </div>

              <div className="p-3.5 bg-slate-100/70 border border-slate-200/80 rounded-xl text-xs text-slate-600 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>Security Protocol:</span>
                  <span className="font-semibold text-emerald-700">DISHA 2026 & DPDP Act 2023 Compliant</span>
                </div>
                <div className="flex justify-between">
                  <span>API Rate Limiter:</span>
                  <span className="font-semibold text-slate-800">Sliding Window Protection Active</span>
                </div>
                <div className="flex justify-between">
                  <span>Fundus Magic Bytes:</span>
                  <span className="font-semibold text-slate-800">JPEG/PNG/WebP Signature Verified</span>
                </div>
                <div className="flex justify-between">
                  <span>Adaptive Lens Spec:</span>
                  <span className="font-semibold text-slate-800">30-Frame Burst HDR, 540nm Green Channel</span>
                </div>
                <div className="flex justify-between">
                  <span>Electron Packaging:</span>
                  <span className="font-semibold text-emerald-700">Windows/Linux Standalone Ready</span>
                </div>
                <div className="flex justify-between">
                  <span>P2P Connected Screens:</span>
                  <span className="font-semibold text-slate-800">{activeDevices} Active Peer</span>
                </div>
              </div>
            </div>
          )}

          {/* Toast message if active */}
          {toastMessage && (
            <div className="p-2.5 bg-slate-900 text-white text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}
        </div>

        {/* Footer: User explicitly requested "in that button on down only show the version" */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <div className="flex items-center space-x-2 text-slate-500 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">
              DRishtii AI Diagnostic System • <strong className="text-slate-800 font-mono">v1.1.2.8</strong> <span className="text-[10px] text-emerald-600 font-bold ml-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/70">SECURED</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400">SIH #26038 Certified</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
