import { Incident, IncidentStatus, ResolutionData, AuditLogEntry, Responder } from '../types';

export interface TransitionValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates whether an incident can transition from its current status to a target status
 * based on clinical operations guard rules.
 */
export function validateStatusTransition(
  incident: Incident,
  targetStatus: IncidentStatus,
  context?: {
    responderId?: string;
    resolution?: Partial<ResolutionData>;
    escalationReason?: string;
  }
): TransitionValidationResult {
  if (incident.status === targetStatus) {
    return { valid: false, error: `Incident is already in status ${targetStatus}` };
  }

  // Once resolved, state is locked to preserve regulatory audit integrity
  if (incident.status === 'RESOLVED') {
    return { valid: false, error: 'Resolved incidents cannot change status without administrative reopening.' };
  }

  switch (targetStatus) {
    case 'TRIAGED':
      if (incident.status !== 'REPORTED') {
        return { valid: false, error: 'Only newly reported incidents can be marked as triaged.' };
      }
      return { valid: true };

    case 'DISPATCHED':
      if (!context?.responderId) {
        return { valid: false, error: 'Dispatch requires assigning a qualified on-duty responder.' };
      }
      return { valid: true };

    case 'IN_PROGRESS':
      if (incident.status !== 'DISPATCHED' && incident.status !== 'ESCALATED') {
        return { valid: false, error: 'Incident must be dispatched before work can be marked in progress.' };
      }
      return { valid: true };

    case 'RESOLVED':
      if (incident.status !== 'IN_PROGRESS' && incident.status !== 'DISPATCHED') {
        return { valid: false, error: 'Incident must be actively investigated before marking as resolved.' };
      }
      if (!context?.resolution?.correctiveAction || context.resolution.correctiveAction.trim().length < 10) {
        return { valid: false, error: 'Resolution requires detailed corrective action notes (minimum 10 characters).' };
      }
      if (!context?.resolution?.verifiedBy || context.resolution.verifiedBy.trim().length < 2) {
        return { valid: false, error: 'Resolution requires verified clinical responder sign-off.' };
      }
      if (!context?.resolution?.rootCause) {
        return { valid: false, error: 'A root cause classification is mandatory for compliance reporting.' };
      }
      return { valid: true };

    case 'ESCALATED':
      if (!context?.escalationReason || context.escalationReason.trim().length < 5) {
        return { valid: false, error: 'Clinical escalation requires a documented justification.' };
      }
      return { valid: true };

    default:
      return { valid: true };
  }
}

/**
 * Creates an immutable audit log entry for any state change or operational action.
 */
export function createAuditLog(
  actor: string,
  action: string,
  previousStatus?: IncidentStatus,
  newStatus?: IncidentStatus,
  notes?: string
): AuditLogEntry {
  return {
    id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    actor,
    action,
    previousStatus,
    newStatus,
    notes
  };
}
