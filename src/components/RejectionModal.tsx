import React from 'react';

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RejectionModal({ isOpen, onClose }: RejectionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-200 text-center space-y-4 fade-in-section">
        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-black text-[#0B1B3D]">Non-Fundus Image Rejected</h3>
          <p className="text-xs text-slate-500">Optical Quality & Modality Failure</p>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-left">
          The uploaded file does not demonstrate retinal vascular architecture, choroidal red-spectrum dominance, or ocular field geometry. To ensure clinical diagnostic integrity, only true retinal fundus photographs are evaluated.
        </p>

        <div className="flex items-center justify-center gap-2 pt-1">
          <button 
            type="button" 
            onClick={onClose} 
            className="w-full py-2.5 px-4 rounded-xl bg-[#0B1B3D] text-white text-xs font-bold hover:bg-[#1E40AF] transition-all"
          >
            Select Valid Fundus Image
          </button>
        </div>
      </div>
    </div>
  );
}
