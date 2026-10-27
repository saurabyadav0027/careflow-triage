import React, { useState } from 'react';
import { Responder, Department } from '../../types';
import { Users, Phone, ShieldCheck, AlertCircle, PlusCircle, UserCheck } from 'lucide-react';

interface ResponderListProps {
  responders: Responder[];
  onUpdateResponderStatus: (responderId: string, newStatus: Responder['status']) => void;
  onAddResponder: (newResponder: Responder) => void;
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

export const ResponderList: React.FC<ResponderListProps> = ({
  responders,
  onUpdateResponderStatus,
  onAddResponder
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState<Department>('Emergency (ED)');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;

    const newResp: Responder = {
      id: `RESP-0${responders.length + 1}`,
      name: name.trim(),
      role: role.trim(),
      department,
      phone: phone.trim() || '+1 (555) 019-0000',
      status: 'AVAILABLE',
      activeIncidentCount: 0,
      specialization: specialization.trim() || 'General Clinical Triage'
    };

    onAddResponder(newResp);
    setShowAddModal(false);
    setName('');
    setRole('');
    setPhone('');
    setSpecialization('');
  };

  return (
    <div className="space-y-4">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">On-Duty Clinical & Technical Responders</h2>
          <p className="text-xs text-slate-500">Live operational roster and active incident caseload distribution</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-medium shadow-sm transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register Responder</span>
        </button>
      </div>

      {/* Grid of Responders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {responders.map(resp => {
          const isHighCaseload = resp.activeIncidentCount >= 2;
          return (
            <div
              key={resp.id}
              className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[11px] text-slate-400">{resp.id}</span>
                    <h3 className="font-bold text-slate-900 text-sm">{resp.name}</h3>
                    <p className="text-xs text-slate-600 font-medium">{resp.role}</p>
                    <p className="text-[11px] text-slate-500">{resp.department}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    resp.status === 'AVAILABLE'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : resp.status === 'ENGAGED'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {resp.status}
                  </span>
                </div>

                <div className="mt-3 text-xs bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1">
                  <div className="text-slate-500 text-[11px]">Specialization:</div>
                  <div className="font-medium text-slate-800">{resp.specialization}</div>
                  <div className="flex items-center space-x-1 text-slate-600 text-[11px] pt-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{resp.phone}</span>
                  </div>
                </div>
              </div>

              {/* Caseload and status toggle */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 text-[11px]">Active Caseload: </span>
                  <span className={`font-mono font-bold ${isHighCaseload ? 'text-amber-700' : 'text-slate-800'}`}>
                    {resp.activeIncidentCount} {resp.activeIncidentCount === 1 ? 'case' : 'cases'}
                  </span>
                </div>

                <select
                  value={resp.status}
                  onChange={e => onUpdateResponderStatus(resp.id, e.target.value as any)}
                  className="px-2 py-1 border border-slate-200 rounded text-[11px] bg-white text-slate-700 focus:outline-none"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="ENGAGED">Engaged</option>
                  <option value="ON_CALL">On-Call</option>
                  <option value="OFF_DUTY">Off-Duty</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Responder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-300 shadow-xl max-w-md w-full p-5 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Register Staff Responder</h3>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Full Name & Credentials *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Dr. Jennifer Wu, MD"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Role Title *</label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  placeholder="e.g. Trauma Surgeon / Clinical Specialist"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Home Department</label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value as Department)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white focus:outline-none"
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Contact Phone / Extension</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-XXXX"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Clinical Specialization</label>
                <input
                  type="text"
                  value={specialization}
                  onChange={e => setSpecialization(e.target.value)}
                  placeholder="e.g. Airway Management, Hemodynamics, Hazmat"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-700 text-white rounded font-medium hover:bg-blue-800"
                >
                  Save Responder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
