import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  ArrowUpDown, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { Incident, IncidentFilters, Department, Priority, IncidentStatus, Responder } from '../../types';
import { PriorityBadge } from '../common/PriorityBadge';
import { StatusBadge } from '../common/StatusBadge';
import { SLATimer } from '../common/SLATimer';
import { getSlaRemainingMinutes } from '../../services/triageEngine';

interface IncidentListProps {
  incidents: Incident[];
  responders: Responder[];
  onSelectIncident: (incident: Incident) => void;
  onOpenDispatch: (incident: Incident) => void;
  onOpenResolve: (incident: Incident) => void;
  onOpenNewIncident: () => void;
}

export const IncidentList: React.FC<IncidentListProps> = ({
  incidents,
  responders,
  onSelectIncident,
  onOpenDispatch,
  onOpenResolve,
  onOpenNewIncident
}) => {
  const [filters, setFilters] = useState<IncidentFilters>({
    searchQuery: '',
    status: 'ALL',
    priority: 'ALL',
    department: 'ALL',
    category: 'ALL',
    slaBreachedOnly: false
  });

  const [sortBy, setSortBy] = useState<'reportedAt' | 'priority' | 'slaDeadline'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filtered and sorted incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesQuery = 
          inc.id.toLowerCase().includes(query) ||
          inc.title.toLowerCase().includes(query) ||
          inc.location.toLowerCase().includes(query) ||
          inc.department.toLowerCase().includes(query) ||
          (inc.assignedResponderName && inc.assignedResponderName.toLowerCase().includes(query));
        if (!matchesQuery) return false;
      }

      // Status
      if (filters.status !== 'ALL' && inc.status !== filters.status) {
        return false;
      }

      // Priority
      if (filters.priority !== 'ALL' && inc.priority !== filters.priority) {
        return false;
      }

      // Department
      if (filters.department !== 'ALL' && inc.department !== filters.department) {
        return false;
      }

      // SLA Breached Only
      if (filters.slaBreachedOnly) {
        const isBreached = inc.status !== 'RESOLVED' && getSlaRemainingMinutes(inc.slaDeadline) < 0;
        if (!isBreached) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'priority') {
        const rank: Record<Priority, number> = { P1: 1, P2: 2, P3: 3, P4: 4 };
        const diff = rank[a.priority] - rank[b.priority];
        return sortOrder === 'asc' ? diff : -diff;
      }
      if (sortBy === 'slaDeadline') {
        const diff = new Date(a.slaDeadline).getTime() - new Date(b.slaDeadline).getTime();
        return sortOrder === 'asc' ? diff : -diff;
      }
      const diff = new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
      return sortOrder === 'asc' ? -diff : diff;
    });
  }, [incidents, filters, sortBy, sortOrder]);

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search input */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={e => setFilters(f => ({ ...f, searchQuery: e.target.value }))}
              placeholder="Search by ID, title, location, ward, responder..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              value={filters.status}
              onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="REPORTED">Reported</option>
              <option value="TRIAGED">Triaged</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="ESCALATED">Escalated</option>
            </select>
          </div>

          {/* Priority filter */}
          <div>
            <select
              value={filters.priority}
              onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="P1">P1 Immediate (&lt;15m)</option>
              <option value="P2">P2 Urgent (&lt;1h)</option>
              <option value="P3">P3 Semi-Urgent (&lt;4h)</option>
              <option value="P4">P4 Routine (&lt;24h)</option>
            </select>
          </div>
        </div>

        {/* Secondary Filters row */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center space-x-1.5 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={filters.slaBreachedOnly}
                onChange={e => setFilters(f => ({ ...f, slaBreachedOnly: e.target.checked }))}
                className="h-3.5 w-3.5 text-red-600 rounded border-slate-300 focus:ring-red-500"
              />
              <span className="font-medium text-red-700">SLA Breached Only</span>
            </label>

            <span className="text-slate-300">|</span>

            <div className="flex items-center space-x-1">
              <span className="text-slate-500">Department:</span>
              <select
                value={filters.department}
                onChange={e => setFilters(f => ({ ...f, department: e.target.value }))}
                className="border-none bg-transparent font-medium text-slate-800 p-0 text-xs focus:ring-0 cursor-pointer"
              >
                <option value="ALL">All Departments</option>
                <option value="Emergency (ED)">Emergency (ED)</option>
                <option value="Intensive Care (ICU)">Intensive Care (ICU)</option>
                <option value="Operating Theatres (OR)">Operating Theatres (OR)</option>
                <option value="General Ward">General Ward</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Biomedical Engineering">Biomedical Engineering</option>
                <option value="Facilities & Safety">Facilities & Safety</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-slate-500">
            <span>Sort by:</span>
            <button
              onClick={() => {
                if (sortBy === 'priority') setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
                else { setSortBy('priority'); setSortOrder('asc'); }
              }}
              className={`px-2 py-0.5 rounded border text-[11px] font-medium transition-colors ${
                sortBy === 'priority' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-300 text-slate-600'
              }`}
            >
              Priority {sortBy === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => {
                if (sortBy === 'slaDeadline') setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
                else { setSortBy('slaDeadline'); setSortOrder('asc'); }
              }}
              className={`px-2 py-0.5 rounded border text-[11px] font-medium transition-colors ${
                sortBy === 'slaDeadline' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-300 text-slate-600'
              }`}
            >
              SLA Time {sortBy === 'slaDeadline' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {filteredIncidents.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-semibold text-slate-700 text-sm">No clinical incidents match active filters.</p>
            <p>Try resetting filters or log a new incident into the triage intake.</p>
            <button
              onClick={onOpenNewIncident}
              className="mt-2 inline-flex items-center space-x-1 text-blue-700 hover:text-blue-800 font-medium"
            >
              <span>+ Report New Incident</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th scope="col" className="px-4 py-3">ID & Priority</th>
                  <th scope="col" className="px-4 py-3">Incident Title & Location</th>
                  <th scope="col" className="px-4 py-3">Department</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3">SLA Countdown</th>
                  <th scope="col" className="px-4 py-3">Assigned Staff</th>
                  <th scope="col" className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredIncidents.map(incident => (
                  <tr 
                    key={incident.id} 
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    onClick={() => onSelectIncident(incident)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-mono font-semibold text-slate-900">{incident.id}</div>
                      <div className="mt-1">
                        <PriorityBadge priority={incident.priority} size="sm" />
                      </div>
                    </td>

                    <td className="px-4 py-3 max-w-xs sm:max-w-md">
                      <div className="font-medium text-slate-900 line-clamp-1">{incident.title}</div>
                      <div className="flex items-center gap-1 text-slate-500 text-[11px] mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span>{incident.location}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      <div>{incident.department}</div>
                      <div className="text-[10px] text-slate-400">{incident.category}</div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={incident.status} />
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <SLATimer 
                        deadlineIso={incident.slaDeadline}
                        isResolved={incident.status === 'RESOLVED'}
                        slaMet={incident.resolution?.slaMet}
                      />
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                      {incident.assignedResponderName ? (
                        <div>
                          <div className="font-medium">{incident.assignedResponderName}</div>
                          <div className="text-[10px] text-slate-400">{incident.assignedResponderRole}</div>
                        </div>
                      ) : (
                        <span className="text-amber-700 italic text-[11px]">Unassigned</span>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => onSelectIncident(incident)}
                          className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                          title="View Full Incident File"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {(incident.status === 'REPORTED' || incident.status === 'TRIAGED') && (
                          <button
                            onClick={() => onOpenDispatch(incident)}
                            className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded text-[11px] font-medium"
                            title="Dispatch Responder"
                          >
                            <Send className="w-3 h-3" />
                            <span>Dispatch</span>
                          </button>
                        )}

                        {incident.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => onOpenResolve(incident)}
                            className="inline-flex items-center space-x-1 px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-medium"
                            title="Resolve & Close"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>Resolve</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
