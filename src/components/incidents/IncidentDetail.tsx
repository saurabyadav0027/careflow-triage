import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  MapPin, 
  User, 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  History, 
  ShieldAlert, 
  ShieldCheck,
  FileText,
  Activity,
  ArrowRight
} from 'lucide-react';
import { Incident, Responder } from '../../types';
import { PriorityBadge } from '../common/PriorityBadge';
import { StatusBadge } from '../common/StatusBadge';
import { SLATimer } from '../common/SLATimer';

interface IncidentDetailProps {
  incident: Incident | null;
  responders: Responder[];
  isOpen: boolean;
  onClose: () => void;
  onOpenDispatch: (incident: Incident) => void;
  onOpenResolve: (incident: Incident) => void;
  onUpdateStatus: (incidentId: string, newStatus: any, notes: string) => void;
  onEscalate: (incidentId: string, reason: string) => void;
}

export const IncidentDetail: React.FC<IncidentDetailProps> = ({
  incident,
  isOpen,
  onClose,
  onOpenDispatch,
  onOpenResolve,
  onUpdateStatus,
  onEscalate
}) => {
  const [showEscalatePrompt, setShowEscalatePrompt] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');

  if (!isOpen || !incident) return null;

  const handleEscalateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (escalateReason.trim().length >= 5) {
      onEscalate(incident.id, escalateReason.trim());
      setShowEscalatePrompt(false);
      setEscalateReason('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-lg border border-slate-300 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden text-sm">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-sm px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {incident.id}
            </span>
            <PriorityBadge priority={incident.priority} />
            <StatusBadge status={incident.status} />
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">SLA Target:</span>
            <SLATimer 
              deadlineIso={incident.slaDeadline} 
              isResolved={incident.status === 'RESOLVED'} 
              slaMet={incident.resolution?.slaMet} 
            />
          </div>

          <div className="flex items-center space-x-2">
            {/* If reported or triaged, show dispatch button */}
            {(incident.status === 'REPORTED' || incident.status === 'TRIAGED' || incident.status === 'ESCALATED') && (
              <button
                onClick={() => onOpenDispatch(incident)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium rounded shadow-sm transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Responder</span>
              </button>
            )}

            {/* If dispatched, allow transition to in progress */}
            {incident.status === 'DISPATCHED' && (
              <button
                onClick={() => onUpdateStatus(incident.id, 'IN_PROGRESS', 'Responder on scene; interventions started')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded shadow-sm transition-colors"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Mark In Progress</span>
              </button>
            )}

            {/* If in progress or dispatched, allow resolve */}
            {(incident.status === 'IN_PROGRESS' || incident.status === 'DISPATCHED') && (
              <button
                onClick={() => onOpenResolve(incident)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded shadow-sm transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Resolve & Sign-Off</span>
              </button>
            )}

            {/* Escalate button */}
            {incident.status !== 'RESOLVED' && incident.status !== 'ESCALATED' && (
              <button
                onClick={() => setShowEscalatePrompt(true)}
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-white border border-slate-300 hover:border-red-300 hover:text-red-700 text-slate-700 text-xs font-medium rounded transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span>Escalate</span>
              </button>
            )}
          </div>
        </div>

        {/* Escalation Prompt Form */}
        {showEscalatePrompt && (
          <form onSubmit={handleEscalateSubmit} className="p-4 bg-red-50 border-b border-red-200 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-red-900">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Document Reason for Clinical Escalation:</span>
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                required
                value={escalateReason}
                onChange={e => setEscalateReason(e.target.value)}
                placeholder="e.g. Patient deteriorated into arrest / Specialist required / Equipment unavailable..."
                className="flex-1 px-3 py-1.5 text-xs border border-red-300 rounded focus:outline-none bg-white"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-red-700 text-white rounded text-xs font-medium hover:bg-red-800"
              >
                Confirm Escalation
              </button>
              <button
                type="button"
                onClick={() => setShowEscalatePrompt(false)}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded text-xs hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Drawer Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Title & Core Meta */}
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">{incident.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
              <span className="flex items-center gap-1 font-medium text-slate-800">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {incident.department} &bull; {incident.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Reported {new Date(incident.reportedAt).toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                Reporter: {incident.reporterName} ({incident.reporterContact})
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded text-xs leading-relaxed text-slate-800">
            <h3 className="font-semibold text-slate-700 uppercase tracking-wider text-[11px] mb-1">Clinical Observation Notes</h3>
            {incident.description}
          </div>

          {/* Assigned Responder Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 border border-slate-200 rounded bg-white">
              <h3 className="font-semibold text-slate-700 uppercase tracking-wider text-[11px] mb-2 flex items-center justify-between">
                <span>Assigned Responder</span>
                {incident.assignedResponderName ? (
                  <span className="text-[10px] text-emerald-700 font-mono font-normal">Active</span>
                ) : (
                  <span className="text-[10px] text-amber-700 font-mono font-normal">Pending Dispatch</span>
                )}
              </h3>
              {incident.assignedResponderName ? (
                <div>
                  <div className="font-semibold text-slate-900 text-xs">{incident.assignedResponderName}</div>
                  <div className="text-[11px] text-slate-500">{incident.assignedResponderRole}</div>
                  {incident.dispatchedAt && (
                    <div className="text-[10px] text-slate-400 mt-1">
                      Dispatched: {new Date(incident.dispatchedAt).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">
                  No responder currently assigned. Use the dispatch button above to allocate staff.
                </div>
              )}
            </div>

            {/* Triage Protocol Analysis */}
            <div className="p-3.5 border border-slate-200 rounded bg-white">
              <h3 className="font-semibold text-slate-700 uppercase tracking-wider text-[11px] mb-2">
                Triage Rule Evaluation
              </h3>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Algorithmic Index:</span>
                  <span className="font-mono font-bold text-slate-800">{incident.triageAssessment.calculatedScore} / 10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target SLA Response:</span>
                  <span className="font-mono text-slate-800">{incident.slaMinutes} minutes</span>
                </div>
                <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                  {incident.triageAssessment.clinicalRationale}
                </div>
              </div>
            </div>
          </div>

          {/* Resolution Card if resolved */}
          {incident.status === 'RESOLVED' && incident.resolution && (
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded text-xs space-y-2">
              <div className="flex items-center space-x-2 text-emerald-900 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Verified Resolution & Root Cause Sign-Off</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                <div>
                  <span className="font-medium text-slate-900">Root Cause: </span>
                  {incident.resolution.rootCause}
                </div>
                <div>
                  <span className="font-medium text-slate-900">Time to Resolve: </span>
                  <span className="font-mono">{incident.resolution.timeToResolveMinutes} mins</span> ({incident.resolution.slaMet ? 'Within SLA' : 'SLA Breached'})
                </div>
                <div className="sm:col-span-2">
                  <span className="font-medium text-slate-900">Corrective Action: </span>
                  {incident.resolution.correctiveAction}
                </div>
                <div className="sm:col-span-2 text-slate-500 text-[11px]">
                  Verified by: {incident.resolution.verifiedBy} ({incident.resolution.verifiedRole}) on {new Date(incident.resolution.resolvedAt).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* Chronological Regulatory Audit Trail */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4 text-slate-500" />
              <h3 className="font-semibold text-xs text-slate-800 uppercase tracking-wider">
                Regulatory Audit Log ({incident.auditTrail.length} entries)
              </h3>
            </div>

            <div className="border border-slate-200 rounded divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {incident.auditTrail.map((log) => (
                <div key={log.id} className="p-3 text-xs hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                    <span className="font-medium text-slate-700">{log.actor}</span>
                    <span className="font-mono">{new Date(log.timestamp).toLocaleTimeString()} &bull; {new Date(log.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div className="font-semibold text-slate-800 flex items-center space-x-1.5">
                    <span>{log.action}</span>
                    {log.previousStatus && log.newStatus && (
                      <span className="inline-flex items-center space-x-1 text-[11px] text-slate-500 font-normal">
                        <span>({log.previousStatus}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span>{log.newStatus})</span>
                      </span>
                    )}
                  </div>
                  {log.notes && (
                    <p className="text-slate-600 text-[11px] mt-1 italic">&ldquo;{log.notes}&rdquo;</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
