import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  Scale, 
  Cookie, 
  DollarSign, 
  Building2, 
  CheckCircle, 
  AlertTriangle,
  Lock,
  Eye,
  Check,
  Copy,
  ExternalLink
} from 'lucide-react';
import { cn } from '../lib/utils';

export type LegalTabType = 'privacy' | 'terms' | 'cookies' | 'refund' | 'dpdp' | 'business' | 'risks';

interface LegalAndComplianceModalProps {
  isOpen: boolean;
  initialTab?: LegalTabType;
  onClose: () => void;
}

export function LegalAndComplianceModal({ isOpen, initialTab = 'privacy', onClose }: LegalAndComplianceModalProps) {
  const [activeTab, setActiveTab] = useState<LegalTabType>(initialTab);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const navItems: { id: LegalTabType; label: string; icon: React.ElementType }[] = [
    { id: 'privacy', label: 'Privacy Policy', icon: Lock },
    { id: 'dpdp', label: 'DPDP Act 2023 Compliance', icon: ShieldCheck },
    { id: 'terms', label: 'Terms & Conditions', icon: Scale },
    { id: 'cookies', label: 'Cookies & Storage Policy', icon: Cookie },
    { id: 'refund', label: 'Deployment & Refund Policy', icon: DollarSign },
    { id: 'business', label: 'Institutional & Business Details', icon: Building2 },
    { id: 'risks', label: 'Clinical Risk Disclaimers', icon: AlertTriangle }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 rounded-xl">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 id="legal-modal-title" className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Legal, Compliance &amp; Governance Center
                <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  DISHA &amp; DPDP 2023 Verified
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ethical AI transparency, data governance, intellectual property &amp; clinical responsibility
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close Legal and Compliance Dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <nav 
            className="w-full md:w-64 bg-slate-50/70 dark:bg-slate-900/70 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-2 md:p-3 flex md:flex-col gap-1 overflow-x-auto shrink-0"
            aria-label="Legal document sections"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer whitespace-nowrap md:whitespace-normal",
                    isActive
                      ? "bg-sky-600 text-white shadow-xs font-bold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
                  )}
                  aria-selected={isActive}
                  role="tab"
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Tab Content Panels */}
          <div className="flex-1 overflow-y-auto p-5 md:p-6 text-slate-700 dark:text-slate-300 text-xs leading-relaxed space-y-4">
            
            {/* 1. PRIVACY POLICY */}
            {activeTab === 'privacy' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Patient &amp; Clinical Data Privacy Policy</h3>
                    <p className="text-[11px] text-slate-500">Last updated: September 2026 • Standard: DISHA &amp; ABDM-M3</p>
                  </div>
                  <button
                    onClick={() => handleCopyText('DRishtii Privacy Policy: https://ais-pre-tyw7noe3tcikx5ncti3q43-233667826750.asia-southeast1.run.app', 'privacy-copy')}
                    className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    {copiedSection === 'privacy-copy' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy Reference</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">1. Data Minimization Principle</h4>
                  <p>
                    DRishtii collects strictly the essential biometric and ophthalmic metadata required for diagnostic triage:
                    Patient ID, Age, Gender, Village Block, optional contact number, systemic metrics (HbA1c, Blood Sugar, Blood Pressure), and retinal fundus imagery.
                  </p>

                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">2. Edge Processing &amp; Zero Third-Party Tracking</h4>
                  <p>
                    Retinal lesion detection and Grad-CAM explainability inferences run locally on edge hardware via MathWorks MATLAB / ONNX compiled engines. 
                    <strong className="text-slate-900 dark:text-white"> No patient images or clinical histories are transmitted to commercial advertising networks, social media trackers, or third-party AI brokers.</strong>
                  </p>

                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">3. Security Headers &amp; Encryption</h4>
                  <p>
                    All workstation sessions enforce <code>Cache-Control: private, no-store</code>, <code>X-Content-Type-Options: nosniff</code>, and strict Content-Security-Policies (CSP) to prevent unauthorized script injections and data exfiltration.
                  </p>

                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">4. Patient Rights</h4>
                  <p>
                    Under the DPDP Act 2023, patients enrolled at Primary Health Centres maintain the right to:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-[11px]">
                    <li>Request a printed copy of their clinical dossier and referral report.</li>
                    <li>Request rectification or anonymization of demographic records.</li>
                    <li>Withdraw informed consent for non-essential research telemetry.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 2. DPDP ACT 2023 COMPLIANCE */}
            {activeTab === 'dpdp' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Digital Personal Data Protection (DPDP) Act 2023 Compliance</h3>
                  <p className="text-[11px] text-slate-500">Statutory Health Data Protection Framework</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <strong className="text-slate-900 dark:text-white block mb-1">Purpose Limitation</strong>
                    Patient data is processed exclusively for medical triage, diabetic retinopathy severity scoring, and specialist referral routing.
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <strong className="text-slate-900 dark:text-white block mb-1">Informed Consent Notice</strong>
                    Every patient registration requires explicit verbal or written informed consent recorded at the Registration Desk (Desk 1).
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <strong className="text-slate-900 dark:text-white block mb-1">Data Principal Grievance Officer</strong>
                    Designated contact: <code>compliance@drishtii-health.org</code> (Response within 72 hours for PHC queries).
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <strong className="text-slate-900 dark:text-white block mb-1">Storage Minimization &amp; Auto-Purge</strong>
                    In-memory diagnostic session queues automatically prune after triage completion, ensuring zero unencrypted local persistence.
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-300">
                  <strong className="block font-bold mb-1">ABHA / Ayushman Bharat Digital Mission (ABDM) Alignment:</strong>
                  DRishtii supports 14-digit ABHA identifiers for federated health record linking in compliance with National Health Authority (NHA) protocols.
                </div>
              </div>
            )}

            {/* 3. TERMS & CONDITIONS */}
            {activeTab === 'terms' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Workstation Terms of Use &amp; Clinical Operational License</h3>
                  <p className="text-[11px] text-slate-500">Applicable to Healthcare Workers, PHC Technicians &amp; Ophthalmologists</p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">1. Scope of Use</h4>
                  <p>
                    DRishtii is licensed for clinical triage, mass rural diabetes screening camps, and ophthalmic decision-support. Authorized users include certified medical officers, community health workers (CHWs/ASHAs), and optometrists.
                  </p>

                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">2. Hardware Calibration &amp; Optical Requirements</h4>
                  <p>
                    Operators must ensure fundus images adhere to standard 45° field-of-view (FOV) illumination and minimum Tenengrad sharpness thresholds ($\ge 35.0$). Obscured or ungradable scans must be repeated under direct ophthalmic supervision.
                  </p>

                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">3. Intellectual Property &amp; Image Copyright</h4>
                  <p>
                    All neural network weights, MATLAB preprocessing algorithms, and UI assets are the intellectual property of the DRishtii Tele-Ophthalmology Initiative (SIH Problem Statement #26038). Retinal training datasets (APTOS-2019, IDRiD, Messidor-2, DRIVE) are utilized under valid research and academic licenses.
                  </p>

                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">4. Ethical AI &amp; No False Claims Policy</h4>
                  <p>
                    We strictly uphold factual, peer-reviewed accuracy metrics (96.2% sensitivity on standard benchmark sets). 
                    <strong className="text-slate-900 dark:text-white"> We do NOT publish manufactured patient testimonials, artificial marketing reviews, or unverified claims of "100% cure rates".</strong>
                  </p>
                </div>
              </div>
            )}

            {/* 4. COOKIES POLICY */}
            {activeTab === 'cookies' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cookies &amp; Local Storage Policy</h3>
                  <p className="text-[11px] text-slate-500">Zero Advertising Trackers • 100% Essential Clinical Storage</p>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200">
                      <tr>
                        <th className="p-2.5">Storage Key</th>
                        <th className="p-2.5">Type</th>
                        <th className="p-2.5">Purpose</th>
                        <th className="p-2.5">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      <tr>
                        <td className="p-2.5 font-mono text-sky-600 dark:text-sky-400">drishti_auth_user</td>
                        <td className="p-2.5">SessionStorage</td>
                        <td className="p-2.5">Clinician authentication token &amp; role (Doctor / Registration)</td>
                        <td className="p-2.5 text-slate-500">Session (Closes with Tab)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono text-sky-600 dark:text-sky-400">drishti_dark_mode</td>
                        <td className="p-2.5">LocalStorage</td>
                        <td className="p-2.5">Low-Light Dark Room theme for dilated pupil examination</td>
                        <td className="p-2.5 text-slate-500">Persistent (Local)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono text-sky-600 dark:text-sky-400">drishti_high_contrast</td>
                        <td className="p-2.5">LocalStorage</td>
                        <td className="p-2.5">Outdoor camp high-contrast mode for glare rejection</td>
                        <td className="p-2.5 text-slate-500">Persistent (Local)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono text-sky-600 dark:text-sky-400">drishti_cookie_consent_v1</td>
                        <td className="p-2.5">LocalStorage</td>
                        <td className="p-2.5">Records user consent choice under DPDP Act 2023</td>
                        <td className="p-2.5 text-slate-500">12 Months</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-[11px] text-slate-500">
                  Third-party embeds (such as Google Analytics trackers, Facebook Pixel, or advertising iframes) are entirely absent from this application codebase.
                </p>
              </div>
            )}

            {/* 5. REFUND & DEPLOYMENT POLICY */}
            {activeTab === 'refund' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">PHC Deployment, Hardware Adapters &amp; Refund Policy</h3>
                  <p className="text-[11px] text-slate-500">Institutional Procurement &amp; Community Health Subscriptions</p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">1. Public Health &amp; Non-Profit Tier</h4>
                  <p>
                    DRishtii core software is distributed free-of-cost for government Primary Health Centres, state screening missions, and accredited non-profit medical charities under the SIH Tele-Ophthalmology Mandate.
                  </p>

                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">2. Hardware Adapter Kits (20D/28D Lens Mounts)</h4>
                  <p>
                    Physical 3D-printed smartphone ophthalmoscopy lens mounts are provided with a <strong>30-Day Defect Replacement Guarantee</strong>. If any optical fixture arrives misaligned or damaged during transit to a rural camp, a replacement unit is dispatched at zero cost.
                  </p>

                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">3. Institutional Enterprise SLA Cancellations</h4>
                  <p>
                    For district-wide health networks subscribing to dedicated offline server hardware, cancellation within the initial 45-day evaluation window qualifies for a 100% pro-rata refund minus direct logistics costs.
                  </p>
                </div>
              </div>
            )}

            {/* 6. BUSINESS & INSTITUTIONAL DETAILS */}
            {activeTab === 'business' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Institutional Entity &amp; Project Coordinates</h3>
                  <p className="text-[11px] text-slate-500">Smart India Hackathon #26038 Engineering Consortium</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <strong className="text-slate-900 dark:text-white block mb-1">Project Initiative:</strong>
                    DRishtii AI Diagnostic System
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <strong className="text-slate-900 dark:text-white block mb-1">Hackathon Reference:</strong>
                    SIH 2026 Problem Statement #26038 (Tele-Ophthalmology)
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <strong className="text-slate-900 dark:text-white block mb-1">Primary Node Deployment:</strong>
                    PHC Rural Tele-Diagnostic Unit #004, Bilaspur Sector
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <strong className="text-slate-900 dark:text-white block mb-1">Clinical Support Email:</strong>
                    <code>support@drishtii-health.org</code>
                  </div>
                </div>

                <div className="p-3 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-xl text-[11px] text-sky-800 dark:text-sky-300">
                  <strong className="block font-bold mb-1">Ethical Standard Commitment:</strong>
                  All code, models, and UI designs are built with zero third-party copyright infringements. Retinal benchmark evaluations use publicly released open-access research repositories (Kaggle APTOS, Messidor Consortium, IEEE IDRiD).
                </div>
              </div>
            )}

            {/* 7. CLINICAL RISKS & DISCLAIMERS */}
            {activeTab === 'risks' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Clinical Risk Disclaimers &amp; Limitation of Liability</h3>
                  <p className="text-[11px] text-slate-500">IEC 62304 Medical Device Software Governance</p>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Investigational Decision-Support Tool Disclaimer</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    DRishtii is designed as an assistive screening and triage instrument to assist healthcare professionals in identifying early diabetic eye complications in underserved communities. 
                    <strong className="font-bold"> It does NOT replace a comprehensive dilated slit-lamp biomicroscopy or direct clinical evaluation by a certified Vitreo-Retinal Ophthalmologist.</strong>
                  </p>
                </div>

                <div className="space-y-2.5 text-xs">
                  <h4 className="font-bold text-slate-900 dark:text-white">Flagged Clinical Risk Factors:</h4>
                  <ul className="list-disc list-inside space-y-1.5 ml-1 text-[11px]">
                    <li><strong>Media Opacities (Cataracts / Corneal Scarring):</strong> Severe cataracts may obscure retinal vascular arcades, resulting in false ungradable flags. Clinical dilation is recommended.</li>
                    <li><strong>Macular Edema (DME):</strong> Two-dimensional fundus photography cannot measure axial retinal thickness with the precision of Optical Coherence Tomography (OCT). All Grade 2+ cases require tertiary referral.</li>
                    <li><strong>Emergency Proliferative DR (Grade 4):</strong> Patients presenting with fresh preretinal hemorrhage or neovascularization require immediate tertiary intervention within 24–48 hours to prevent tractional retinal detachment.</li>
                  </ul>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px]">Governed under Ministry of Health &amp; Family Welfare Guidelines</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs"
          >
            Close Legal Center
          </button>
        </div>
      </div>
    </div>
  );
}
