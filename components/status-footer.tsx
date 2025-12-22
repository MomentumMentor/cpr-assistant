'use client';

import { useWizard } from '@/lib/wizard-context';
import { Check, X } from 'lucide-react';

export function StatusFooter() {
  const { state } = useWizard();

  if (!state.sessionId) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 text-white py-3 px-4 text-sm z-50">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold">{state.userName}</span>
          <span className="text-slate-300">|</span>
          <span className="capitalize">{state.communicationMode} Mode</span>
          <span className="text-slate-300">|</span>
          <span className="uppercase">{state.pathway} Pathway</span>
          {state.currentSection && (
            <>
              <span className="text-slate-300">|</span>
              <span>Working on: <span className="capitalize">{state.currentSection}</span></span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-300">Locked:</span>
          <div className="flex items-center gap-1">
            <span>Context</span>
            {state.context?.locked_at ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <X className="w-4 h-4 text-red-400" />
            )}
          </div>
          <div className="flex items-center gap-1">
            <span>Purpose</span>
            {state.purpose?.locked_at ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <X className="w-4 h-4 text-red-400" />
            )}
          </div>
          <div className="flex items-center gap-1">
            <span>Results</span>
            {state.results.some(r => r.locked_at) ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <X className="w-4 h-4 text-red-400" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
