export type Priority = 'P1' | 'P2' | 'P3' | 'P4';

export type IncidentStatus = 
  | 'REPORTED' 
  | 'TRIAGED' 
  | 'DISPATCHED' 
  | 'IN_PROGRESS' 
  | 'RESOLVED' 
  | 'ESCALATED';

export type Department = 
  | 'Emergency (ED)'
  | 'Intensive Care (ICU)'
  | 'Operating Theatres (OR)'
  | 'General Ward'
  | 'Pediatrics'
  | 'Biomedical Engineering'
  | 'Facilities & Safety';

export type IncidentCategory = 
  | 'Clinical Deterioration'
  | 'Medical Equipment Failure'
  | 'Medication Safety'
  | 'Patient Fall / Injury'
  | 'Hazardous Spill / Infection'
  | 'Facility Failure';

export interface TriageAssessment {
  vitalInstability: boolean;      // Airway/breathing/circulatory compromise
  consciousAltered: boolean;      // GCS drop or acute confusion
  lifeThreateningHazard: boolean; // Direct threat to life or safety
  equipmentCriticality: 'none' | 'auxiliary' | 'life_support';
  calculatedScore: number;        // Numerical algorithmic index (1-10)
  priority: Priority;
  recommendedSlaMinutes: number;
  clinicalRationale: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  previousStatus?: IncidentStatus;
  newStatus?: IncidentStatus;
  notes?: string;
}

export interface ResolutionData {
  rootCause: 'Equipment Wear' | 'Human Protocol Error' | 'Clinical Complication' | 'External Infrastructure Failure' | 'Supply Shortage';
  correctiveAction: string;
  verifiedBy: string;
  verifiedRole: string;
  resolvedAt: string;
  timeToResolveMinutes: number;
  slaMet: boolean;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  department: Department;
  location: string;             // e.g., "ICU Bed 04", "ER Bay 2", "Ward 3B Room 12"
  reporterName: string;
  reporterRole: string;
  reporterContact: string;
  category: IncidentCategory;
  priority: Priority;
  status: IncidentStatus;
  reportedAt: string;
  slaMinutes: number;
  slaDeadline: string;          // ISO string
  triageAssessment: TriageAssessment;
  assignedResponderId?: string;
  assignedResponderName?: string;
  assignedResponderRole?: string;
  dispatchedAt?: string;
  resolution?: ResolutionData;
  escalationReason?: string;
  auditTrail: AuditLogEntry[];
}

export interface Responder {
  id: string;
  name: string;
  role: string;
  department: Department;
  phone: string;
  status: 'AVAILABLE' | 'ON_CALL' | 'ENGAGED' | 'OFF_DUTY';
  activeIncidentCount: number;
  specialization: string;
}

export interface ShiftHandoverReport {
  shiftId: string;
  shiftName: 'Morning (07:00 - 15:30)' | 'Evening (15:00 - 23:30)' | 'Night (23:00 - 07:30)';
  generatedAt: string;
  outgoingOfficer: string;
  incomingOfficer: string;
  activeP1Count: number;
  activeP2Count: number;
  totalPendingCount: number;
  breachedSlaCount: number;
  resolvedTodayCount: number;
  sbarSituation: string;
  sbarBackground: string;
  sbarAssessment: string;
  sbarRecommendation: string;
  unresolvedIncidents: Incident[];
}

export interface IncidentFilters {
  searchQuery: string;
  status: string; // 'ALL' or IncidentStatus
  priority: string; // 'ALL' or Priority
  department: string; // 'ALL' or Department
  category: string; // 'ALL' or IncidentCategory
  slaBreachedOnly: boolean;
}
