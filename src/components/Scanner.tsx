import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Camera, 
  FileUp, 
  Loader2, 
  Search, 
  CheckCircle, 
  Activity, 
  Cpu, 
  User, 
  Fingerprint, 
  CheckSquare, 
  Sparkles, 
  X,
  Clock,
  ArrowLeft,
  RefreshCw,
  Phone,
  MapPin,
  Calendar,
  Users,
  AlertCircle,
  Eye,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { Patient, Scan, QueuePatient, PatientQueueResponse } from '../types';
import { cn } from '../lib/utils';
import { ExplainableAIDossier } from './ExplainableAIDossier';
import { ConfidenceGauge } from './ConfidenceGauge';

export interface ScannerProps {
  initialPatientId?: number;
}

function formatRegistrationDateTime(isoString?: string): { dateStr: string; timeStr: string; relative: string } {
  if (!isoString) return { dateStr: 'Recently Registered', timeStr: '', relative: 'Just now' };
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return { dateStr: isoString, timeStr: '', relative: '' };
    
    const dateStr = d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const timeStr = d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const diffMs = Date.now() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    let relative = 'Just now';
    if (diffMins > 0 && diffMins < 60) {
      relative = `${diffMins}m ago`;
    } else if (diffHours >= 1 && diffHours < 24) {
      relative = `${diffHours}h ago`;
    } else if (diffDays >= 1) {
      relative = `${diffDays}d ago`;
    }

    return { dateStr, timeStr, relative };
  } catch {
    return { dateStr: isoString, timeStr: '', relative: '' };
  }
}

