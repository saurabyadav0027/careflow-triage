import { Incident, Responder } from '../types';

export const INITIAL_RESPONDERS: Responder[] = [
  {
    id: 'RESP-01',
    name: 'Dr. Marcus Chen',
    role: 'Consultant Emergency Physician',
    department: 'Emergency (ED)',
    phone: '+1 (555) 019-2831',
    status: 'ENGAGED',
    activeIncidentCount: 2,
    specialization: 'Adult Trauma & Critical Resuscitation'
  },
  {
    id: 'RESP-02',
    name: 'Dr. Alistair Ross',
    role: 'Intensive Care Specialist',
    department: 'Intensive Care (ICU)',
    phone: '+1 (555) 019-4820',
    status: 'ENGAGED',
    activeIncidentCount: 1,
    specialization: 'Mechanical Ventilation & Hemodynamics'
  },
  {
    id: 'RESP-03',
    name: 'Priya Sharma, RN',
    role: 'Clinical Nurse Coordinator',
    department: 'General Ward',
    phone: '+1 (555) 019-7712',
    status: 'AVAILABLE',
    activeIncidentCount: 1,
    specialization: 'Patient Escalation & Code Response'
  },
  {
    id: 'RESP-04',
    name: 'David Kowalski, CBET',
    role: 'Lead Biomedical Engineer',
    department: 'Biomedical Engineering',
    phone: '+1 (555) 019-8903',
    status: 'AVAILABLE',
    activeIncidentCount: 1,
    specialization: 'Life-Support Devices & Calibration'
  },
  {
    id: 'RESP-05',
    name: 'Elena Ramos, RN',
    role: 'Pediatric Charge Nurse',
    department: 'Pediatrics',
    phone: '+1 (555) 019-3341',
    status: 'AVAILABLE',
    activeIncidentCount: 0,
    specialization: 'Neonatal & Pediatric Triage'
  },
  {
    id: 'RESP-06',
    name: 'Walter Briggs',
    role: 'Safety & Hazmat Director',
    department: 'Facilities & Safety',
    phone: '+1 (555) 019-9110',
    status: 'AVAILABLE',
    activeIncidentCount: 0,
    specialization: 'Biohazard Mitigation & Infrastructure'
  }
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-2026-101',
    title: 'Mechanical Ventilator High-Pressure Circuit Alarm Occlusion',
    description: 'Ventilator unit #04 sounding continuous tidal volume occlusion alert. Patient experiencing desaturation down to 88% SpO2 despite 60% FiO2.',
    department: 'Intensive Care (ICU)',
    location: 'ICU Bed 04 (Pod B)',
    reporterName: 'Staff Nurse Angela Wu',
    reporterRole: 'ICU Staff Nurse',
    reporterContact: 'Ext. 4402',
    category: 'Medical Equipment Failure',
    priority: 'P1',
    status: 'IN_PROGRESS',
    reportedAt: new Date(Date.now() - 12 * 60000).toISOString(),
    slaMinutes: 15,
    slaDeadline: new Date(Date.now() + 3 * 60000).toISOString(), // 3 mins remaining
    triageAssessment: {
      vitalInstability: true,
      consciousAltered: true,
      lifeThreateningHazard: true,
      equipmentCriticality: 'life_support',
      calculatedScore: 10,
      priority: 'P1',
      recommendedSlaMinutes: 15,
      clinicalRationale: 'Direct respiratory compromise with life-support equipment failure in ICU'
    },
    assignedResponderId: 'RESP-02',
    assignedResponderName: 'Dr. Alistair Ross',
    assignedResponderRole: 'Intensive Care Specialist',
    dispatchedAt: new Date(Date.now() - 9 * 60000).toISOString(),
    auditTrail: [
      {
        id: 'LOG-001',
        timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
        actor: 'Staff Nurse Angela Wu',
        action: 'Incident Logged & Automated Triage Computed',
        newStatus: 'REPORTED',
        notes: 'Algorithmic assessment assigned P1 (Immediate Resuscitation)'
      },
      {
        id: 'LOG-002',
        timestamp: new Date(Date.now() - 9 * 60000).toISOString(),
        actor: 'Triage Coordinator',
        action: 'Dispatched to Intensivist',
        previousStatus: 'REPORTED',
        newStatus: 'DISPATCHED',
        notes: 'Assigned Dr. Alistair Ross with emergency pager alert'
      },
      {
        id: 'LOG-003',
        timestamp: new Date(Date.now() - 6 * 60000).toISOString(),
        actor: 'Dr. Alistair Ross',
        action: 'On-scene Clinical Interventions Initiated',
        previousStatus: 'DISPATCHED',
        newStatus: 'IN_PROGRESS',
        notes: 'Switched patient to manual Ambu-bag bag-valve ventilation while testing ventilator exhalation valve membrane.'
      }
    ]
  },
  {
    id: 'INC-2026-102',
    title: 'Post-Op Acute Hypotensive Collapse & Tachycardia',
    description: 'Post-laparotomy patient collapsed upon assisted ambulation. BP 78/45 mmHg, HR 135 bpm, pale and diaphoretic. Suspected intra-abdominal hemorrhage.',
    department: 'General Ward',
    location: 'Ward 4C, Room 412, Bed 1',
    reporterName: 'Priya Sharma, RN',
    reporterRole: 'Charge Nurse',
    reporterContact: 'Ext. 3204',
    category: 'Clinical Deterioration',
    priority: 'P1',
    status: 'DISPATCHED',
    reportedAt: new Date(Date.now() - 7 * 60000).toISOString(),
    slaMinutes: 15,
    slaDeadline: new Date(Date.now() + 8 * 60000).toISOString(), // 8 mins remaining
    triageAssessment: {
      vitalInstability: true,
      consciousAltered: true,
      lifeThreateningHazard: true,
      equipmentCriticality: 'none',
      calculatedScore: 9,
      priority: 'P1',
      recommendedSlaMinutes: 15,
      clinicalRationale: 'Hemodynamic shock with acute consciousness alteration requiring rapid medical response'
    },
    assignedResponderId: 'RESP-01',
    assignedResponderName: 'Dr. Marcus Chen',
    assignedResponderRole: 'Consultant Emergency Physician',
    dispatchedAt: new Date(Date.now() - 4 * 60000).toISOString(),
    auditTrail: [
      {
        id: 'LOG-010',
        timestamp: new Date(Date.now() - 7 * 60000).toISOString(),
        actor: 'Priya Sharma, RN',
        action: 'MET Call / Clinical Escalation Activated',
        newStatus: 'REPORTED',
        notes: 'Rapid Response alert triggered'
      },
      {
        id: 'LOG-011',
        timestamp: new Date(Date.now() - 4 * 60000).toISOString(),
        actor: 'Clinical Dispatch Hub',
        action: 'Dispatched Medical Emergency Team Lead',
        previousStatus: 'REPORTED',
        newStatus: 'DISPATCHED',
        notes: 'Assigned Dr. Marcus Chen to lead bedside stabilization'
      }
    ]
  },
  {
    id: 'INC-2026-103',
    title: 'Neonatal Radiant Warmer Temperature Sensor Drift',
    description: 'Warmer unit probe #2 registering intermittent false ambient readings, fluctuating skin probe reading by 1.8°C.',
    department: 'Pediatrics',
    location: 'NICU Incubator Bay 3',
    reporterName: 'Elena Ramos, RN',
    reporterRole: 'Pediatric Charge Nurse',
    reporterContact: 'Ext. 5102',
    category: 'Medical Equipment Failure',
    priority: 'P2',
    status: 'TRIAGED',
    reportedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    slaMinutes: 60,
    slaDeadline: new Date(Date.now() + 15 * 60000).toISOString(), // 15 mins remaining
    triageAssessment: {
      vitalInstability: false,
      consciousAltered: false,
      lifeThreateningHazard: false,
      equipmentCriticality: 'auxiliary',
      calculatedScore: 6,
      priority: 'P2',
      recommendedSlaMinutes: 60,
      clinicalRationale: 'Neonatal temperature control sensor anomaly; secondary backup monitoring active'
    },
    auditTrail: [
      {
        id: 'LOG-020',
        timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
        actor: 'Elena Ramos, RN',
        action: 'Incident Registered',
        newStatus: 'REPORTED',
        notes: 'Sensor probe swapped to secondary thermistor'
      },
      {
        id: 'LOG-021',
        timestamp: new Date(Date.now() - 40 * 60000).toISOString(),
        actor: 'Biomedical Desk',
        action: 'Triage Severity Confirmed',
        previousStatus: 'REPORTED',
        newStatus: 'TRIAGED',
        notes: 'P2 Urgent response queued for hardware sensor recalibration'
      }
    ]
  },
  {
    id: 'INC-2026-104',
    title: 'High-Concentration Glutaraldehyde Spill Outside Sterilization Unit',
    description: 'Approximately 500 mL of cold sterilization chemical disinfectant spilled in corridor. Sharp vapor odor reported.',
    department: 'Facilities & Safety',
    location: 'Central Sterile Supply Dept (CSSD) Corridor B',
    reporterName: 'Orderly Kevin Taylor',
    reporterRole: 'CSSD Technician',
    reporterContact: 'Ext. 2291',
    category: 'Hazardous Spill / Infection',
    priority: 'P2',
    status: 'REPORTED',
    reportedAt: new Date(Date.now() - 65 * 60000).toISOString(),
    slaMinutes: 60,
    slaDeadline: new Date(Date.now() - 5 * 60000).toISOString(), // SLA breached by 5 mins!
    triageAssessment: {
      vitalInstability: false,
      consciousAltered: false,
      lifeThreateningHazard: true,
      equipmentCriticality: 'none',
      calculatedScore: 7,
      priority: 'P2',
      recommendedSlaMinutes: 60,
      clinicalRationale: 'Vapor inhalation hazard in active corridor requiring neutralizing absorbent kit'
    },
    auditTrail: [
      {
        id: 'LOG-030',
        timestamp: new Date(Date.now() - 65 * 60000).toISOString(),
        actor: 'Orderly Kevin Taylor',
        action: 'Spill Incident Reported',
        newStatus: 'REPORTED',
        notes: 'Area temporarily cordoned off with caution barrier'
      }
    ]
  },
  {
    id: 'INC-2026-105',
    title: 'Smart Infusion Pump Barcode Scanner Decryption Timeout',
    description: 'Wireless barcode reader failing to decrypt pharmacy formulary tags on Alaris IV pump cart 3.',
    department: 'Emergency (ED)',
    location: 'ED Resuscitation Bay 1',
    reporterName: 'Triage Nurse John Miller',
    reporterRole: 'Staff Nurse',
    reporterContact: 'Ext. 1109',
    category: 'Medication Safety',
    priority: 'P3',
    status: 'DISPATCHED',
    reportedAt: new Date(Date.now() - 90 * 60000).toISOString(),
    slaMinutes: 240,
    slaDeadline: new Date(Date.now() + 150 * 60000).toISOString(), // 2.5 hours remaining
    triageAssessment: {
      vitalInstability: false,
      consciousAltered: false,
      lifeThreateningHazard: false,
      equipmentCriticality: 'auxiliary',
      calculatedScore: 4,
      priority: 'P3',
      recommendedSlaMinutes: 240,
      clinicalRationale: 'Fallback manual double-check nurse sign-off protocol active; device non-critical'
    },
    assignedResponderId: 'RESP-04',
    assignedResponderName: 'David Kowalski, CBET',
    assignedResponderRole: 'Lead Biomedical Engineer',
    dispatchedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    auditTrail: [
      {
        id: 'LOG-040',
        timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
        actor: 'Triage Nurse John Miller',
        action: 'Incident Created',
        newStatus: 'REPORTED',
        notes: 'Manual double verification instituted for IV drips'
      },
      {
        id: 'LOG-041',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        actor: 'Operations Hub',
        action: 'Assigned to Biomedical Engineer',
        previousStatus: 'REPORTED',
        newStatus: 'DISPATCHED',
        notes: 'Dispatched David Kowalski for firmware token refresh'
      }
    ]
  },
  {
    id: 'INC-2026-100',
    title: 'Emergency Triage Bay Auxiliary Generator Voltage Fluctuation',
    description: 'Scheduled generator changeover test caused brief 4-second voltage drop across auxiliary monitoring screens in triage bays.',
    department: 'Facilities & Safety',
    location: 'Emergency Triage Bay 1 & 2',
    reporterName: 'Charge Nurse Amanda Bell',
    reporterRole: 'ED Supervisor',
    reporterContact: 'Ext. 1100',
    category: 'Facility Failure',
    priority: 'P2',
    status: 'RESOLVED',
    reportedAt: new Date(Date.now() - 180 * 60000).toISOString(),
    slaMinutes: 60,
    slaDeadline: new Date(Date.now() - 120 * 60000).toISOString(),
    triageAssessment: {
      vitalInstability: false,
      consciousAltered: false,
      lifeThreateningHazard: false,
      equipmentCriticality: 'auxiliary',
      calculatedScore: 6,
      priority: 'P2',
      recommendedSlaMinutes: 60,
      clinicalRationale: 'Electrical transient on secondary power bus'
    },
    assignedResponderId: 'RESP-06',
    assignedResponderName: 'Walter Briggs',
    assignedResponderRole: 'Safety & Hazmat Director',
    dispatchedAt: new Date(Date.now() - 170 * 60000).toISOString(),
    resolution: {
      rootCause: 'External Infrastructure Failure',
      correctiveAction: 'Automatic Transfer Switch (ATS-2) circuit contactor replaced and load tested under 120kVA load bank. Secondary UPS batteries verified at 100% health.',
      verifiedBy: 'Walter Briggs',
      verifiedRole: 'Safety & Hazmat Director',
      resolvedAt: new Date(Date.now() - 130 * 60000).toISOString(),
      timeToResolveMinutes: 50,
      slaMet: true
    },
    auditTrail: [
      {
        id: 'LOG-000-1',
        timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
        actor: 'Charge Nurse Amanda Bell',
        action: 'Incident Created',
        newStatus: 'REPORTED',
        notes: 'Brief flicker logged during generator cutover'
      },
      {
        id: 'LOG-000-2',
        timestamp: new Date(Date.now() - 170 * 60000).toISOString(),
        actor: 'Dispatch Center',
        action: 'Dispatched to Facilities Lead',
        previousStatus: 'REPORTED',
        newStatus: 'DISPATCHED',
        notes: 'Assigned Walter Briggs'
      },
      {
        id: 'LOG-000-3',
        timestamp: new Date(Date.now() - 150 * 60000).toISOString(),
        actor: 'Walter Briggs',
        action: 'Investigation in Progress',
        previousStatus: 'DISPATCHED',
        newStatus: 'IN_PROGRESS',
        notes: 'ATS sub-panel inspected; contactor resistance slightly elevated'
      },
      {
        id: 'LOG-000-4',
        timestamp: new Date(Date.now() - 130 * 60000).toISOString(),
        actor: 'Walter Briggs',
        action: 'Incident Resolved & Closed',
        previousStatus: 'IN_PROGRESS',
        newStatus: 'RESOLVED',
        notes: 'Replaced contactor, full load bank test successful. SLA met within 50 minutes.'
      }
    ]
  }
];
