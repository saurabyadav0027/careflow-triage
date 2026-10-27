import React, { useState, useEffect } from 'react';
import { 
  Incident, 
  Responder, 
  IncidentStatus, 
  ResolutionData 
} from './types';
import { 
  loadIncidents, 
  saveIncidents, 
  loadResponders, 
  saveResponders, 
  resetToSeedData, 
  exportSystemDataToJson, 
  importSystemDataFromJson 
} from './services/storage';
import { createAuditLog, validateStatusTransition } from './services/stateMachine';
import { Header } from './components/layout/Header';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Toast, ToastMessage } from './components/layout/Toast';
import { IncidentList } from './components/incidents/IncidentList';
import { IncidentDetail } from './components/incidents/IncidentDetail';
import { NewIncidentModal } from './components/incidents/NewIncidentModal';
import { DispatchModal } from './components/incidents/DispatchModal';
import { ResolveModal } from './components/incidents/ResolveModal';
import { KanbanBoard } from './components/board/KanbanBoard';
import { ResponderList } from './components/responders/ResponderList';
import { ShiftHandover } from './components/handover/ShiftHandover';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';

export function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [responders, setResponders] = useState<Responder[]>([]);
  const [currentTab, setCurrentTab] = useState<NavTab>('incidents');

  // Modal / Drawer state
  const [isNewIncidentOpen, setIsNewIncidentOpen] = useState(false);
  const [detailIncident, setDetailIncident] = useState<Incident | null>(null);
  const [dispatchIncident, setDispatchIncident] = useState<Incident | null>(null);
  const [resolveIncident, setResolveIncident] = useState<Incident | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `TOAST-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Initial load
  useEffect(() => {
    const loadedInc = loadIncidents();
    const loadedResp = loadResponders();
    setIncidents(loadedInc);
    setResponders(loadedResp);
  }, []);

  // Update Detail view if current incident changes in state
  useEffect(() => {
    if (detailIncident) {
      const refreshed = incidents.find(i => i.id === detailIncident.id);
      if (refreshed) {
        setDetailIncident(refreshed);
      }
    }
  }, [incidents]);

  // Handler: Create new incident
  const handleCreateIncident = (newIncident: Incident) => {
    const updated = [newIncident, ...incidents];
    setIncidents(updated);
    saveIncidents(updated);
    showToast(`Incident ${newIncident.id} registered and triaged as ${newIncident.priority}`, 'success');
  };

  // Handler: Dispatch responder
  const handleConfirmDispatch = (incidentId: string, responder: Responder, notes: string) => {
    const targetIncident = incidents.find(i => i.id === incidentId);
    if (!targetIncident) return;

    const auditEntry = createAuditLog(
      'Clinical Dispatch Hub',
      `Assigned to ${responder.name} (${responder.role})`,
      targetIncident.status,
      'DISPATCHED',
      notes || `Direct operational dispatch to ${responder.name}`
    );

    const updatedIncidents = incidents.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          status: 'DISPATCHED' as IncidentStatus,
          assignedResponderId: responder.id,
          assignedResponderName: responder.name,
          assignedResponderRole: responder.role,
          dispatchedAt: new Date().toISOString(),
          auditTrail: [...inc.auditTrail, auditEntry]
        };
      }
      return inc;
    });

    // Update responder's caseload
    const updatedResponders = responders.map(resp => {
      if (resp.id === responder.id) {
        return {
          ...resp,
          activeIncidentCount: resp.activeIncidentCount + 1,
          status: 'ENGAGED' as const
        };
      }
      return resp;
    });

    setIncidents(updatedIncidents);
    saveIncidents(updatedIncidents);
    setResponders(updatedResponders);
    saveResponders(updatedResponders);

    showToast(`Incident ${incidentId} dispatched to ${responder.name}`, 'success');
  };

  // Handler: Resolve incident
  const handleConfirmResolve = (incidentId: string, resolution: ResolutionData) => {
    const targetIncident = incidents.find(i => i.id === incidentId);
    if (!targetIncident) return;

    const auditEntry = createAuditLog(
      resolution.verifiedBy,
      'Incident Resolved & Root Cause Signed Off',
      targetIncident.status,
      'RESOLVED',
      `RCA: ${resolution.rootCause}. Action: ${resolution.correctiveAction}`
    );

    const updatedIncidents = incidents.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          status: 'RESOLVED' as IncidentStatus,
          resolution,
          auditTrail: [...inc.auditTrail, auditEntry]
        };
      }
      return inc;
    });

    // Decrement assigned responder's caseload
    let updatedResponders = responders;
    if (targetIncident.assignedResponderId) {
      updatedResponders = responders.map(resp => {
        if (resp.id === targetIncident.assignedResponderId) {
          const newCount = Math.max(0, resp.activeIncidentCount - 1);
          return {
            ...resp,
            activeIncidentCount: newCount,
            status: newCount === 0 ? ('AVAILABLE' as const) : ('ENGAGED' as const)
          };
        }
        return resp;
      });
      setResponders(updatedResponders);
      saveResponders(updatedResponders);
    }

    setIncidents(updatedIncidents);
    saveIncidents(updatedIncidents);

    showToast(`Incident ${incidentId} formally resolved and signed off`, 'success');
  };

  // Handler: Generic status update (e.g. IN_PROGRESS)
  const handleUpdateStatus = (incidentId: string, newStatus: IncidentStatus, notes: string) => {
    const target = incidents.find(i => i.id === incidentId);
    if (!target) return;

    const validation = validateStatusTransition(target, newStatus);
    if (!validation.valid) {
      showToast(validation.error || 'Invalid transition', 'error');
      return;
    }

    const auditEntry = createAuditLog(
      target.assignedResponderName || 'Clinical Coordinator',
      `Status changed to ${newStatus}`,
      target.status,
      newStatus,
      notes
    );

    const updated = incidents.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          status: newStatus,
          auditTrail: [...inc.auditTrail, auditEntry]
        };
      }
      return inc;
    });

    setIncidents(updated);
    saveIncidents(updated);
    showToast(`Incident ${incidentId} marked as ${newStatus}`, 'info');
  };

  // Handler: Escalate incident
  const handleEscalate = (incidentId: string, reason: string) => {
    const target = incidents.find(i => i.id === incidentId);
    if (!target) return;

    const auditEntry = createAuditLog(
      'Senior Clinical Specialist',
      'Clinical Escalation Activated',
      target.status,
      'ESCALATED',
      `Escalation justification: ${reason}`
    );

    const updated = incidents.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          status: 'ESCALATED' as IncidentStatus,
          priority: 'P1' as const, // Escalation elevates to P1
          escalationReason: reason,
          auditTrail: [...inc.auditTrail, auditEntry]
        };
      }
      return inc;
    });

    setIncidents(updated);
    saveIncidents(updated);
    showToast(`Incident ${incidentId} escalated to Emergency P1 status`, 'error');
  };

  // Handler: Update responder status
  const handleUpdateResponderStatus = (responderId: string, newStatus: Responder['status']) => {
    const updated = responders.map(r => {
      if (r.id === responderId) {
        return { ...r, status: newStatus };
      }
      return r;
    });
    setResponders(updated);
    saveResponders(updated);
    showToast(`Responder status updated to ${newStatus}`, 'info');
  };

  // Handler: Add new responder
  const handleAddResponder = (newResp: Responder) => {
    const updated = [...responders, newResp];
    setResponders(updated);
    saveResponders(updated);
    showToast(`Responder ${newResp.name} added to duty roster`, 'success');
  };

  // Handler: Reset demo seed data
  const handleResetData = () => {
    const { incidents: seedInc, responders: seedResp } = resetToSeedData();
    setIncidents(seedInc);
    setResponders(seedResp);
    setDetailIncident(null);
    showToast('Application state reset to standard hospital clinical seed data', 'info');
  };

  // Handler: Export JSON
  const handleExportData = () => {
    exportSystemDataToJson(incidents, responders);
    showToast('System operational state exported to JSON file', 'success');
  };

  // Handler: Import JSON
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const imported = importSystemDataFromJson(content);
      if (imported) {
        setIncidents(imported.incidents);
        setResponders(imported.responders);
        showToast('System state successfully restored from imported file', 'success');
      } else {
        showToast('Invalid backup file structure. Import aborted.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const activeP1Count = incidents.filter(i => i.status !== 'RESOLVED' && i.priority === 'P1').length;
  const unresolvedCount = incidents.filter(i => i.status !== 'RESOLVED').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Institutional Dark Slate Top Bar */}
      <Header
        incidents={incidents}
        onOpenNewIncident={() => setIsNewIncidentOpen(true)}
        onResetData={handleResetData}
        onExportData={handleExportData}
        onImportData={handleImportData}
      />

      {/* Navigation Sub-header Bar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        unresolvedCount={unresolvedCount}
        activeP1Count={activeP1Count}
      />

      {/* Main Work Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'incidents' && (
          <IncidentList
            incidents={incidents}
            responders={responders}
            onSelectIncident={setDetailIncident}
            onOpenDispatch={setDispatchIncident}
            onOpenResolve={setResolveIncident}
            onOpenNewIncident={() => setIsNewIncidentOpen(true)}
          />
        )}

        {currentTab === 'board' && (
          <KanbanBoard
            incidents={incidents}
            responders={responders}
            onSelectIncident={setDetailIncident}
            onOpenDispatch={setDispatchIncident}
            onOpenResolve={setResolveIncident}
            onUpdateStatus={handleUpdateStatus}
            onOpenNewIncident={() => setIsNewIncidentOpen(true)}
          />
        )}

        {currentTab === 'responders' && (
          <ResponderList
            responders={responders}
            onUpdateResponderStatus={handleUpdateResponderStatus}
            onAddResponder={handleAddResponder}
          />
        )}

        {currentTab === 'handover' && (
          <ShiftHandover
            incidents={incidents}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsDashboard
            incidents={incidents}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1">
          <div>
            <strong>CareFlow</strong> &bull; End-Term Clinical Software Engineering Project Submission
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Emergency Triage Protocol Engine &bull; ISO-9001 / JCI Aligned
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <NewIncidentModal
        isOpen={isNewIncidentOpen}
        onClose={() => setIsNewIncidentOpen(false)}
        onSubmit={handleCreateIncident}
      />

      <DispatchModal
        incident={dispatchIncident}
        responders={responders}
        isOpen={!!dispatchIncident}
        onClose={() => setDispatchIncident(null)}
        onConfirmDispatch={handleConfirmDispatch}
      />

      <ResolveModal
        incident={resolveIncident}
        isOpen={!!resolveIncident}
        onClose={() => setResolveIncident(null)}
        onConfirmResolve={handleConfirmResolve}
      />

      <IncidentDetail
        incident={detailIncident}
        responders={responders}
        isOpen={!!detailIncident}
        onClose={() => setDetailIncident(null)}
        onOpenDispatch={(inc) => {
          setDetailIncident(null);
          setDispatchIncident(inc);
        }}
        onOpenResolve={(inc) => {
          setDetailIncident(null);
          setResolveIncident(inc);
        }}
        onUpdateStatus={handleUpdateStatus}
        onEscalate={handleEscalate}
      />

      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
export default App;
