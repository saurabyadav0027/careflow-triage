import React, { useState } from 'react';
import { Incident } from '../../types';
import { generateShiftHandover, formatHandoverMarkdown } from '../../services/handoverService';
import { 
  FileSpreadsheet, 
  Copy, 
  Printer, 
  Check, 
  Download, 
  AlertTriangle, 
  RefreshCw,
  FileCheck
} from 'lucide-react';
import { PriorityBadge } from '../common/PriorityBadge';
import { SLATimer } from '../common/SLATimer';

interface ShiftHandoverProps {
  incidents: Incident[];
  onShowToast: (message: string) => void;
}

export const ShiftHandover: React.FC<ShiftHandoverProps> = ({
  incidents,
  onShowToast
}) => {
  const [shiftType, setShiftType] = useState<'Morning (07:00 - 15:30)' | 'Evening (15:00 - 23:30)' | 'Night (23:00 - 07:30)'>('Evening (15:00 - 23:30)');
  const [outgoingOfficer, setOutgoingOfficer] = useState('Dr. Sarah Lin (Duty Medical Officer)');
  const [incomingOfficer, setIncomingOfficer] = useState('Dr. Robert Vance (Incoming Registrar)');
  const [copied, setCopied] = useState(false);

  // Generate current handover report
  const report = generateShiftHandover(incidents, outgoingOfficer, incomingOfficer, shiftType);

  const handleCopyMarkdown = () => {
    const md = formatHandoverMarkdown(report);
    navigator.clipboard.writeText(md).then(() => {
      setCopied(true);
      onShowToast('SBAR Handover report copied to clipboard in Markdown format');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const md = formatHandoverMarkdown(report);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SBAR-Shift-Handover-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Handover report file downloaded');
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Clinical Shift Handover Protocol (SBAR)</h2>
          <p className="text-xs text-slate-500">
            Standardized Situation-Background-Assessment-Recommendation transition summary for hospital duty changeovers
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyMarkdown}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium shadow-xs transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copied ? 'Copied' : 'Copy SBAR'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Download .MD</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-medium shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Configuration Strip */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block font-medium text-slate-700 mb-1">Shift Cycle</label>
          <select
            value={shiftType}
            onChange={e => setShiftType(e.target.value as any)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white focus:outline-none"
          >
            <option value="Morning (07:00 - 15:30)">Morning (07:00 - 15:30)</option>
            <option value="Evening (15:00 - 23:30)">Evening (15:00 - 23:30)</option>
            <option value="Night (23:00 - 07:30)">Night (23:00 - 07:30)</option>
          </select>
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">Outgoing Duty Lead</label>
          <input
            type="text"
            value={outgoingOfficer}
            onChange={e => setOutgoingOfficer(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">Incoming Duty Lead</label>
          <input
            type="text"
            value={incomingOfficer}
            onChange={e => setIncomingOfficer(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none"
          />
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-slate-500 font-medium">Pending Incidents</span>
          <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">{report.totalPendingCount}</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-red-700 font-medium">Critical P1 Active</span>
          <div className="text-lg font-bold font-mono text-red-700 mt-0.5">{report.activeP1Count}</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-amber-700 font-medium">Urgent P2 Active</span>
          <div className="text-lg font-bold font-mono text-amber-700 mt-0.5">{report.activeP2Count}</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-slate-700 font-medium">SLA Breaches</span>
          <div className="text-lg font-bold font-mono text-rose-800 mt-0.5">{report.breachedSlaCount}</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-emerald-700 font-medium">Resolved on Shift</span>
          <div className="text-lg font-bold font-mono text-emerald-800 mt-0.5">{report.resolvedTodayCount}</div>
        </div>
      </div>

      {/* Formal SBAR Document Container */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-sm overflow-hidden text-xs print:border-none">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-sm">Official Clinical SBAR Handover Document</h3>
              <p className="text-[11px] text-slate-300">Generated: {new Date(report.generatedAt).toLocaleString()} &bull; ID: {report.shiftId}</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[11px]">
            ISO-9001 / JCI Audit Grade
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* S - Situation */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center font-mono text-xs">S</span>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">1. SITUATION</h4>
            </div>
            <div className="pl-8 text-slate-700 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">
              {report.sbarSituation}
            </div>
          </div>

          {/* B - Background */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 font-bold flex items-center justify-center font-mono text-xs">B</span>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">2. BACKGROUND</h4>
            </div>
            <div className="pl-8 text-slate-700 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">
              {report.sbarBackground}
            </div>
          </div>

          {/* A - Assessment */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center font-mono text-xs">A</span>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">3. ASSESSMENT & OPEN INCIDENTS</h4>
            </div>
            <div className="pl-8 space-y-2">
              <div className="text-slate-700 whitespace-pre-line bg-slate-50 p-3 rounded border border-slate-200 font-mono text-[11px] leading-relaxed">
                {report.sbarAssessment}
              </div>

              {/* Table of Open Incidents */}
              {report.unresolvedIncidents.length > 0 && (
                <div className="mt-3 border border-slate-200 rounded overflow-hidden">
                  <table className="min-w-full divide-y divide-slate-200 text-left">
                    <thead className="bg-slate-100 text-[10px] uppercase font-semibold text-slate-600">
                      <tr>
                        <th className="px-3 py-2">Priority & ID</th>
                        <th className="px-3 py-2">Department & Location</th>
                        <th className="px-3 py-2">Incident Title</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Assigned Staff</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {report.unresolvedIncidents.map(inc => (
                        <tr key={inc.id} className="text-[11px]">
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className="font-mono font-semibold">{inc.id}</span> ({inc.priority})
                          </td>
                          <td className="px-3 py-2 text-slate-600">{inc.department} - {inc.location}</td>
                          <td className="px-3 py-2 font-medium text-slate-900">{inc.title}</td>
                          <td className="px-3 py-2">{inc.status}</td>
                          <td className="px-3 py-2 text-slate-600">{inc.assignedResponderName || 'Unassigned'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* R - Recommendation */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center font-mono text-xs">R</span>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">4. RECOMMENDATIONS FOR INCOMING SHIFT</h4>
            </div>
            <div className="pl-8 text-slate-700 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">
              {report.sbarRecommendation}
            </div>
          </div>

          {/* Verification Sign-Off Footer */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-8 text-[11px] text-slate-600">
            <div>
              <div className="font-semibold text-slate-800 mb-4">Outgoing Duty Officer Signature:</div>
              <div className="border-b border-slate-400 pb-1 font-mono">{outgoingOfficer}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Date / Time Acknowledged</div>
            </div>
            <div>
              <div className="font-semibold text-slate-800 mb-4">Incoming Duty Officer Signature:</div>
              <div className="border-b border-slate-400 pb-1 font-mono">{incomingOfficer}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Date / Time Received</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
