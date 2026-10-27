import React, { useState, useId } from 'react';
import { X, Calculator, AlertCircle, Info, ShieldAlert } from 'lucide-react';
import { Department, IncidentCategory, Incident, Priority } from '../../types';
import { computeTriageScore } from '../../services/triageEngine';
import { createAuditLog } from '../../services/stateMachine';
import { PriorityBadge } from '../common/PriorityBadge';

interface NewIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newIncident: Incident) => void;
}

const DEPARTMENTS: Department[] = [
  'Emergency (ED)',
  'Intensive Care (ICU)',
  'Operating Theatres (OR)',
  'General Ward',
  'Pediatrics',
  'Biomedical Engineering',
  'Facilities & Safety'
];

const CATEGORIES: IncidentCategory[] = [
  'Clinical Deterioration',
  'Medical Equipment Failure',
  'Medication Safety',
  'Patient Fall / Injury',
  'Hazardous Spill / Infection',
  'Facility Failure'
];

export const NewIncidentModal: React.FC<NewIncidentModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState<Department>('Emergency (ED)');
  const [location, setLocation] = useState('');
  const [reporterName, setReporterName] = useState('Staff Nurse / Duty Officer');
  const [reporterRole, setReporterRole] = useState('Staff Nurse');
  const [reporterContact, setReporterContact] = useState('Ext. 1102');
  const [category, setCategory] = useState<IncidentCategory>('Clinical Deterioration');

  // Algorithmic Triage Input parameters
  const [vitalInstability, setVitalInstability] = useState(false);
  const [consciousAltered, setConsciousAltered] = useState(false);
  const [lifeThreateningHazard, setLifeThreateningHazard] = useState(false);
  const [equipmentCriticality, setEquipmentCriticality] = useState<'none' | 'auxiliary' | 'life_support'>('none');

  // Manual priority override toggle
  const [manualOverride, setManualOverride] = useState(false);
  const [manualPriority, setManualPriority] = useState<Priority>('P2');
  const [overrideReason, setOverrideReason] = useState('');

  // Validation error state
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real-time calculated triage assessment
  const computedAssessment = computeTriageScore({
    vitalInstability,
    consciousAltered,
    lifeThreateningHazard,
    equipmentCriticality,
    department,
    category
  });

  const finalPriority = manualOverride ? manualPriority : computedAssessment.priority;
  const finalSlaMinutes = manualOverride 
    ? (manualPriority === 'P1' ? 15 : manualPriority === 'P2' ? 60 : manualPriority === 'P3' ? 240 : 1440)
    : computedAssessment.recommendedSlaMinutes;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (title.trim().length < 5) {
      setError('Please provide a specific incident title (minimum 5 characters).');
      return;
    }
    if (description.trim().length < 10) {
      setError('Please provide detailed incident notes for clinical responders (minimum 10 characters).');
      return;
    }
    if (!location.trim()) {
      setError('Bed, room, or ward location is required for emergency dispatch.');
      return;
    }
    if (manualOverride && overrideReason.trim().length < 5) {
      setError('A documented clinical justification is required when overriding algorithmic triage.');
      return;
    }

    const now = new Date();
    const newId = `INC-${now.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const slaDeadline = new Date(now.getTime() + finalSlaMinutes * 60000).toISOString();

    const initialAudit = createAuditLog(
      reporterName,
      'Incident Intake & Automated Triage Assessment',
      undefined,
      'REPORTED',
      manualOverride
        ? `Manual clinical override to ${manualPriority}. Justification: ${overrideReason}`
        : `Algorithmic score ${computedAssessment.calculatedScore}/10 assigned ${computedAssessment.priority}`
    );

    const newIncident: Incident = {
      id: newId,
      title: title.trim(),
      description: description.trim(),
      department,
      location: location.trim(),
      reporterName: reporterName.trim(),
      reporterRole: reporterRole.trim(),
      reporterContact: reporterContact.trim(),
      category,
      priority: finalPriority,
      status: 'REPORTED',
      reportedAt: now.toISOString(),
      slaMinutes: finalSlaMinutes,
      slaDeadline,
      triageAssessment: {
        ...computedAssessment,
        priority: finalPriority,
        recommendedSlaMinutes: finalSlaMinutes,
        clinicalRationale: manualOverride
          ? `Clinical Override: ${overrideReason} (Computed Baseline: ${computedAssessment.clinicalRationale})`
          : computedAssessment.clinicalRationale
      },
      auditTrail: [initialAudit]
    };

    onSubmit(newIncident);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-none flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-lg border border-slate-300 shadow-xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-base font-semibold">Report & Triage Clinical Incident</h2>
              <p className="text-xs text-slate-300">Enter incident details and clinical parameters for priority scoring</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 text-sm text-slate-800">
          {error && (
            <div className="p-3 bg-red-50 border border-red-300 rounded text-red-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Incident Overview */}
          <div className="space-y-3">
            <h3 className="font-semibold text-xs text-slate-500 uppercase tracking-wider">1. Core Incident Information</h3>
            
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Incident Headline *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Infusion Pump Occlusion in Bed 6 / Post-op Arrhythmia"
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Department *</label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value as Department)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-white"
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Specific Location / Bed ID *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. ICU Bay 2, Room 314"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Incident Category *</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as IncidentCategory)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-white"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Reporter Name & Role</label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={e => setReporterName(e.target.value)}
                  placeholder="e.g. Staff Nurse Angela Wu"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Clinical Observation & Description *</label>
              <textarea
                required
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe current patient condition, vitals anomaly, device alarms, or environmental risk..."
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
          </div>

          {/* Section 2: Algorithmic Triage Engine */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Calculator className="w-4 h-4 text-blue-700" />
                <h3 className="font-semibold text-xs text-slate-800 uppercase tracking-wider">
                  2. Algorithmic Triage Scoring (Manchester / ESI)
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">Dynamic Rule Evaluation</span>
            </div>

            <div className="space-y-2">
              <label className="flex items-start space-x-2 cursor-pointer p-2 rounded hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors">
                <input
                  type="checkbox"
                  checked={lifeThreateningHazard}
                  onChange={e => setLifeThreateningHazard(e.target.checked)}
                  className="mt-1 h-4 w-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                />
                <div className="text-xs">
                  <span className="font-semibold text-red-800">Life-Threatening Emergency / Active Arrest</span>
                  <p className="text-slate-500">Unresponsive patient, airway collapse, severe hemorrhage, or immediate hazardous hazard.</p>
                </div>
              </label>

              <label className="flex items-start space-x-2 cursor-pointer p-2 rounded hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors">
                <input
                  type="checkbox"
                  checked={vitalInstability}
                  onChange={e => setVitalInstability(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <div className="text-xs">
                  <span className="font-medium text-slate-800">Physiological Instability (Vitals Compromise)</span>
                  <p className="text-slate-500">SpO2 &lt; 90%, SBP &lt; 90 mmHg, HR &gt; 130 or &lt; 40, severe acute respiratory distress.</p>
                </div>
              </label>

              <label className="flex items-start space-x-2 cursor-pointer p-2 rounded hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors">
                <input
                  type="checkbox"
                  checked={consciousAltered}
                  onChange={e => setConsciousAltered(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <div className="text-xs">
                  <span className="font-medium text-slate-800">Acute Altered Mental Status</span>
                  <p className="text-slate-500">Sudden confusion, lethargy, Glasgow Coma Scale (GCS) drop &gt; 2 points.</p>
                </div>
              </label>

              <div className="pt-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Equipment Criticality Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'none', label: 'None / Non-Medical' },
                    { id: 'auxiliary', label: 'Auxiliary (IV Pump / Screen)' },
                    { id: 'life_support', label: 'Life-Support (Ventilator / Defib)' }
                  ].map(lvl => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setEquipmentCriticality(lvl.id as any)}
                      className={`px-2 py-1.5 rounded text-xs font-medium border text-left transition-colors ${
                        equipmentCriticality === lvl.id
                          ? 'bg-blue-50 border-blue-600 text-blue-900 font-semibold'
                          : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Computed Triage Output Banner */}
            <div className="mt-3 p-3 bg-white border border-slate-300 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-700">Calculated Triage:</span>
                  <PriorityBadge priority={computedAssessment.priority} />
                  <span className="text-xs font-mono text-slate-600">SLA: {computedAssessment.recommendedSlaMinutes}m</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{computedAssessment.clinicalRationale}</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400">Severity Score:</span>
                <div className="text-sm font-bold font-mono text-slate-800">{computedAssessment.calculatedScore} / 10</div>
              </div>
            </div>

            {/* Optional Manual Override Accordion */}
            <div className="pt-1">
              <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={manualOverride}
                  onChange={e => setManualOverride(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Override algorithmic priority (requires clinical justification)</span>
              </label>

              {manualOverride && (
                <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-amber-900">Override Priority:</span>
                    {(['P1', 'P2', 'P3', 'P4'] as Priority[]).map(p => (
                      <label key={p} className="inline-flex items-center space-x-1 cursor-pointer">
                        <input
                          type="radio"
                          name="overridePriority"
                          value={p}
                          checked={manualPriority === p}
                          onChange={() => setManualPriority(p)}
                        />
                        <span className="font-mono">{p}</span>
                      </label>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={overrideReason}
                    onChange={e => setOverrideReason(e.target.value)}
                    placeholder="Enter senior clinician justification for overriding algorithmic score..."
                    className="w-full px-2.5 py-1.5 border border-amber-300 rounded bg-white text-xs focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer Submit */}
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
              className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-medium shadow-sm transition-colors"
            >
              Commit & Dispatch Intake
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
