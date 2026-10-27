import React from 'react';
import { Incident, IncidentStatus, Responder } from '../../types';
import { PriorityBadge } from '../common/PriorityBadge';
import { SLATimer } from '../common/SLATimer';
import { MapPin, User, ArrowRight, CheckCircle2, Send, PlusCircle } from 'lucide-react';

interface KanbanBoardProps {
  incidents: Incident[];
  responders: Responder[];
  onSelectIncident: (incident: Incident) => void;
  onOpenDispatch: (incident: Incident) => void;
  onOpenResolve: (incident: Incident) => void;
  onUpdateStatus: (incidentId: string, newStatus: IncidentStatus, notes: string) => void;
  onOpenNewIncident: () => void;
}

const COLUMNS: { id: IncidentStatus; title: string; subtitle: string; color: string }[] = [
  { id: 'REPORTED', title: 'Intake Queue', subtitle: 'Awaiting triage or dispatch', color: 'border-slate-300' },
  { id: 'TRIAGED', title: 'Triaged Queue', subtitle: 'Severity scored & prioritized', color: 'border-sky-300' },
  { id: 'DISPATCHED', title: 'Dispatched', subtitle: 'Responders en route', color: 'border-blue-300' },
  { id: 'IN_PROGRESS', title: 'In Progress', subtitle: 'Bedside investigation / active', color: 'border-amber-300' },
  { id: 'RESOLVED', title: 'Resolved & Signed', subtitle: 'Verified root cause sign-off', color: 'border-emerald-300' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  incidents,
  onSelectIncident,
  onOpenDispatch,
  onOpenResolve,
  onUpdateStatus,
  onOpenNewIncident
}) => {
  return (
    <div className="space-y-3">
      {/* Kanban Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Clinical Dispatch Kanban Board</h2>
          <p className="text-xs text-slate-500">Live operational lifecycle progression across hospital departments</p>
        </div>
        <button
          onClick={onOpenNewIncident}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-medium shadow-sm transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Incident</span>
        </button>
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 overflow-x-auto min-h-[600px] pb-4">
        {COLUMNS.map(col => {
          const colIncidents = incidents.filter(i => i.status === col.id);
          return (
            <div 
              key={col.id} 
              className="bg-slate-100/90 rounded-lg border border-slate-200 flex flex-col min-w-[240px] max-w-full"
            >
              {/* Column Top Bar */}
              <div className={`p-3 bg-white border-b ${col.color} rounded-t-lg shadow-2xs`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-800 uppercase tracking-wider">{col.title}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {colIncidents.length}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">{col.subtitle}</p>
              </div>

              {/* Cards Container */}
              <div className="p-2 space-y-2.5 flex-1 overflow-y-auto max-h-[72vh]">
                {colIncidents.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-center p-3 border border-dashed border-slate-300 rounded text-slate-400 text-xs italic">
                    No active items in {col.title}
                  </div>
                ) : (
                  colIncidents.map(incident => (
                    <div
                      key={incident.id}
                      onClick={() => onSelectIncident(incident)}
                      className="p-3 bg-white border border-slate-200 hover:border-slate-400 rounded shadow-xs hover:shadow-sm cursor-pointer transition-all space-y-2"
                    >
                      {/* Priority and ID */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold text-slate-700">{incident.id}</span>
                        <PriorityBadge priority={incident.priority} size="sm" />
                      </div>

                      {/* Title */}
                      <div className="font-semibold text-xs text-slate-900 line-clamp-2 leading-snug">
                        {incident.title}
                      </div>

                      {/* Location and Department */}
                      <div className="flex items-center space-x-1 text-[11px] text-slate-500">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{incident.location}</span>
                      </div>

                      {/* SLA Timer */}
                      <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-xs">
                        <SLATimer 
                          deadlineIso={incident.slaDeadline}
                          isResolved={incident.status === 'RESOLVED'}
                          slaMet={incident.resolution?.slaMet}
                        />
                      </div>

                      {/* Assigned Staff or Quick Action */}
                      <div className="pt-1 flex items-center justify-between text-[11px]" onClick={e => e.stopPropagation()}>
                        <div className="truncate text-slate-600 max-w-[120px]">
                          {incident.assignedResponderName ? (
                            <span className="flex items-center space-x-1">
                              <User className="w-3 h-3 text-slate-400 flex-shrink-0" />
                              <span className="truncate">{incident.assignedResponderName.split(' ')[1] || incident.assignedResponderName}</span>
                            </span>
                          ) : (
                            <span className="text-amber-700 italic">Unassigned</span>
                          )}
                        </div>

                        {/* Direct workflow advancement buttons */}
                        <div className="flex items-center space-x-1">
                          {(incident.status === 'REPORTED' || incident.status === 'TRIAGED') && (
                            <button
                              onClick={() => onOpenDispatch(incident)}
                              className="px-2 py-0.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-[10px] font-medium transition-colors"
                              title="Dispatch Responder"
                            >
                              Dispatch
                            </button>
                          )}

                          {incident.status === 'DISPATCHED' && (
                            <button
                              onClick={() => onUpdateStatus(incident.id, 'IN_PROGRESS', 'Responder commenced on-scene work')}
                              className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-medium transition-colors"
                              title="Start Work"
                            >
                              Start
                            </button>
                          )}

                          {incident.status === 'IN_PROGRESS' && (
                            <button
                              onClick={() => onOpenResolve(incident)}
                              className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10px] font-medium transition-colors"
                              title="Resolve Incident"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
