import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  Camera, 
  Activity, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ClinicalGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FAQItem {
  id: string;
  category: 'clinical' | 'optical' | 'workflow' | 'compliance';
  question: string;
  answer: React.ReactNode;
}

export function ClinicalGuideModal({ isOpen, onClose }: ClinicalGuideModalProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'clinical' | 'optical' | 'workflow' | 'compliance'>('all');
  const [expandedId, setExpandedId] = useState<string | null>('faq-1');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const faqs: FAQItem[] = [
    {
      id: 'faq-1',
      category: 'clinical',
      question: 'What are the 5 International Clinical Stages of Diabetic Retinopathy?',
      answer: (
        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
          <p>
            DRishtii follows the <strong>International Council of Ophthalmology (ICO)</strong> and <strong>ETDRS</strong> staging criteria:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <strong className="text-emerald-800 dark:text-emerald-300 block mb-1">Grade 0: No Apparent DR</strong>
              No microaneurysms, hemorrhages, or exudates. Sharp foveal reflex. Follow-up in 12 months.
            </div>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <strong className="text-blue-800 dark:text-blue-300 block mb-1">Grade 1: Mild NPDR</strong>
              Microaneurysms only (isolated &lt;50µm red dots). Follow-up in 6–9 months; optimize HbA1c.
            </div>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
              <strong className="text-amber-800 dark:text-amber-300 block mb-1">Grade 2: Moderate NPDR</strong>
              More than microaneurysms but less than Severe NPDR. Punctate hard exudates and dot hemorrhages. Refer in 3–4 weeks.
            </div>
            <div className="p-2.5 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
              <strong className="text-orange-800 dark:text-orange-300 block mb-1">Grade 3: Severe NPDR</strong>
              Follows the <strong>4-2-1 Rule</strong>: &ge; 20 intraretinal hemorrhages in all 4 quadrants, venous beading in &ge; 2 quadrants, or IRMA in &ge; 1 quadrant. Urgent referral in 1–2 weeks.
            </div>
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg md:col-span-2">
              <strong className="text-rose-800 dark:text-rose-300 block mb-1">Grade 4: Proliferative DR (PDR)</strong>
              Active neovascularization (NVD at disc or NVE elsewhere) or vitreous/preretinal hemorrhage. High risk of tractional retinal detachment. <strong>Emergency tertiary eye hospital referral within 24–48 hours.</strong>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'faq-2',
      category: 'optical',
      question: 'What is the standard Image Quality Assessment (IQA) Protocol for smartphone lenses?',
      answer: (
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <p>
            To ensure zero missed lesions in rural camps, DRishtii evaluates 3 optical parameters prior to inference:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-1 text-[11px]">
            <li><strong>Field of View (FOV):</strong> Minimum 45° aperture centered on fovea and optic disc.</li>
            <li><strong>Focus &amp; Sharpness (Tenengrad Gradient):</strong> Must exceed threshold score of 35.0 to detect &lt;50µm microaneurysms.</li>
            <li><strong>Illumination Uniformity:</strong> Green-channel histogram equalization (Rayleigh CLAHE, clip limit 0.02) normalizes underexposed peripheral arcades.</li>
          </ul>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-2">
            ⚠️ If an image is flagged as "Ungradable" (Grade 5 Artifact), perform immediate dilation and recapture.
          </p>
        </div>
      )
    },
    {
      id: 'faq-3',
      category: 'workflow',
      question: 'How does the Two-Desk Linear Clinic Workflow operate?',
      answer: (
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <p>
            DRishtii is architected for high-throughput rural primary health centres (PHCs):
          </p>
          <ol className="list-decimal list-inside space-y-1.5 ml-1 text-[11px]">
            <li>
              <strong>Desk 1 (Registration & Demographics):</strong> Health worker records ABHA ID, biometric verification, systemic risk factors (HbA1c, BP, duration of diabetes).
            </li>
            <li>
              <strong>Desk 2 (Diagnostic Station & Retinal Capture):</strong> Clinical operator mounts portable 20D/45° smartphone lens adapter, captures 30-burst optical stabilization frames, and runs local AI inference.
            </li>
            <li>
              <strong>Instant P2P Sync:</strong> Real-time Server-Sent Events (SSE) automatically updates patient statuses (Waiting $\to$ Diagnosed) across all connected devices in the facility.
            </li>
          </ol>
        </div>
      )
    },
    {
      id: 'faq-4',
      category: 'compliance',
      question: 'How is patient clinical data protected under DISHA & DPDP Act 2023?',
      answer: (
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <p>
            DRishtii enforces strict telemedicine and health data protection standards:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-1 text-[11px]">
            <li><strong>100% Offline Edge Inference:</strong> Diagnostic execution runs on-device via local ONNX/MATLAB pipelines without sending raw fundus photos to third-party cloud servers.</li>
            <li><strong>Anti-Cache & Privacy Headers:</strong> Enforces <code>Cache-Control: no-store, private</code> on all patient endpoints.</li>
            <li><strong>Magic Bytes Inspection:</strong> Uploaded scans are verified for JPEG/PNG binary signatures to block malicious payloads.</li>
            <li><strong>Cryptographic Session Tokens:</strong> SessionStorage isolation with automated idle timeout lockouts.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'faq-5',
      category: 'clinical',
      question: 'What are the recommended clinical referral timelines by risk tier?',
      answer: (
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden text-[11px]">
            <table className="w-full text-left">
              <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-200">
                <tr>
                  <th className="p-2">Severity Grade</th>
                  <th className="p-2">Risk Level</th>
                  <th className="p-2">Action & Referral Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                <tr>
                  <td className="p-2 font-medium">Grade 0 (No DR)</td>
                  <td className="p-2 text-emerald-600 font-semibold">Low</td>
                  <td className="p-2">Annual routine screening in 12 months at PHC</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Grade 1 (Mild NPDR)</td>
                  <td className="p-2 text-blue-600 font-semibold">Moderate</td>
                  <td className="p-2">Repeat screening in 6–9 months, diet/glycemic review</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Grade 2 (Moderate NPDR)</td>
                  <td className="p-2 text-amber-600 font-semibold">Moderate</td>
                  <td className="p-2">Refer to Ophthalmologist within 3–4 weeks</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Grade 3 (Severe NPDR)</td>
                  <td className="p-2 text-orange-600 font-semibold">High</td>
                  <td className="p-2">Urgent referral to Vitreo-Retina specialist in 1–2 weeks</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Grade 4 (Proliferative)</td>
                  <td className="p-2 text-rose-600 font-semibold">Critical</td>
                  <td className="p-2 font-bold text-rose-600">EMERGENCY: Specialist referral within 24–48 hours for PRP / Anti-VEGF</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )
    }
  ];

  const filteredFaqs = activeCategory === 'all' 
    ? faqs 
    : faqs.filter(f => f.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-labelledby="clinical-guide-title"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 id="clinical-guide-title" className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Clinical Knowledge Base &amp; FAQ
                <span className="text-[10px] font-mono font-semibold bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full">
                  v1.1.2.8
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Standardized ophthalmic triage protocols, IQA guidelines &amp; DISHA compliance rules
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close Clinical Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="px-6 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'all', label: 'All Topics' },
            { id: 'clinical', label: 'DR Staging' },
            { id: 'optical', label: 'IQA & Lens' },
            { id: 'workflow', label: 'Clinic Workflow' },
            { id: 'compliance', label: 'Security & DISHA' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap",
                activeCategory === cat.id
                  ? "bg-sky-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Accordion Content List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredFaqs.map(faq => {
            const isExpanded = expandedId === faq.id;
            return (
              <div 
                key={faq.id}
                className={cn(
                  "border rounded-xl transition-all overflow-hidden",
                  isExpanded 
                    ? "border-sky-300 dark:border-sky-700 bg-sky-50/20 dark:bg-sky-950/20 shadow-xs" 
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left cursor-pointer gap-3"
                  aria-expanded={isExpanded}
                >
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex-1">
                    {faq.question}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
                      {faq.category}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in">
                    {faq.answer}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                      <button
                        onClick={() => handleCopy(faq.question, faq.id)}
                        className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-mono flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedSection === faq.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-500">Copied Section!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Reference</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px] font-medium">Smart India Hackathon #26038 Certified Protocol</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-xs"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
