import React from 'react';
import { Stethoscope, ClipboardList, ShieldCheck, ArrowRight, Sparkles, Activity, CheckCircle2 } from 'lucide-react';
import { DrishtiLogo } from './DrishtiLogo';

interface LoginProps {
  onLogin: (role: 'doctor' | 'registration') => void;
}

export function Login({ onLogin }: LoginProps) {
  const handleEnter = (role: 'doctor' | 'registration') => {
    // Instant frictionless clinical station initialization
    const timestamp = Date.now();
    sessionStorage.setItem('drishti_auth_token', `portal_session_${timestamp}`);
    sessionStorage.setItem('drishti_user_role', role);
    sessionStorage.setItem(
      'drishti_user_name',
      role === 'doctor' ? 'Dr. Ananya Sharma (Ophthalmologist)' : 'Priya Verma (Registration Desk)'
    );
    sessionStorage.setItem('drishti_auth_expires', new Date(timestamp + 3600000).toISOString());
    onLogin(role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-sky-50 flex flex-col justify-center items-center p-4 sm:p-6 font-sans select-none">
      {/* Landscape Gateway Container */}
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-6 sm:p-8 md:p-10 relative overflow-hidden backdrop-blur-sm">
        
        {/* Decorative Top Accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8 pt-2">
          <div className="flex items-center justify-center py-2 transition-transform hover:scale-[1.02] duration-300">
            <DrishtiLogo size="lg" className="h-28 sm:h-32 md:h-36 w-auto max-w-[320px] drop-shadow-md" />
          </div>
          
          {/* Official SIH & Version Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-3">
            <span className="text-[11px] uppercase tracking-widest text-sky-800 bg-sky-50 border border-sky-200/80 font-mono font-bold px-3 py-1 rounded-full shadow-2xs">
              SIH 2026 • Problem #26038
            </span>
            <span className="text-[11px] uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200/80 font-mono font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              v-1.1.2.9 Secure
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-3 max-w-lg">
            Offline Edge Tele-Ophthalmology AI Diagnostic & Patient Triage Workstation
          </p>
        </div>

        {/* Landscape Selection Cards: Doctor Portal & Staff Desk */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          
          {/* Doctor Portal Block */}
          <div
            onClick={() => handleEnter('doctor')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleEnter('doctor')}
            className="group relative bg-gradient-to-b from-sky-50/60 to-white hover:from-sky-50/90 hover:to-sky-50/30 border-2 border-sky-200/80 hover:border-sky-500 rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div className="absolute top-4 right-4">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full border border-sky-200 font-mono">
                Desk 2 • Doctor
              </span>
            </div>

            <div>
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                <Stethoscope className="w-7 h-7" />
              </div>

              <h2 className="text-xl font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                Doctor Portal
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1 mb-4">
                Diagnostic Desk & Tele-Ophthalmology Station
              </p>

              <div className="space-y-2 border-t border-sky-100/80 pt-3.5 mb-6 text-[12px] text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>ResNet-50 5-Stage Retinal Classification</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>MathWorks Grad-CAM & Optical Filters</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>Clinical Decision Support & Advisor</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl shadow-md group-hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Enter Doctor Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Staff Desk Block */}
          <div
            onClick={() => handleEnter('registration')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleEnter('registration')}
            className="group relative bg-gradient-to-b from-emerald-50/60 to-white hover:from-emerald-50/90 hover:to-emerald-50/30 border-2 border-emerald-200/80 hover:border-emerald-500 rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div className="absolute top-4 right-4">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200 font-mono">
                Desk 1 • Staff
              </span>
            </div>

            <div>
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                <ClipboardList className="w-7 h-7" />
              </div>

              <h2 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Staff Desk
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1 mb-4">
                Clinical Registration & Patient Intake Desk
              </p>

              <div className="space-y-2 border-t border-emerald-100/80 pt-3.5 mb-6 text-[12px] text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Patient Ingestion & ABHA Demographics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Vitals, Glucose & Glycemic Profiling</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Real-Time Multi-Screen Clinic Sync</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl shadow-md group-hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Enter Staff Desk</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

        {/* Security & Regulatory Compliance Footer */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>DISHA & DPDP Compliant Tele-Ophthalmology Security</span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            MathWorks ResNet-50 • Real-time Multi-Screen Triage • Offline Air-Gap Ready
          </div>
        </div>

      </div>
    </div>
  );
}
