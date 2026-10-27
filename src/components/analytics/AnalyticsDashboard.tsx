import React from 'react';
import { Incident } from '../../types';
import { getSlaRemainingMinutes } from '../../services/triageEngine';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  ShieldCheck,
  Building2
} from 'lucide-react';

interface AnalyticsDashboardProps {
  incidents: Incident[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ incidents }) => {
  const resolved = incidents.filter(i => i.status === 'RESOLVED');
  const unresolved = incidents.filter(i => i.status !== 'RESOLVED');

  // SLA calculations
  const totalWithSlaData = resolved.length;
  const resolvedWithinSla = resolved.filter(i => i.resolution?.slaMet).length;
  const slaCompliancePct = totalWithSlaData > 0 
    ? Math.round((resolvedWithinSla / totalWithSlaData) * 100) 
    : 100;

  const currentBreaches = unresolved.filter(i => getSlaRemainingMinutes(i.slaDeadline) < 0).length;

  // Average time to resolve
  const avgResolveMinutes = resolved.length > 0
    ? Math.round(resolved.reduce((acc, curr) => acc + (curr.resolution?.timeToResolveMinutes || 0), 0) / resolved.length)
    : 0;

  // Priority distribution
  const priorityCounts = {
    P1: incidents.filter(i => i.priority === 'P1').length,
    P2: incidents.filter(i => i.priority === 'P2').length,
    P3: incidents.filter(i => i.priority === 'P3').length,
    P4: incidents.filter(i => i.priority === 'P4').length,
  };

  // Department distribution
  const departments = [
    'Emergency (ED)',
    'Intensive Care (ICU)',
    'Operating Theatres (OR)',
    'General Ward',
    'Pediatrics',
    'Biomedical Engineering',
    'Facilities & Safety'
  ];

  const deptCounts = departments.map(d => ({
    name: d,
    count: incidents.filter(i => i.department === d).length
  })).sort((a, b) => b.count - a.count);

  // Root cause distribution
  const rootCauses: Record<string, number> = {};
  resolved.forEach(r => {
    if (r.resolution?.rootCause) {
      rootCauses[r.resolution.rootCause] = (rootCauses[r.resolution.rootCause] || 0) + 1;
    }
  });

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div>
        <h2 className="text-base font-bold text-slate-900 tracking-tight">Clinical Quality & SLA Performance Analytics</h2>
        <p className="text-xs text-slate-500">
          Institutional metrics for emergency response turnaround, clinical SLA compliance, and root-cause trends
        </p>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SLA Compliance */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">SLA Compliance Rate</span>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{slaCompliancePct}%</div>
            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
              {resolvedWithinSla} of {totalWithSlaData} resolved in SLA
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Avg Turnaround Time */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Avg Resolution Turnaround</span>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{avgResolveMinutes}m</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Mean time to corrective closure</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Active Breaches */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Active SLA Breaches</span>
            <div className={`text-2xl font-bold font-mono mt-1 ${currentBreaches > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
              {currentBreaches}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Overdue open incidents</p>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            currentBreaches > 0 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Total Case Volume */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Total Incident Volume</span>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{incidents.length}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">{resolved.length} closed &bull; {unresolved.length} active</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Department Caseload Breakdown */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-slate-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Departmental Incident Caseload
            </h3>
          </div>

          <div className="space-y-2.5 pt-2">
            {deptCounts.map(dept => {
              const pct = incidents.length > 0 ? Math.round((dept.count / incidents.length) * 100) : 0;
              return (
                <div key={dept.name} className="text-xs space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span className="font-medium">{dept.name}</span>
                    <span className="font-mono text-slate-500">{dept.count} cases ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded overflow-hidden">
                    <div 
                      className="h-full bg-blue-700 rounded transition-all duration-500" 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority & Severity Distribution */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-slate-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Triage Priority Breakdown
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <span className="text-[11px] font-bold text-red-800">P1 Immediate (&lt;15m)</span>
              <div className="text-xl font-bold font-mono text-red-900 mt-1">{priorityCounts.P1}</div>
              <p className="text-[10px] text-red-700 mt-0.5">Life-support & arrest alarms</p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded">
              <span className="text-[11px] font-bold text-amber-800">P2 Urgent (&lt;1h)</span>
              <div className="text-xl font-bold font-mono text-amber-900 mt-1">{priorityCounts.P2}</div>
              <p className="text-[10px] text-amber-700 mt-0.5">Acute deteriorations & spills</p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <span className="text-[11px] font-bold text-blue-800">P3 Semi-Urgent (&lt;4h)</span>
              <div className="text-xl font-bold font-mono text-blue-900 mt-1">{priorityCounts.P3}</div>
              <p className="text-[10px] text-blue-700 mt-0.5">Device errors & non-vital alerts</p>
            </div>

            <div className="p-3 bg-slate-100 border border-slate-200 rounded">
              <span className="text-[11px] font-bold text-slate-700">P4 Routine (&lt;24h)</span>
              <div className="text-xl font-bold font-mono text-slate-800 mt-1">{priorityCounts.P4}</div>
              <p className="text-[10px] text-slate-600 mt-0.5">Preventive & routine maintenance</p>
            </div>
          </div>

          {/* Root cause analysis */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Verified Root Cause Distribution (Closed Cases)
            </h4>
            {Object.keys(rootCauses).length === 0 ? (
              <p className="text-xs text-slate-400 italic">No resolved root-cause records yet.</p>
            ) : (
              <div className="space-y-1.5">
                {Object.entries(rootCauses).map(([cause, count]) => (
                  <div key={cause} className="flex items-center justify-between text-xs text-slate-700">
                    <span>{cause}</span>
                    <span className="font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {count} {count === 1 ? 'incident' : 'incidents'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
