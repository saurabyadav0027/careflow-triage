import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatSlaCountdown } from '../../services/triageEngine';

interface SLATimerProps {
  deadlineIso: string;
  isResolved?: boolean;
  slaMet?: boolean;
}

export const SLATimer: React.FC<SLATimerProps> = ({ deadlineIso, isResolved = false, slaMet = true }) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (isResolved) return;
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 10000); // refresh every 10 seconds
    return () => clearInterval(interval);
  }, [isResolved]);

  if (isResolved) {
    return (
      <span className={`inline-flex items-center gap-1 font-mono text-xs ${slaMet ? 'text-emerald-700' : 'text-amber-700'}`}>
        <CheckCircle2 className="w-3.5 h-3.5" />
        {slaMet ? 'Resolved in SLA' : 'Resolved (Overdue)'}
      </span>
    );
  }

  const { text, isBreached, isWarning } = formatSlaCountdown(deadlineIso);

  if (isBreached) {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-300 animate-pulse">
        <AlertTriangle className="w-3.5 h-3.5 text-red-700" />
        {text}
      </span>
    );
  }

  if (isWarning) {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
        <Clock className="w-3.5 h-3.5 text-amber-700" />
        {text}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
      <Clock className="w-3.5 h-3.5 text-slate-500" />
      {text}
    </span>
  );
};
