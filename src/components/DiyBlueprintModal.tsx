import React from 'react';

interface DiyBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DiyBlueprintModal({ isOpen, onClose }: DiyBlueprintModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto fade-in-section">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 text-[#0B1B3D] text-[10px] font-bold uppercase tracking-wider">
              Open-Source Hardware Documentation
            </span>
            <h3 className="text-xl font-black text-[#0B1B3D] mt-1">How to Make a Smartphone-Based Fundus Camera</h3>
            <p className="text-xs text-slate-500">Low-Cost Ophthalmic Retinal Screening Adapter • SIH Engineering Guide</p>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Section 1: Overview & Optical Geometry */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-[#0B1B3D] flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#0B1B3D] text-white flex items-center justify-center text-xs">1</span>
            <span>Optical Geometry & Physics</span>
          </h4>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-2">
            <p>
              The smartphone fundus camera functions as an <strong>indirect ophthalmoscope</strong>. The optical distance between the smartphone camera sensor and the 20D condensing lens is fixed at <strong>50 mm (f = 1000 / 20 = 50 mm)</strong>, ensuring the lens focuses the coaxial light ray through the pupil to illuminate a ~45° field of the retina.
            </p>
            <div className="font-mono text-[11px] bg-white p-2.5 rounded-xl border border-slate-200 text-slate-800">
              <strong>Key Formula:</strong> Working Distance = Focal Length (f) = 1000 mm / Diopter (D)<br/>
              • 20D Lens: f = 50.0 mm | Magnification: ~3.0x | Field of View: ~45°<br/>
              • 28D Lens: f = 35.7 mm | Magnification: ~2.2x | Field of View: ~55°
            </div>
          </div>
        </div>

        {/* Section 2: Bill of Materials & Sourcing */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-[#0B1B3D] flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#0B1B3D] text-white flex items-center justify-center text-xs">2</span>
            <span>Bill of Materials (BOM)</span>
          </h4>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Component</th>
                  <th className="p-3">Specification</th>
                  <th className="p-3">Approx. Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="p-3 font-semibold">Condensing Lens</td>
                  <td className="p-3">20D double aspheric glass (50mm dia.)</td>
                  <td className="p-3 font-mono font-bold text-emerald-700">₹850 - ₹1,100</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Adapter Barrel</td>
                  <td className="p-3">3D Printed Matte Black PLA (100% infill)</td>
                  <td className="p-3 font-mono font-bold text-emerald-700">₹250</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Linear Polarizer Sheets</td>
                  <td className="p-3">Orthogonal 90° Cross-Polarizer set</td>
                  <td className="p-3 font-mono font-bold text-emerald-700">₹150</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Silicone Eyecup</td>
                  <td className="p-3">Hypoallergenic medical silicone buffer</td>
                  <td className="p-3 font-mono font-bold text-emerald-700">₹120</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Universal Phone Clamp</td>
                  <td className="p-3">Spring-tensioned rubber padded clip</td>
                  <td className="p-3 font-mono font-bold text-emerald-700">₹150</td>
                </tr>
                <tr className="bg-emerald-50/60 font-bold">
                  <td className="p-3 text-emerald-950" colSpan={2}>Total System Hardware Cost</td>
                  <td className="p-3 font-mono text-emerald-950">~ ₹1,520 - ₹1,770</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: 5-Step DIY Assembly Protocol */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-[#0B1B3D] flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#0B1B3D] text-white flex items-center justify-center text-xs">3</span>
            <span>Step-by-Step DIY Assembly Protocol</span>
          </h4>
          <ol className="space-y-2 text-xs text-slate-600 list-decimal list-inside">
            <li className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <strong>3D Print the Optical Barrel:</strong> Use black matte PLA or PETG to prevent internal reflections. Layer height: 0.15mm, infill: 100%. Print internal baffles or line the tube with black flocking paper.
            </li>
            <li className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <strong>Install Polarizing Filters:</strong> Affix Polarizer A over the smartphone LED flash aperture. Affix Polarizer B in front of the smartphone camera lens rotated precisely 90° relative to Polarizer A. This extinguishes anterior corneal Purkinje glare.
            </li>
            <li className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <strong>Seat the 20D Condensing Lens:</strong> Press-fit the 20D double aspheric lens into the front retaining ring at exactly 50 mm distance from the camera sensor plane. Secure with the threaded locking collar.
            </li>
            <li className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <strong>Attach the Silicone Patient Eyecup:</strong> Fit the soft silicone eyecup over the patient end. This shields ambient light and provides comfortable tactile registration against the patient's orbital rim.
            </li>
            <li className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <strong>Align and Lock Phone Clamp:</strong> Align the adapter barrel centered over the smartphone camera and flash. Secure the universal phone clamp thumb screws.
            </li>
          </ol>
        </div>

        {/* Section 4: Operational Clinical Guidelines */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1.5">
          <h5 className="font-bold flex items-center gap-1.5">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>Smartphone Camera App Configuration</span>
          </h5>
          <p className="leading-relaxed">
            • <strong>Focus:</strong> Lock manual focus to Infinity (∞).<br/>
            • <strong>Exposure & ISO:</strong> ISO 100 to 200 to eliminate sensor noise; shutter speed 1/60s.<br/>
            • <strong>Flash:</strong> Keep smartphone LED on continuous low-intensity torch mode during alignment, then snap high-resolution capture or record 4K 60fps video and extract the sharpest unblurred frame for AI screening.
          </p>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <button 
            type="button" 
            onClick={() => window.print()} 
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            <span>Print / Save as PDF</span>
          </button>
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0B1B3D] text-white text-xs font-bold hover:bg-[#1E40AF] transition-all"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
}
