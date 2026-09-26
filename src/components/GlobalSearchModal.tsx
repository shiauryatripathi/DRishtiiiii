import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  User, 
  Eye, 
  Phone, 
  MapPin, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Patient } from '../types';
import { cn } from '../lib/utils';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPatient: (patientId: number, targetView?: 'patients' | 'new_scan') => void;
}

export function GlobalSearchModal({ isOpen, onClose, onSelectPatient }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setLoading(true);
      fetch('/api/patients')
        .then(res => res.json())
        .then(data => {
          setPatients(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(() => {
          setPatients([]);
          setLoading(false);
        });

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const filteredPatients = patients.filter(p => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    const padId = `PAT-${String(p.id).padStart(4, '0')}`.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.phone?.toLowerCase().includes(q) ||
      p.village?.toLowerCase().includes(q) ||
      p.aadhaar_no?.toLowerCase().includes(q) ||
      padId.includes(q) ||
      p.status?.toLowerCase().includes(q)
    );
  }).slice(0, 8);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredPatients.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredPatients.length) % Math.max(1, filteredPatients.length));
    } else if (e.key === 'Enter' && filteredPatients[selectedIndex]) {
      e.preventDefault();
      onSelectPatient(filteredPatients[selectedIndex].id, 'new_scan');
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-xs p-4 pt-16 sm:pt-24 animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-label="Global Patient Search"
      >
        {/* Search Header */}
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50/80 dark:bg-slate-900/80">
          <Search className="w-5 h-5 text-slate-400 shrink-0 ml-1" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search patient by Name, ABHA ID, Phone, Village or ID... (Press Esc to close)"
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-500 bg-slate-200/80 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <Activity className="w-5 h-5 animate-spin mx-auto mb-2 text-sky-500" />
              Loading clinical directory...
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No matching patient records found for &quot;{query}&quot;.
            </div>
          ) : (
            filteredPatients.map((patient, idx) => {
              const isSelected = selectedIndex === idx;
              const formattedId = `PAT-${String(patient.id).padStart(4, '0')}`;
              const isDiagnosed = patient.status === 'DIAGNOSED' || patient.status === 'COMPLETED';

              return (
                <div
                  key={patient.id}
                  onClick={() => {
                    onSelectPatient(patient.id, isDiagnosed ? 'patients' : 'new_scan');
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    "p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 group",
                    isSelected 
                      ? "bg-sky-50 dark:bg-sky-950/40 text-slate-900 dark:text-slate-100 shadow-2xs" 
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors",
                      isSelected 
                        ? "bg-sky-600 text-white" 
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    )}>
                      {patient.gender === 'Female' ? '♀' : '♂'}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold truncate">
                          {patient.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {formattedId}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          • {patient.age}y
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5 truncate">
                        {patient.village && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {patient.village}
                          </span>
                        )}
                        {patient.phone && (
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3" />
                            {patient.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider",
                      isDiagnosed 
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" 
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                    )}>
                      {isDiagnosed ? 'Diagnosed' : 'Waiting'}
                    </span>

                    <button
                      type="button"
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors"
                      title="Open Record"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span><kbd className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">↑↓</kbd> Navigate</span>
            <span><kbd className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">↵</kbd> Select</span>
          </div>
          <span>Showing top {filteredPatients.length} records</span>
        </div>
      </div>
    </div>
  );
}
