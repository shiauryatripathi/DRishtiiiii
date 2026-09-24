import React from 'react';
import { ExplainableAIDossier } from './ExplainableAIDossier';
import { Scan, Patient } from '../types';

export interface ExplainableAIModalProps {
  scan: Scan | null;
  patient?: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onRefreshXAI?: () => Promise<void>;
}

export function ExplainableAIModal({
  scan,
  patient,
  isOpen,
  onClose,
  onRefreshXAI
}: ExplainableAIModalProps) {
  if (!isOpen || !scan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200 shadow-2xl rounded-2xl overflow-hidden">
        <ExplainableAIDossier 
          scan={scan}
          patient={patient}
          onClose={onClose}
          onRefreshXAI={onRefreshXAI}
          isModal={true}
        />
      </div>
    </div>
  );
}