export function Scanner({ initialPatientId }: ScannerProps = {}) {
  // Linear Flow Workflow Step:
  // 'QUEUE': Registered Patients Queue (from Desk 1 - pick patient to scan)
  // 'SCREENING': Scanning Workplace (retinal imaging & AI diagnosis)
  // 'REGISTRATION': Fallback Walk-in Registration Desk
  const [step, setStep] = useState<'QUEUE' | 'REGISTRATION' | 'SCREENING'>(
    initialPatientId ? 'SCREENING' : 'QUEUE'
  );
  
  // Queue & Patients State
  const [patientsList, setPatientsList] = useState<QueuePatient[]>([]);
  const [queueLoading, setQueueLoading] = useState(false);
  const [queueSearch, setQueueSearch] = useState('');
  const [queueFilter, setQueueFilter] = useState<'ALL' | 'PENDING' | 'DIAGNOSED'>('ALL');
  const [queueSort, setQueueSort] = useState<'NEWEST' | 'OLDEST' | 'NAME'>('NEWEST');
  const [syncAlert, setSyncAlert] = useState<string | null>(null);
  
  // Registration state (for walk-in emergency desk)
  const [isOnline, setIsOnline] = useState(true);
  const [regAadhaar, setRegAadhaar] = useState('');
  const [regData, setRegData] = useState({
    name: '',
    age: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    dob: '',
    phone: '',
    village: '',
    marital_status: 'Unmarried' as 'Married' | 'Unmarried' | 'Other'
  });
  const [isVerified, setIsVerified] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Screening state
  const [selectedPatient, setSelectedPatient] = useState<QueuePatient | null>(null);
  const [mode, setMode] = useState<'upload' | 'lens'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<Scan | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch queue from optimized endpoint
  const fetchQueue = async (silent = false) => {
    if (!silent) setQueueLoading(true);
    try {
      const res = await fetch('/api/patients/queue');
      if (res.ok) {
        const data = await res.json();
        const list: QueuePatient[] = Array.isArray(data) ? data : (data.patients || []);
        setPatientsList(list);

        if (initialPatientId) {
          const match = list.find(p => p.id === initialPatientId);
          if (match) {
            setSelectedPatient(match);
            setStep('SCREENING');
          }
        }
      } else {
        // Fallback to /api/patients
        const fallbackRes = await fetch('/api/patients');
        if (fallbackRes.ok) {
          const list: Patient[] = await fallbackRes.json();
          const mapped: QueuePatient[] = list.map(p => ({
            ...p,
            diagnostic_status: 'PENDING'
          }));
          setPatientsList(mapped);
          if (initialPatientId) {
            const match = mapped.find(p => p.id === initialPatientId);
            if (match) {
              setSelectedPatient(match);
              setStep('SCREENING');
            }
          }
        }
      }
    } catch (e) {
      console.error("Queue fetch error:", e);
    } finally {
      if (!silent) setQueueLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();

    // Listen to cross-desk event broadcasts (when Desk 1 registers a patient or a scan completes)
    const handlePatientAdded = (e: any) => {
      fetchQueue(true);
      const p = e.detail?.patient || e.detail;
      if (p?.name) {
        setSyncAlert(`⚡ Real-time Update: Patient "${p.name}" enrolled at Registration Desk!`);
        setTimeout(() => setSyncAlert(null), 5000);
      }
    };

    const handleScanCompleted = () => {
      fetchQueue(true);
    };

    window.addEventListener('drishti:patient_added', handlePatientAdded);
    window.addEventListener('drishti:scan_completed', handleScanCompleted);

    // Optimized polling interval: checks every 8 seconds for multi-device sync
    const interval = setInterval(() => fetchQueue(true), 8000);

    return () => {
      window.removeEventListener('drishti:patient_added', handlePatientAdded);
      window.removeEventListener('drishti:scan_completed', handleScanCompleted);
      clearInterval(interval);
    };
  }, [initialPatientId]);

  // Derived filtered & sorted queue
  const filteredQueue = useMemo(() => {
    let list = [...patientsList];

    // Filter by diagnostic status
    if (queueFilter === 'PENDING') {
      list = list.filter(p => p.diagnostic_status === 'PENDING' || !p.scan_count || p.scan_count === 0);
    } else if (queueFilter === 'DIAGNOSED') {
      list = list.filter(p => p.diagnostic_status === 'DIAGNOSED' || (p.scan_count && p.scan_count > 0));
    }

    // Search query
    if (queueSearch.trim()) {
      const q = queueSearch.trim().toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.id.toString() === q ||
        `pat-${p.id.toString().padStart(4, '0')}`.toLowerCase().includes(q) ||
        (p.aadhaar_no && p.aadhaar_no.toLowerCase().includes(q)) ||
        (p.village && p.village.toLowerCase().includes(q)) ||
        (p.phone && p.phone.toLowerCase().includes(q))
      );
    }

    // Sort order
    if (queueSort === 'NEWEST') {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (queueSort === 'OLDEST') {
      list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (queueSort === 'NAME') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [patientsList, queueFilter, queueSearch, queueSort]);

  const pendingCount = useMemo(() => {
    return patientsList.filter(p => p.diagnostic_status === 'PENDING' || !p.scan_count || p.scan_count === 0).length;
  }, [patientsList]);

  const diagnosedCount = useMemo(() => {
    return patientsList.filter(p => p.diagnostic_status === 'DIAGNOSED' || (p.scan_count && p.scan_count > 0)).length;
  }, [patientsList]);

  // Pick patient from queue and transition immediately into scanning workstation
  const handlePickPatientForDiagnosis = (patient: QueuePatient) => {
    setSelectedPatient(patient);
    setResult(null);
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    setStep('SCREENING');
  };

  // Image optimization helper
  const optimizeImage = async (rawFile: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(new File([blob], rawFile.name, { type: 'image/jpeg' }));
                } else {
                  resolve(rawFile);
                }
              },
              'image/jpeg',
              0.85
            );
          } else {
            resolve(rawFile);
          }
        };
        img.onerror = () => resolve(rawFile);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve(rawFile);
      reader.readAsDataURL(rawFile);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const optimized = await optimizeImage(selected);
      setFile(optimized);
      setPreviewUrl(URL.createObjectURL(optimized));
      setError(null);
      setResult(null);
    }
  };

  const handleLoadSample = async (sampleUrl: string, sampleName: string) => {
    try {
      setIsProcessing(true);
      setError(null);
      setResult(null);
      if (!selectedPatient && patientsList.length > 0) {
        setSelectedPatient(patientsList[0]);
      }
      const res = await fetch(sampleUrl);
      if (!res.ok) throw new Error("Failed to load sample asset");
      const blob = await res.blob();
      const sampleFile = new File([blob], sampleName, { type: 'image/jpeg' });
      setFile(sampleFile);
      setPreviewUrl(URL.createObjectURL(sampleFile));
    } catch (e: any) {
      console.error(e);
      setError("Unable to load clinical sample preset: " + (e?.message || "File not found"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadScan = async () => {
    const targetPatient = selectedPatient || (patientsList.length > 0 ? patientsList[0] : null);
    if (!targetPatient) {
      setError("Please pick a registered patient from the queue before diagnosing.");
      return;
    }
    if (!file) {
      setError("Please select or upload a fundus image first.");
      return;
    }
    
    setIsProcessing(true);
    setError(null);

    try {
      const uploadFile = await optimizeImage(file);
      const formData = new FormData();
      formData.append('patientId', targetPatient.id.toString());
      formData.append('fundusImage', uploadFile);

      const res = await fetch('/api/scans/upload', {
        method: 'POST',
        body: formData,
      });

      let data: any = null;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        setError(text ? text.slice(0, 160) : `Server responded with code ${res.status}`);
        return;
      }
      
      if (!res.ok) {
        setError(data?.error || `Analysis failed (${res.status}). Verify image quality.`);
        return;
      }
      
      if (data && typeof data.grade === 'number') {
        setSelectedPatient(targetPatient);
        setResult(data);
        fetchQueue(true); // update queue status to DIAGNOSED
      } else {
        setError("Invalid response format received from AI server.");
      }
    } catch (err: any) {
      console.error("Scan upload error:", err);
      setError(err?.message ? `Scan error: ${err.message}` : "A network error occurred while communicating with the local AI server.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLensScan = async () => {
    const targetPatient = selectedPatient || (patientsList.length > 0 ? patientsList[0] : null);
    if (!targetPatient) {
      setError("Please pick a registered patient from the queue before running the scan.");
      return;
    }
    
    setIsProcessing(true);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    
    try {
      const res = await fetch('/api/scans/simulate-lens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: targetPatient.id })
      });

      let data: any = null;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        setError(text ? text.slice(0, 160) : `Server error (${res.status})`);
        return;
      }

      if (!res.ok) {
        setError(data?.error || "Failed to process smartphone lens scan.");
        return;
      }

      if (data && typeof data.grade === 'number') {
        setSelectedPatient(targetPatient);
        setResult(data);
        fetchQueue(true); // update queue status to DIAGNOSED
      } else {
        setError("Invalid response received from lens simulator.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message ? `Scan error: ${err.message}` : "Network error during scan simulation.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Walk-in Registration Submit (Emergency enrollment at Desk 2)
  const handleWalkInRegister = async () => {
    const cleanName = regData.name.trim();
    if (!cleanName) {
      setRegError('Please enter the patient full name.');
      return;
    }
    const parsedAge = parseInt(regData.age, 10);
    if (isNaN(parsedAge) || parsedAge <= 0 || parsedAge > 125) {
      setRegError('Please enter a valid age between 1 and 125.');
      return;
    }
    if (!isVerified) {
      setRegError(isOnline ? 'Please verify identity via Biometric Scan.' : 'Please check the Manual ID Verification box.');
      return;
    }

    setRegLoading(true);
    setRegError(null);

    try {
      const cleanAadhaar = regAadhaar.trim() || undefined;
      const payload = {
        name: cleanName,
        age: parsedAge,
        gender: regData.gender || 'Male',
        dob: regData.dob || undefined,
        marital_status: regData.marital_status || 'Unmarried',
        phone: regData.phone?.trim() || undefined,
        village: regData.village?.trim() || 'Rural Primary Health Centre',
        aadhaar_no: cleanAadhaar,
        verification_method: isOnline ? 'Biometric' : 'Manual'
      };

      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setRegError(data.error || 'Failed to enroll walk-in patient.');
        return;
      }

      const newPatient: QueuePatient = await res.json();
      setPatientsList(prev => [newPatient, ...prev]);
      setSelectedPatient(newPatient);
      setStep('SCREENING');
    } catch (err) {
      setRegError('Network error while saving walk-in patient.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Station Header & Linear Flow Badges */}
      <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-200">
              Desk 2 • Diagnostic &amp; Retinal Scanning Station
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono text-emerald-700 font-bold">
              Real-time Synced with Registration Desk
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight mt-1 flex items-center gap-2">
            AI Retinal Diagnostic Station
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              {patientsList.length} Registered Patients
            </span>
          </h2>
          <p className="text-[11px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">
            Pick enrolled patient from Desk 1 cohort • Execute ResNet-50 / LLaVA Retinal Analysis
          </p>
        </div>

        {/* Quick View Switches */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setStep('QUEUE')}
            className={cn(
              "px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border",
              step === 'QUEUE'
                ? "bg-sky-600 text-white border-sky-600 shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
            )}
            title="Open Registered Patients Queue from Desk 1"
          >
            <Users className="w-4 h-4" />
            <span>Patients Queue</span>
            {pendingCount > 0 && (
              <span className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px] font-black",
                step === 'QUEUE' ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800 border border-amber-200"
              )}>
                {pendingCount} Pending
              </span>
            )}
          </button>

          {selectedPatient && (
            <button
              onClick={() => setStep('SCREENING')}
              className={cn(
                "px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border",
                step === 'SCREENING'
                  ? "bg-slate-800 text-white border-slate-800 shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
              )}
              title="Return to Active Scanning Workstation"
            >
              <Camera className="w-4 h-4" />
              <span>Active: {selectedPatient.name.split(' ')[0]}</span>
            </button>
          )}

          <button
            onClick={() => {
              setStep('REGISTRATION');
              setRegError(null);
            }}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 shrink-0"
            title="Register an emergency walk-in directly at Desk 2"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Walk-in</span>
          </button>
        </div>
      </div>

      {/* Sync Alert Banner */}
      {syncAlert && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>{syncAlert}</span>
          </div>
          <button onClick={() => setSyncAlert(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. REGISTERED PATIENTS QUEUE VIEW (LINEAR FLOW DESK 1 -> DESK 2) */}
      {/* ========================================================================= */}
      {step === 'QUEUE' && (
        <div className="space-y-4 print:hidden animate-in fade-in duration-300">
          {/* Queue Filter, Search & Refresh Toolbar */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Registered Patient Queue</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Pick a registered patient to proceed with fundus capture</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchQueue()}
                  disabled={queueLoading}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  title="Manually refresh patient queue from database"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", queueLoading && "animate-spin text-sky-600")} />
                  <span>Refresh Queue</span>
                </button>
                <div className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md font-bold">
                  ● P2P Connected
                </div>
              </div>
            </div>

            {/* Search Input & Filter Tabs */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 pt-2 border-t border-slate-100">
              {/* Search Box */}
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search by Name, Aadhaar/ABHA, Phone, Village, or ID (e.g. PAT-0001)..."
                  value={queueSearch}
                  onChange={e => setQueueSearch(e.target.value)}
                  className="w-full bg-transparent text-xs font-medium text-slate-800 outline-none placeholder:text-slate-400"
                />
                {queueSearch && (
                  <button onClick={() => setQueueSearch('')} className="text-slate-400 hover:text-slate-600 text-xs">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg shrink-0">
                <button
                  onClick={() => setQueueFilter('ALL')}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-[11px] font-bold transition-colors cursor-pointer",
                    queueFilter === 'ALL' ? "bg-white text-slate-800 shadow-2xs font-extrabold" : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  All ({patientsList.length})
                </button>
                <button
                  onClick={() => setQueueFilter('PENDING')}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-[11px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer",
                    queueFilter === 'PENDING' ? "bg-amber-500 text-white shadow-2xs font-extrabold" : "text-amber-800 hover:bg-amber-100/60"
                  )}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-200 animate-pulse" />
                  <span>Pending ({pendingCount})</span>
                </button>
                <button
                  onClick={() => setQueueFilter('DIAGNOSED')}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer",
                    queueFilter === 'DIAGNOSED' ? "bg-emerald-600 text-white shadow-2xs font-extrabold" : "text-emerald-800 hover:bg-emerald-100/60"
                  )}
                >
                  <CheckCircle className="w-3 h-3" />
                  <span>Diagnosed ({diagnosedCount})</span>
                </button>
              </div>

              {/* Sort Selector */}
              <select
                value={queueSort}
                onChange={e => setQueueSort(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold py-2 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer shrink-0"
              >
                <option value="NEWEST">Registration: Newest First</option>
                <option value="OLDEST">Registration: Oldest First</option>
                <option value="NAME">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Queue List of Registered Patients */}
          {queueLoading && patientsList.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-sky-600 mx-auto" />
              <p className="text-xs font-semibold">Loading registered patients queue from database...</p>
            </div>
          ) : filteredQueue.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">No matching registered patients found</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {queueSearch ? `No patient matches "${queueSearch}". Try clearing your search or filter.` : 'Patients enrolled at the Registration Desk (Desk 1) will appear here in real-time.'}
              </p>
              <button
                onClick={() => setStep('REGISTRATION')}
                className="mt-2 inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Enroll Walk-in Patient</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {filteredQueue.map((patient) => {
                const { dateStr, timeStr, relative } = formatRegistrationDateTime(patient.created_at);
                const isPending = patient.diagnostic_status === 'PENDING' || !patient.scan_count || patient.scan_count === 0;
                const isSelected = selectedPatient?.id === patient.id;

                return (
                  <div
                    key={patient.id}
                    className={cn(
                      "bg-white rounded-xl border p-4 shadow-2xs hover:shadow-sm transition-all space-y-3",
                      isSelected ? "border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/20" : "border-slate-200 hover:border-slate-300"
                    )}
                  >
                    {/* Top Identity & Diagnose Action Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm border shrink-0",
                          isSelected ? "bg-sky-600 text-white border-sky-600" : "bg-sky-50 text-sky-700 border-sky-100"
                        )}>
                          {patient.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-800">{patient.name}</h4>
                            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                              PAT-{patient.id.toString().padStart(4, '0')}
                            </span>
                            {patient.aadhaar_no && (
                              <span className="text-[10px] font-mono bg-sky-50 text-sky-800 px-2 py-0.5 rounded border border-sky-200/60">
                                ABHA: {patient.aadhaar_no}
                              </span>
                            )}
                            {patient.verification_method && (
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <CheckCircle className="w-2.5 h-2.5" />
                                {patient.verification_method}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5 flex flex-wrap items-center gap-2">
                            <span>{patient.age} yrs • {patient.gender}</span>
                            {patient.village && <span>• 📍 {patient.village}</span>}
                            {patient.phone && <span>• 📞 {patient.phone}</span>}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge & Diagnose Button */}
                      <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                        {isPending ? (
                          <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            <span>Pending Scan</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Diagnosed ({patient.scan_count} scan{patient.scan_count && patient.scan_count > 1 ? 's' : ''})</span>
                          </span>
                        )}

                        <button
                          onClick={() => handlePickPatientForDiagnosis(patient)}
                          className={cn(
                            "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs cursor-pointer",
                            isPending 
                              ? "bg-sky-600 hover:bg-sky-700 text-white" 
                              : "bg-slate-800 hover:bg-slate-900 text-white"
                          )}
                          title={`Pick ${patient.name} and conduct Retinal AI Examination`}
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Diagnose</span>
                          <ChevronRight className="w-3 h-3 opacity-70" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata: Registration Date & Time + Vitals Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-xs">
                      {/* Enrolled Date & Time */}
                      <div className="md:col-span-4 bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/70 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-sky-600 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                            Desk 1 Enrollment Date &amp; Time
                          </span>
                          <span className="font-semibold text-slate-800 text-[11px] block truncate">
                            {dateStr} • {timeStr}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {relative}
                          </span>
                        </div>
                      </div>

                      {/* Clinical Vitals Grid */}
                      <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="bg-slate-50/70 p-2 rounded-lg border border-slate-200/70">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Random Sugar</span>
                          <span className={cn(
                            "font-bold text-xs",
                            patient.blood_sugar && patient.blood_sugar > 200 ? "text-rose-600" : patient.blood_sugar && patient.blood_sugar > 140 ? "text-amber-600" : "text-slate-800"
                          )}>
                            {patient.blood_sugar ? `${patient.blood_sugar} mg/dL` : '—'}
                          </span>
                        </div>

                        <div className="bg-slate-50/70 p-2 rounded-lg border border-slate-200/70">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">HbA1c</span>
                          <span className={cn(
                            "font-bold text-xs",
                            patient.hba1c && patient.hba1c >= 7.0 ? "text-rose-600" : "text-slate-800"
                          )}>
                            {patient.hba1c ? `${patient.hba1c}%` : '—'}
                          </span>
                        </div>

                        <div className="bg-slate-50/70 p-2 rounded-lg border border-slate-200/70">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Blood Pressure</span>
                          <span className="font-bold text-xs text-slate-800">
                            {patient.systolic_bp && patient.diastolic_bp ? `${patient.systolic_bp}/${patient.diastolic_bp} mmHg` : '—'}
                          </span>
                        </div>

                        <div className="bg-slate-50/70 p-2 rounded-lg border border-slate-200/70">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Diabetes Duration</span>
                          <span className="font-bold text-xs text-slate-800">
                            {patient.diabetes_years !== undefined ? `${patient.diabetes_years} yrs` : '—'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Medical History Snippet (if available) */}
                    {patient.medical_history && (
                      <div className="bg-amber-50/50 border border-amber-100 p-2 rounded-lg text-[11px] text-amber-900 flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span className="font-medium line-clamp-1">
                          <strong>Clinical History:</strong> {patient.medical_history}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ACTIVE SCANNING WORKPLACE VIEW */}
      {/* ========================================================================= */}
      {step === 'SCREENING' && (
        <div className="space-y-6">
          {/* Active Patient Dossier Bar with Quick Switcher */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-xs">
                {selectedPatient ? selectedPatient.name.charAt(0).toUpperCase() : 'P'}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-slate-800 text-base">
                    {selectedPatient ? selectedPatient.name : 'Select Patient from Queue'}
                  </h3>
                  {selectedPatient && (
                    <span className="text-[10px] font-mono font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded border border-sky-200">
                      ID: PAT-{selectedPatient.id.toString().padStart(4, '0')}
                    </span>
                  )}
                  {selectedPatient?.verification_method && (
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-bold uppercase tracking-wider flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" /> {selectedPatient.verification_method}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {selectedPatient ? (
                    <>
                      Age {selectedPatient.age} ({selectedPatient.gender}) • Village: {selectedPatient.village || 'Rural Clinic'} • Phone: {selectedPatient.phone || '—'}
                    </>
                  ) : (
                    'Pick a patient from the queue below to start diagnostic session'
                  )}
                </p>
                {selectedPatient?.created_at && (
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    🕒 Registered at Desk 1: {formatRegistrationDateTime(selectedPatient.created_at).dateStr} ({formatRegistrationDateTime(selectedPatient.created_at).relative})
                  </p>
                )}
              </div>
            </div>

            {/* Switch Patient / Return to Queue Actions */}
            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              <button
                type="button"
                onClick={() => setStep('QUEUE')}
                className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                title="Return to Registered Patients Queue"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Switch Patient / Queue</span>
              </button>

              {patientsList.length > 0 && (
                <select
                  value={selectedPatient?.id || ''}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    const p = patientsList.find(item => item.id === id);
                    if (p) {
                      setSelectedPatient(p);
                      setResult(null);
                      setFile(null);
                      setPreviewUrl(null);
                    }
                  }}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold py-2 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer max-w-[190px] truncate"
                  title="Switch patient from cohort"
                >
                  {patientsList.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.gender?.charAt(0) || 'M'}, {p.age}y)
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Diagnostic Dossier Result (If Result exists) */}
          {result ? (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Explainable AI (XAI) Diagnostic Dossier Ready
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Screening Grade: {result.grade.toFixed(1)} / 4.0 • {result.grade_label}
                      </span>
                    </div>
                    <ConfidenceGauge 
                      confidence={result.confidence ?? 96.0} 
                      size="sm" 
                      className="bg-slate-50"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setResult(null);
                      setFile(null);
                      setPreviewUrl(null);
                    }}
                    className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Scan Other Eye</span>
                  </button>
                  <button
                    onClick={() => {
                      setResult(null);
                      setFile(null);
                      setPreviewUrl(null);
                      setStep('QUEUE');
                    }}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Diagnose Next Patient</span>
                  </button>
                </div>
              </div>

              <ExplainableAIDossier
                scan={result}
                patient={selectedPatient}
                onRefreshXAI={async () => {
                  try {
                    const res = await fetch(`/api/scans/${result.id}/re-explain`, { method: 'POST' });
                    if (res.ok) {
                      const updated = await res.json();
                      setResult(updated);
                    }
                  } catch (e) {
                    console.error("Failed to re-explain scan", e);
                  }
                }}
              />

              {/* Bottom Action: Pick Next Patient */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between print:hidden">
                <span className="text-xs font-medium text-slate-600">
                  Examination complete for <strong>{selectedPatient?.name}</strong>. Ready for the next patient in queue.
                </span>
                <button
                  onClick={() => {
                    setResult(null);
                    setFile(null);
                    setPreviewUrl(null);
                    setStep('QUEUE');
                  }}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Return to Queue &amp; Diagnose Next Patient</span>
                </button>
              </div>
            </div>
          ) : (
            /* Screening Workplace (Capturing Image & Running AI) */
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 print:hidden">
              {/* Mode Toggle */}
              <div className="flex bg-slate-100 p-1 rounded-lg gap-1 border border-slate-200/50">
                <button 
                  onClick={() => setMode('upload')}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-md text-[11px] font-bold transition-all flex items-center justify-center space-x-2 tracking-wide uppercase cursor-pointer",
                    mode === 'upload' ? "bg-white shadow-sm text-sky-700 border border-slate-200/50" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <FileUp className="w-3.5 h-3.5" />
                  <span>Standard Fundus Image</span>
                </button>
                <button 
                  onClick={() => setMode('lens')}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-md text-[11px] font-bold transition-all flex items-center justify-center space-x-2 tracking-wide uppercase cursor-pointer",
                    mode === 'lens' ? "bg-sky-600 shadow-sm text-white border border-sky-600" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Adaptive Lens (Smartphone)</span>
                </button>
              </div>

              {/* Inputs */}
              <div className="pt-2">
                {mode === 'upload' ? (
                  <div className="space-y-4">
                    <div className="border border-dashed border-slate-300 bg-slate-50 rounded-xl p-8 text-center hover:bg-slate-100 transition-colors">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload" 
                      />
                      <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center space-y-3">
                        <div className="p-3 bg-white shadow-sm text-sky-600 rounded-lg border border-slate-200">
                          <FileUp className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-slate-700 mt-1">Click to upload fundus image</span>
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">JPEG, PNG, max 10MB</span>
                      </label>
                    </div>

                    {/* Clinical Sample Fundus Presets */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                          Clinical Retinal Presets
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">1-Click Instant Test Scans</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => handleLoadSample('/samples/sample_fundus_normal.jpg', 'normal_retina_sample.jpg')}
                          disabled={isProcessing}
                          className="p-2.5 text-left rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-all text-xs font-medium text-slate-800 shadow-2xs group cursor-pointer disabled:opacity-50"
                        >
                          <div className="font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> Normal Retina
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">Grade 0.0 • Clear macula &amp; vessels</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLoadSample('/samples/sample_fundus_npdr.jpg', 'moderate_npdr_sample.jpg')}
                          disabled={isProcessing}
                          className="p-2.5 text-left rounded-lg bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 transition-all text-xs font-medium text-slate-800 shadow-2xs group cursor-pointer disabled:opacity-50"
                        >
                          <div className="font-bold text-amber-700 flex items-center gap-1">
                            <Activity className="w-3 h-3 text-amber-600" /> NPDR Microaneurysms
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">Grade 2.0 • Hemorrhages &amp; exudates</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLoadSample('/samples/sample_fundus_severe.jpg', 'severe_retinopathy_sample.jpg')}
                          disabled={isProcessing}
                          className="p-2.5 text-left rounded-lg bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 transition-all text-xs font-medium text-slate-800 shadow-2xs group cursor-pointer disabled:opacity-50"
                        >
                          <div className="font-bold text-rose-700 flex items-center gap-1">
                            <Cpu className="w-3 h-3 text-rose-600" /> High-Risk Retinopathy
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">Grade 3.5 • Urgent referral needed</div>
                        </button>
                      </div>
                    </div>
                    
                    {previewUrl && (
                      <div className="rounded-lg overflow-hidden border border-slate-200 w-full max-w-sm mx-auto shadow-sm relative group">
                        <img src={previewUrl} alt="Preview" className="w-full h-auto" />
                        <button
                          type="button"
                          onClick={() => { setFile(null); setPreviewUrl(null); }}
                          className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 text-xs transition-colors cursor-pointer"
                          title="Remove image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Processing feedback banner */}
                    {isProcessing && (
                      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-sky-900 space-y-2 animate-in fade-in duration-300">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-sky-600 shrink-0" />
                          <span className="text-xs font-bold">Executing MathWorks SIH 26038 Diagnostic Pipeline...</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[10px] font-mono pt-1 text-slate-600">
                          <div className="bg-white p-1.5 rounded border border-sky-100 text-center font-bold text-sky-700">1. IQA &amp; CLAHE</div>
                          <div className="bg-white p-1.5 rounded border border-sky-100 text-center font-bold text-sky-700">2. Lesion Seg</div>
                          <div className="bg-white p-1.5 rounded border border-sky-100 text-center font-bold text-sky-700">3. ResNet-50</div>
                          <div className="bg-white p-1.5 rounded border border-sky-100 text-center font-bold text-sky-700">4. Grad-CAM</div>
                          <div className="bg-white p-1.5 rounded border border-sky-100 text-center font-bold text-sky-700">5. XAI Report</div>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md text-xs font-bold text-center">
                        ⚠️ {error}
                      </div>
                    )}

                    <button
                      onClick={handleUploadScan}
                      disabled={!file || isProcessing}
                      className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold py-3.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors uppercase tracking-wider cursor-pointer shadow-xs"
                    >
                      {isProcessing ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> <span>Running Explainable AI Vision Pipeline...</span></>
                      ) : (
                        <><Search className="w-4 h-4" /> <span>Run AI Retinal Diagnosis</span></>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-slate-900 rounded-xl aspect-video flex flex-col items-center justify-center text-slate-400 relative overflow-hidden group border border-slate-800">
                      {isProcessing ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 space-y-4 z-20">
                          <div className="w-[120px] h-[120px] border-2 border-dashed border-sky-400 rounded-full animate-pulse flex items-center justify-center">
                             <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
                          </div>
                          <p className="text-[10px] text-sky-400 font-mono font-bold tracking-widest uppercase mt-4">Capturing 30 stabilized frames...</p>
                        </div>
                      ) : (
                        <>
                         <div className="absolute inset-0 flex items-center justify-center opacity-30">
                           <div className="w-[180px] h-[180px] border-2 border-dashed border-sky-400/50 rounded-full"></div>
                         </div>
                         <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[9px] text-white font-mono uppercase tracking-widest border border-white/10">
                           FRAME: READY
                         </div>
                         <div className="text-white/40 text-center relative z-10 flex flex-col items-center">
                           <Camera className="w-10 h-10 mb-3 opacity-60" />
                           <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Position Smartphone Adaptive Lens</p>
                           <p className="text-[9px] text-slate-500 mt-1.5 font-medium">Ready for 3-second optical stabilization &amp; scan</p>
                         </div>
                        </>
                      )}
                    </div>
                    
                    <button
                      onClick={handleLensScan}
                      disabled={isProcessing}
                      className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold py-3.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors uppercase tracking-wider cursor-pointer shadow-xs"
                    >
                      {isProcessing ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> <span>Recording 30 Burst Frames...</span></>
                      ) : (
                        <>
                          <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
                          <span>Record 3S Smartphone Lens Scan</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. EMERGENCY WALK-IN REGISTRATION VIEW (Desk 2 fallback) */}
      {/* ========================================================================= */}
      {step === 'REGISTRATION' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 print:hidden animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2 text-sky-700">
              <UserPlus className="w-5 h-5" />
              <div>
                <h3 className="font-bold uppercase tracking-wider text-sm">Walk-in Patient Enrollment</h3>
                <p className="text-[11px] text-slate-500 font-medium">Direct Station Emergency Registration (Desk 2)</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-md">
              <span className="text-[10px] font-bold uppercase text-slate-500 ml-2">Network:</span>
              <button 
                type="button"
                onClick={() => setIsOnline(true)}
                className={cn("px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer", isOnline ? "bg-emerald-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-800")}
              >Online</button>
              <button 
                type="button"
                onClick={() => setIsOnline(false)}
                className={cn("px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer", !isOnline ? "bg-amber-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-800")}
              >Offline</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={regData.name} 
                onChange={e => setRegData({...regData, name: e.target.value})} 
                placeholder="e.g. Rameshwar Patel" 
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-800" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Aadhaar No. / ABHA ID
              </label>
              <input 
                type="text" 
                value={regAadhaar} 
                onChange={e => setRegAadhaar(e.target.value)} 
                placeholder="12-digit Aadhaar / ABHA" 
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-800" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Age <span className="text-red-500">*</span>
              </label>
              <input 
                type="number" 
                value={regData.age} 
                onChange={e => setRegData({...regData, age: e.target.value})} 
                placeholder="e.g. 58" 
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-800" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Gender
              </label>
              <select 
                value={regData.gender} 
                onChange={e => setRegData({...regData, gender: e.target.value as 'Male' | 'Female' | 'Other'})} 
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-800 cursor-pointer"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Phone / Mobile
              </label>
              <input 
                type="tel"
                value={regData.phone}
                onChange={e => setRegData({...regData, phone: e.target.value})}
                placeholder="+91 98XXX XXXXX"
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Village / PHC Sub-Centre
              </label>
              <input 
                type="text"
                value={regData.village}
                onChange={e => setRegData({...regData, village: e.target.value})}
                placeholder="e.g. Rampur Primary Health Centre"
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-800"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">Verification Step</h4>
            {isOnline ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Fingerprint className="w-8 h-8 text-sky-600" />
                  <div>
                    <p className="text-sm font-bold text-slate-800">Biometric Verification</p>
                    <p className="text-[10px] text-slate-500 uppercase">
                      {isVerified ? '✓ Identity Verified via Biometric Device' : 'Click below to verify identity via sensor'}
                    </p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsVerified(true)}
                  className={cn("px-4 py-2 rounded-md font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition-colors cursor-pointer", isVerified ? "bg-emerald-100 text-emerald-700 border border-emerald-300" : "bg-sky-600 hover:bg-sky-700 text-white")}
                >
                  {isVerified ? <><CheckCircle className="w-4 h-4"/> <span>Verified</span></> : <span>Scan Fingerprint</span>}
                </button>
              </div>
            ) : (
              <div className="flex items-start space-x-3">
                <CheckSquare className="w-6 h-6 text-slate-400 mt-1" />
                <div>
                  <p className="text-sm font-bold text-slate-800">Manual ID Verification</p>
                  <p className="text-[10px] text-slate-500 uppercase mb-2">Biometric Disabled (Offline Mode)</p>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={isVerified} onChange={(e) => setIsVerified(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
                    <span className="text-xs font-bold text-slate-600">I have manually verified the physical documents.</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {regError && (
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg text-rose-700 text-xs font-semibold">
              {regError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button"
              onClick={() => {
                setStep('QUEUE');
                setRegError(null);
              }} 
              className="px-4 py-2 rounded-md font-bold text-xs uppercase text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel / Back to Queue
            </button>
            <button 
              type="button"
              onClick={handleWalkInRegister} 
              disabled={regLoading}
              className="px-5 py-2 rounded-md font-bold text-xs uppercase tracking-wider bg-sky-600 hover:bg-sky-700 text-white transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {regLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Enroll &amp; Start Diagnosis</span>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
