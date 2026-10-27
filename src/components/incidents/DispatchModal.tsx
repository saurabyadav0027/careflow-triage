import React, { useState } from 'react';
import { X, Send, AlertTriangle, UserCheck, Shield } from 'lucide-react';
import { Incident, Responder } from '../../types';
import { validateStatusTransition, createAuditLog } from '../../services/stateMachine';

interface DispatchModalProps {
  incident: Incident | null;
  responders: Responder[];
  isOpen: boolean;
  onClose: () => void;
  onConfirmDispatch: (incidentId: string, responder: Responder, notes: string) => void;
}

export const DispatchModal: React.FC<DispatchModalProps> = ({
  incident,
  responders,
  isOpen,
  onClose,
  onConfirmDispatch
}) => {
  const [selectedResponderId, setSelectedResponderId] = useState<string>('');
  const [dispatchNotes, setDispatchNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !incident) return null;

  const selectedResponder = responders.find(r => r.id === selectedResponderId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedResponder) {
      setError('Please select an active clinical responder from the roster.');
      return;
    }

    const validation = validateStatusTransition(incident, 'DISPATCHED', {
      responderId: selectedResponder.id
    });

    if (!validation.valid) {
      setError(validation.error || 'Invalid dispatch transition.');
      return;
    }

    onConfirmDispatch(incident.id, selectedResponder, dispatchNotes.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-lg border border-slate-300 shadow-xl max-w-lg w-full overflow-hidden text-sm">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Send className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-base font-semibold">Dispatch Operational Responder</h2>
              <p className="text-xs text-slate-300">Assign on-duty staff to incident {incident.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-300 rounded text-red-800 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Incident summary */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-slate-700">{incident.id}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-200 font-semibold text-slate-800">{incident.priority}</span>
            </div>
            <div className="font-medium text-slate-900 mt-1">{incident.title}</div>
            <div className="text-xs text-slate-500 mt-0.5">Location: {incident.location} &bull; Dept: {incident.department}</div>
          </div>

          {/* Responders Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Qualified Responder ({responders.length} on roster)
            </label>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {responders.map(resp => {
                const isSelected = selectedResponderId === resp.id;
                const isHighCaseload = resp.activeIncidentCount >= 2;
                return (
                  <div
                    key={resp.id}
                    onClick={() => setSelectedResponderId(resp.id)}
                    className={`p-2.5 rounded border cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-slate-900 text-xs">{resp.name}</div>
                        <div className="text-[11px] text-slate-500">{resp.role} &bull; {resp.department}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{resp.specialization}</div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-1.5 py-0.5 text-[10px] rounded font-mono ${
                          isHighCaseload 
                            ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {resp.activeIncidentCount} active
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">{resp.phone}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* High workload caution alert if selected responder has multiple cases */}
          {selectedResponder && selectedResponder.activeIncidentCount >= 2 && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-800 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong>Workload Notice:</strong> {selectedResponder.name} currently has {selectedResponder.activeIncidentCount} active cases. Ensure priority alignment.
              </span>
            </div>
          )}

          {/* Dispatch Handover Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Dispatch Instructions / Clinical Handoff Note
            </label>
            <textarea
              rows={2}
              value={dispatchNotes}
              onChange={e => setDispatchNotes(e.target.value)}
              placeholder="e.g. Bring emergency airway kit. Coordinate with Bedside RN..."
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
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
              disabled={!selectedResponderId}
              className="px-5 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded text-xs font-medium shadow-sm transition-colors"
            >
              Confirm Dispatch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
