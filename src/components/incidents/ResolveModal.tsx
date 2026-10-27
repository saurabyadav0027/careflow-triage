import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { Incident, ResolutionData } from '../../types';
import { validateStatusTransition } from '../../services/stateMachine';
import { getSlaRemainingMinutes } from '../../services/triageEngine';

interface ResolveModalProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmResolve: (incidentId: string, resolution: ResolutionData) => void;
}

const ROOT_CAUSES: ResolutionData['rootCause'][] = [
  'Equipment Wear',
  'Human Protocol Error',
  'Clinical Complication',
  'External Infrastructure Failure',
  'Supply Shortage'
];

export const ResolveModal: React.FC<ResolveModalProps> = ({
  incident,
  isOpen,
  onClose,
  onConfirmResolve
}) => {
  const [rootCause, setRootCause] = useState<ResolutionData['rootCause']>('Equipment Wear');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [verifiedBy, setVerifiedBy] = useState('');
  const [verifiedRole, setVerifiedRole] = useState('Attending Physician / Lead Engineer');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !incident) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const now = new Date();
    const reportedTime = new Date(incident.reportedAt).getTime();
    const timeToResolveMinutes = Math.max(1, Math.round((now.getTime() - reportedTime) / 60000));
    
    // Check whether resolution time occurred before SLA deadline
    const deadlineTime = new Date(incident.slaDeadline).getTime();
    const slaMet = now.getTime() <= deadlineTime;

    const resolutionPayload: ResolutionData = {
      rootCause,
      correctiveAction: correctiveAction.trim(),
      verifiedBy: verifiedBy.trim(),
      verifiedRole: verifiedRole.trim(),
      resolvedAt: now.toISOString(),
      timeToResolveMinutes,
      slaMet
    };

    const validation = validateStatusTransition(incident, 'RESOLVED', {
      resolution: resolutionPayload
    });

    if (!validation.valid) {
      setError(validation.error || 'Resolution guard requirements not met.');
      return;
    }

    onConfirmResolve(incident.id, resolutionPayload);
    onClose();
  };

  const isCurrentSlaBreached = getSlaRemainingMinutes(incident.slaDeadline) < 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-lg border border-slate-300 shadow-xl max-w-lg w-full overflow-hidden text-sm">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-semibold">Incident Resolution & RCA Sign-Off</h2>
              <p className="text-xs text-slate-300">Complete clinical guard requirements to archive {incident.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-300 rounded text-red-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Incident snapshot */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-slate-700">{incident.id}</span>
              <span className="text-xs font-mono text-slate-500">Target SLA: {incident.slaMinutes}m</span>
            </div>
            <div className="font-semibold text-slate-900 mt-1">{incident.title}</div>
            <div className="text-xs text-slate-500">Location: {incident.location}</div>
            
            <div className="mt-2 pt-2 border-t border-slate-200 text-xs flex items-center justify-between">
              <span className="text-slate-600">SLA Status:</span>
              <span className={`font-mono font-medium ${isCurrentSlaBreached ? 'text-red-700' : 'text-emerald-700'}`}>
                {isCurrentSlaBreached ? 'Current time exceeds target SLA' : 'Within allotted SLA window'}
              </span>
            </div>
          </div>

          {/* Root cause classification */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Primary Root Cause Category (Mandatory for Accreditation) *
            </label>
            <select
              value={rootCause}
              onChange={e => setRootCause(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              {ROOT_CAUSES.map(rc => (
                <option key={rc} value={rc}>{rc}</option>
              ))}
            </select>
          </div>

          {/* Corrective action description */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Corrective Action Taken & Resolution Summary * (min 10 characters)
            </label>
            <textarea
              required
              rows={3}
              value={correctiveAction}
              onChange={e => setCorrectiveAction(e.target.value)}
              placeholder="Detail medical interventions executed, device replacement, sensor recalibration, or patient stabilization..."
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Clinical Sign-off verification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Verified By (Full Name) *</label>
              <input
                type="text"
                required
                value={verifiedBy}
                onChange={e => setVerifiedBy(e.target.value)}
                placeholder="e.g. Dr. Alistair Ross"
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Verifier Role / Title</label>
              <input
                type="text"
                value={verifiedRole}
                onChange={e => setVerifiedRole(e.target.value)}
                placeholder="e.g. Intensive Care Specialist"
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded text-xs font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-medium shadow-sm transition-colors"
            >
              Verify & Close Incident
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
