import React, { useState, useEffect } from 'react';
import { Patient, Scan } from '../types';
import { 
  Users, 
  UserPlus, 
  Radio, 
  Phone, 
  MapPin, 
  Activity, 
  Droplet, 
  Heart, 
  Search, 
  Clock, 
  Eye, 
  Sparkles,
  CheckCircle2,
  Camera,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useRealtimeSync } from '../lib/useRealtimeSync';
import { ExplainableAIModal } from './ExplainableAIModal';
import { exportPatientsToCSV, exportSinglePatientDossierToCSV } from '../lib/csvExport';
import { ConfidenceGauge } from './ConfidenceGauge';

export interface PatientsProps {
  onNavigateToScan?: (patientId: number) => void;
  onNavigateToAdvisor?: (patientId: number) => void;
  initialPatientId?: number;
}

export function Patients({ onNavigateToScan, onNavigateToAdvisor, initialPatientId }: PatientsProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientScans, setPatientScans] = useState<Scan[]>([]);
  const [selectedScanForXAI, setSelectedScanForXAI] = useState<Scan | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [aadhaarNo, setAadhaarNo] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [diabetesYears, setDiabetesYears] = useState('');
  const [bloodSugar, setBloodSugar] = useState('');
  const [hba1c, setHba1c] = useState('');
  const [systolicBp, setSystolicBp] = useState('');
  const [diastolicBp, setDiastolicBp] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [enrollError, setEnrollError] = useState<string | null>(null);

  // Hook for real-time multi-device sync
  const { isConnected, activeDevices } = useRealtimeSync({
    onPatientAdded: (newPatient) => {
      setPatients(prev => {
        if (prev.some(p => p.id === newPatient.id)) return prev;
        return [newPatient, ...prev];
      });
      setSuccessToast(`⚡ Real-time Sync: Profile for "${newPatient.name}" appeared from mobile device!`);
      setTimeout(() => setSuccessToast(null), 4000);
    },
    onPatientUpdated: (updatedPatient) => {
      setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    }
  });

  const fetchPatients = () => {
    fetch('/api/patients')
      .then(res => res.json())
      .then(data => {
        setPatients(data);
        setLoading(false);
        if (data.length > 0) {
          if (initialPatientId) {
            const found = data.find((p: Patient) => p.id === initialPatientId);
            if (found) setSelectedPatient(found);
            else if (!selectedPatient) setSelectedPatient(data[0]);
          } else if (!selectedPatient) {
            setSelectedPatient(data[0]);
          }
        }
      });
  };

  useEffect(() => {
    fetchPatients();
  }, [initialPatientId]);

  // When selected patient changes, fetch their scans
  useEffect(() => {
    if (selectedPatient) {
      fetch(`/api/patients/${selectedPatient.id}/scans`)
        .then(res => res.json())
        .then(data => setPatientScans(data))
        .catch(() => setPatientScans([]));
    }
  }, [selectedPatient]);

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setEnrollError('Patient name is required.');
      return;
    }
    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge <= 0 || parsedAge > 125) {
      setEnrollError('Please provide a valid patient age between 1 and 125 years.');
      return;
    }

    setIsSubmitting(true);
    setEnrollError(null);
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          age: parsedAge,
          gender,
          aadhaar_no: aadhaarNo.trim() || undefined,
          phone: phone.trim() || undefined,
          village: village.trim() || 'Rural Primary Health Centre',
          diabetes_years: diabetesYears ? Number(diabetesYears) : undefined,
          blood_sugar: bloodSugar ? Number(bloodSugar) : undefined,
          hba1c: hba1c ? Number(hba1c) : undefined,
          systolic_bp: systolicBp ? Number(systolicBp) : undefined,
          diastolic_bp: diastolicBp ? Number(diastolicBp) : undefined,
          medical_history: medicalHistory.trim() || undefined
        })
      });

      const newPatient = await res.json();
      if (!res.ok) {
        throw new Error(newPatient.error || 'Failed to register patient');
      }

      // Immediately update local patient list so it is reflected without delay
      setPatients(prev => [newPatient, ...prev.filter(p => p.id !== newPatient.id)]);
      setSelectedPatient(newPatient);

      setName('');
      setAge('');
      setAadhaarNo('');
      setPhone('');
      setVillage('');
      setDiabetesYears('');
      setBloodSugar('');
      setHba1c('');
      setSystolicBp('');
      setDiastolicBp('');
      setMedicalHistory('');
      
      setSuccessToast(`Patient profile registered and broadcast across all connected devices.`);
      setTimeout(() => setSuccessToast(null), 3500);
      setIsEnrollOpen(false);
    } catch (err: any) {
      console.error(err);
      setEnrollError(err.message || 'Failed to register patient. Please verify network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.village && p.village.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.phone && p.phone.includes(searchQuery))
  );

  // CSV Export handlers
  const handleExportCSV = (patientsToExport: Patient[]) => {
    if (patientsToExport.length === 0) return;
    try {
      const result = exportPatientsToCSV(patientsToExport);
      setSuccessToast(`📄 Exported ${result.count} patient records to "${result.filename}" for offline rural clinic use.`);
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err) {
      console.error('Failed to export CSV:', err);
    }
  };

  const handleExportSinglePatient = (patient: Patient) => {
    try {
      const result = exportSinglePatientDossierToCSV(patient, patientScans);
      setSuccessToast(`📄 Exported clinical dossier for "${patient.name}" to "${result.filename}".`);
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err) {
      console.error('Failed to export single patient dossier:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col space-y-5">
      
      {/* Real-time Notification Banner */}
      {successToast && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{successToast}</span>
          </div>
          <span className="text-[10px] uppercase font-mono opacity-80">Phone ↔ Laptop Sync</span>
        </div>
      )}

      {/* Top Header & Real-time Connectivity Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            Patient Health Directory
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {patients.length} Registered
            </span>
          </h2>
          <p className="text-[11px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">
            Rural Epidemiological Registry & Retinal Triage Records
          </p>
        </div>

        {/* Live Multi-Device Sync Pill */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-2xs">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="absolute w-4 h-4 rounded-full bg-emerald-400 animate-ping opacity-75" />
          </div>
          <div className="text-[11px] font-mono text-slate-700">
            <span className="font-bold text-emerald-700">Live P2P Sync:</span>{' '}
            <span>{activeDevices} screen{activeDevices > 1 ? 's' : ''} connected</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-12 space-y-4">
          
          {/* Search bar & Action Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2.5 flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
              <input
                type="text"
                placeholder="Search by name, village, or phone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 text-xs outline-none text-slate-800 placeholder:text-slate-400 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[10px] text-slate-400 hover:text-slate-600 font-bold px-1.5 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Action Toolbar */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsEnrollOpen(!isEnrollOpen)}
                className={cn(
                  "flex items-center justify-center gap-1.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0",
                  isEnrollOpen 
                    ? "bg-slate-800 hover:bg-slate-900 text-white" 
                    : "bg-sky-600 hover:bg-sky-700 text-white"
                )}
                title="Enroll a new patient into the rural tele-ophthalmology cohort"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isEnrollOpen ? 'Hide Form' : 'Enroll Patient'}</span>
              </button>

              <button
                onClick={() => handleExportCSV(filteredPatients)}
                disabled={filteredPatients.length === 0}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                title="Export patient records to CSV for offline clinical reporting in rural PHCs"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>
                  Export CSV {searchQuery ? `(${filteredPatients.length})` : `(${patients.length})`}
                </span>
              </button>

              {searchQuery && filteredPatients.length !== patients.length && patients.length > 0 && (
                <button
                  onClick={() => handleExportCSV(patients)}
                  className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium px-3 py-2.5 rounded-xl shadow-2xs transition-colors cursor-pointer shrink-0"
                  title="Export all registered cohort records to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Export All</span> ({patients.length})
                </button>
              )}
            </div>
          </div>

          {/* New Patient Registration Drawer/Panel */}
          {isEnrollOpen && (
            <form onSubmit={handleAddPatient} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4 animate-in slide-in-from-top-3 duration-300">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2 text-sky-700">
                  <UserPlus className="w-4 h-4" />
                  <h3 className="font-bold text-xs uppercase tracking-wider">New Patient Epidemiological Enrollment</h3>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Fields marked * are mandatory</span>
              </div>

              {/* Personal & Demographic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Aadhaar / ABHA ID No.</label>
                  <input
                    type="text"
                    value={aadhaarNo}
                    onChange={e => setAadhaarNo(e.target.value)}
                    placeholder="12-digit ID (e.g. 5567 8901 2345)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Rameshwar Patel"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Age *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="125"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    placeholder="e.g. 58"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-800 cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Phone / Mobile</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98XXX XXXXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Village / PHC Block</label>
                  <input
                    type="text"
                    value={village}
                    onChange={e => setVillage(e.target.value)}
                    placeholder="e.g. Rampur Rural Sub-centre"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Diabetes Duration (Yrs)</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={diabetesYears}
                    onChange={e => setDiabetesYears(e.target.value)}
                    placeholder="e.g. 8"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Blood Sugar (mg/dL)</label>
                  <input
                    type="number"
                    min="40"
                    max="600"
                    value={bloodSugar}
                    onChange={e => setBloodSugar(e.target.value)}
                    placeholder="e.g. 210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">HbA1c (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="4.0"
                    max="20.0"
                    value={hba1c}
                    onChange={e => setHba1c(e.target.value)}
                    placeholder="e.g. 8.4"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    min="70"
                    max="260"
                    value={systolicBp}
                    onChange={e => setSystolicBp(e.target.value)}
                    placeholder="e.g. 138"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    min="40"
                    max="160"
                    value={diastolicBp}
                    onChange={e => setDiastolicBp(e.target.value)}
                    placeholder="e.g. 88"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Clinical History & Medications</label>
                  <input
                    type="text"
                    value={medicalHistory}
                    onChange={e => setMedicalHistory(e.target.value)}
                    placeholder="e.g. Type-2 Diabetes on Metformin, complaints of progressive floaters"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-800"
                  />
                </div>
              </div>

              {enrollError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-2.5 rounded-lg">
                  {enrollError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEnrollOpen(false)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim() || !age || isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                >
                  {isSubmitting ? 'Enrolling Patient...' : 'Save & Enroll Patient'}
                </button>
              </div>
            </form>
          )}

          {/* Patient Cards List */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-wrap justify-between items-center gap-2">
              <div className="flex items-center gap-2.5">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Enrolled Cohort ({filteredPatients.length})
                </h3>
                {filteredPatients.length > 0 && (
                  <button
                    onClick={() => handleExportCSV(filteredPatients)}
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200/80 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Export currently visible patient cohort to CSV"
                  >
                    <Download className="w-3 h-3" />
                    <span>CSV</span>
                  </button>
                )}
              </div>
              <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                Auto-Refreshed via SSE
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-slate-400 text-xs">Loading patient registry...</div>
              ) : filteredPatients.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No matching patients found. Click &apos;Enroll Patient&apos; above or register from your connected mobile device.
                </div>
              ) : (
                filteredPatients.map(p => {
                  const isSelected = selectedPatient?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPatient(p)}
                      className={cn(
                        "p-3.5 hover:bg-sky-50/50 cursor-pointer transition-all flex items-center justify-between gap-3",
                        isSelected ? "bg-sky-50/70 border-l-4 border-sky-600" : ""
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm border",
                          isSelected 
                            ? "bg-sky-600 text-white border-sky-600" 
                            : "bg-sky-50 text-sky-700 border-sky-100"
                        )}>
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            {p.name}
                            <span className="text-[10px] font-mono font-medium text-slate-400">
                              (PAT-{p.id.toString().padStart(4, '0')})
                            </span>
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                            <span>{p.age} yrs • {p.gender}</span>
                            {p.village && <span>• {p.village}</span>}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        {p.blood_sugar ? (
                          <div className="text-[11px] font-bold text-indigo-700">
                            {p.blood_sugar} mg/dL
                          </div>
                        ) : null}
                        <div className="text-[9px] text-slate-400 font-mono">
                          {new Date(p.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Selected Patient Extended Clinical Sheet */}
          {selectedPatient && (
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Clinical Dossier: {selectedPatient.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Phone: {selectedPatient.phone || 'Not recorded'} • Village: {selectedPatient.village || 'Rural Clinic'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded">
                    ID: PAT-{selectedPatient.id.toString().padStart(4, '0')}
                  </span>
                  <button
                    onClick={() => handleExportSinglePatient(selectedPatient)}
                    className="text-[10px] uppercase font-bold bg-white hover:bg-slate-50 text-slate-700 px-2.5 py-1 rounded shadow-2xs flex items-center gap-1 transition-colors cursor-pointer border border-slate-200"
                    title="Export single patient dossier and scan history to CSV"
                  >
                    <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                    <span>Export Dossier (CSV)</span>
                  </button>
                  {onNavigateToAdvisor && (
                    <button 
                      onClick={() => onNavigateToAdvisor(selectedPatient.id)}
                      className="text-[10px] uppercase font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded shadow-2xs flex items-center gap-1 transition-colors cursor-pointer border border-indigo-200"
                      title="Track Longitudinal Disease Progression in Advisor"
                    >
                      <Activity className="w-3 h-3 text-indigo-600" />
                      <span>Progression Timeline</span>
                    </button>
                  )}
                  {onNavigateToScan && (
                    <button 
                      onClick={() => onNavigateToScan(selectedPatient.id)}
                      className="text-[10px] uppercase font-bold bg-sky-600 hover:bg-sky-700 text-white px-3 py-1 rounded shadow-sm flex items-center gap-1 transition-colors cursor-pointer"
                      title="Send to Diagnostic Station (Desk 2) for Retinal Scan"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Diagnose</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Vitals Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Random Glucose</span>
                  <span className="font-bold text-indigo-700">{selectedPatient.blood_sugar ? `${selectedPatient.blood_sugar} mg/dL` : '—'}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Glycated HbA1c</span>
                  <span className="font-bold text-indigo-700">{selectedPatient.hba1c ? `${selectedPatient.hba1c}%` : '—'}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Blood Pressure</span>
                  <span className="font-bold text-slate-800">
                    {selectedPatient.systolic_bp && selectedPatient.diastolic_bp 
                      ? `${selectedPatient.systolic_bp}/${selectedPatient.diastolic_bp}` 
                      : '—'}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Diabetes Years</span>
                  <span className="font-bold text-slate-800">{selectedPatient.diabetes_years ? `${selectedPatient.diabetes_years} yrs` : '—'}</span>
                </div>
              </div>

              {selectedPatient.medical_history && (
                <div className="text-[11px] bg-amber-50/60 border border-amber-200/60 rounded-lg p-2.5 text-amber-900 font-medium">
                  <span className="font-bold">Medical History: </span>
                  {selectedPatient.medical_history}
                </div>
              )}

              {/* Patient Scan History */}
              <div className="pt-1">
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Retinal Scans for this Patient ({patientScans.length})
                </h5>
                {patientScans.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No retinal scans recorded yet. Use the Scanner tab to capture or upload a fundus photo.</p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {patientScans.map(s => (
                      <div 
                        key={s.id} 
                        onClick={() => setSelectedScanForXAI(s)}
                        className="bg-white border border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 rounded-lg p-2.5 flex items-center justify-between text-xs cursor-pointer group transition-all shadow-2xs"
                        title="Click to view full MathWorks MATLAB Explainable AI (XAI) Dossier & Dos/Don'ts"
                      >
                        <div className="flex items-center gap-2 overflow-hidden mr-2">
                          <span className={cn(
                            "font-black text-xs px-1.5 py-0.5 rounded font-mono shrink-0",
                            s.grade < 1 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : 
                            s.grade < 3 ? "bg-amber-50 text-amber-700 border border-amber-200" : 
                            "bg-red-50 text-red-700 border border-red-200"
                          )}>
                            Grade {s.grade.toFixed(1)}
                          </span>
                          <ConfidenceGauge 
                            confidence={s.confidence ?? 95.0} 
                            size="sm" 
                          />
                          <span className="text-slate-700 font-medium truncate group-hover:text-sky-900">
                            {s.diagnosis}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[9px] font-mono text-slate-400">
                            {new Date(s.created_at).toLocaleDateString()}
                          </span>
                          <span className="text-[10px] text-sky-600 font-bold group-hover:text-sky-800 flex items-center gap-0.5">
                            <Sparkles className="w-3 h-3 text-sky-500" />
                            <span>XAI Dossier →</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Explainable AI Modal for Patient's selected past scan */}
      <ExplainableAIModal
        isOpen={!!selectedScanForXAI}
        scan={selectedScanForXAI}
        patient={selectedPatient}
        onClose={() => setSelectedScanForXAI(null)}
        onRefreshXAI={async () => {
          if (!selectedScanForXAI) return;
          try {
            const res = await fetch(`/api/scans/${selectedScanForXAI.id}/re-explain`, { method: 'POST' });
            if (res.ok) {
              const updated = await res.json();
              setSelectedScanForXAI(updated);
              // Update scan in patient list
              setPatientScans(prev => prev.map(item => item.id === updated.id ? updated : item));
            }
          } catch (e) {
            console.error("Failed to re-explain", e);
          }
        }}
      />
    </div>
  );
}
