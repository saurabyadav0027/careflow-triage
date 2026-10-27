import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  RotateCcw, 
  Download, 
  Upload, 
  PlusCircle, 
  AlertOctagon, 
  Clock
} from 'lucide-react';
import { Incident } from '../../types';
import { getSlaRemainingMinutes } from '../../services/triageEngine';

interface HeaderProps {
  incidents: Incident[];
  onOpenNewIncident: () => void;
  onResetData: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Header: React.FC<HeaderProps> = ({
  incidents,
  onOpenNewIncident,
  onResetData,
  onExportData,
  onImportData
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) +
        ' | ' +
        now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeP1Count = incidents.filter(i => i.status !== 'RESOLVED' && i.priority === 'P1').length;
  const activeUnresolved = incidents.filter(i => i.status !== 'RESOLVED').length;
  const breachedCount = incidents.filter(
    i => i.status !== 'RESOLVED' && getSlaRemainingMinutes(i.slaDeadline) < 0
  ).length;

  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Facility Identification */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded text-white flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">CareFlow</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  v1.2 Operations Hub
                </span>
              </div>
              <p className="text-xs text-slate-400">St. Jude Regional Medical Center &bull; Emergency Triage Dispatch</p>
            </div>
          </div>

          {/* Center: Live Operational Status Tickers */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded bg-slate-800/80 border border-slate-700 text-xs">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono text-slate-300">{currentTime}</span>
            </div>

            {/* Critical P1 Counter */}
            <div className={`flex items-center space-x-1.5 px-3 py-1 rounded border text-xs font-medium ${
              activeP1Count > 0 
                ? 'bg-red-950/80 text-red-200 border-red-800 animate-pulse' 
                : 'bg-slate-800/80 text-slate-400 border-slate-700'
            }`}>
              <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
              <span>{activeP1Count} Active P1</span>
            </div>

            {/* SLA Breaches Counter */}
            {breachedCount > 0 && (
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded bg-amber-950/80 text-amber-200 border border-amber-800 text-xs font-medium">
                <span>{breachedCount} SLA Breached</span>
              </div>
            )}

            <div className="text-xs text-slate-400">
              <span className="font-semibold text-white">{activeUnresolved}</span> open / <span className="font-semibold text-white">{incidents.length}</span> total
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenNewIncident}
              className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-2 rounded shadow transition-colors"
              title="Report & Triage New Incident"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Report Incident</span>
            </button>

            <button
              onClick={onExportData}
              className="inline-flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs px-2.5 py-2 rounded transition-colors"
              title="Export state to JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Export</span>
            </button>

            <label className="inline-flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs px-2.5 py-2 rounded transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Import</span>
              <input 
                type="file" 
                accept=".json" 
                onChange={onImportData} 
                className="hidden" 
              />
            </label>

            <button
              onClick={onResetData}
              className="inline-flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs px-2.5 py-2 rounded transition-colors"
              title="Reset data to initial hospital seed cases"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset Demo</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
