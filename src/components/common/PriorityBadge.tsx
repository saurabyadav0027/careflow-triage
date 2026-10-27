import React from 'react';
import { Priority } from '../../types';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  switch (priority) {
    case 'P1':
      return (
        <span className={`inline-flex items-center gap-1 font-semibold rounded border bg-red-50 text-red-700 border-red-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
          P1 Immediate (&lt;15m)
        </span>
      );
    case 'P2':
      return (
        <span className={`inline-flex items-center gap-1 font-semibold rounded border bg-amber-50 text-amber-800 border-amber-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
          P2 Urgent (&lt;1h)
        </span>
      );
    case 'P3':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded border bg-blue-50 text-blue-700 border-blue-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          P3 Semi-Urgent (&lt;4h)
        </span>
      );
    case 'P4':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded border bg-slate-100 text-slate-700 border-slate-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          P4 Routine (&lt;24h)
        </span>
      );
    default:
      return null;
  }
};
