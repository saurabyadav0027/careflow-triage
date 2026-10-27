import { Priority, TriageAssessment } from '../types';

export interface TriageInput {
  vitalInstability: boolean;
  consciousAltered: boolean;
  lifeThreateningHazard: boolean;
  equipmentCriticality: 'none' | 'auxiliary' | 'life_support';
  department: string;
  category: string;
}

/**
 * Algorithmic triage calculation engine based on emergency severity protocols.
 * Evaluates physiological instability, environmental hazards, and equipment criticality
 * to compute deterministic triage level, clinical rationale, and SLA response deadline.
 */
export function computeTriageScore(input: TriageInput): TriageAssessment {
  let score = 1;
  const rationaleParts: string[] = [];

  // 1. Life threatening hazards or life-support failure trigger highest severity
  if (input.lifeThreateningHazard) {
    score += 5;
    rationaleParts.push('Active acute hazard directly endangering human life');
  }

  if (input.equipmentCriticality === 'life_support') {
    score += 4;
    rationaleParts.push('Life-support critical equipment malfunction');
  }

  // 2. Physiological instability
  if (input.vitalInstability) {
    score += 3;
    rationaleParts.push('Vital signs compromise (airway / respiratory / hemodynamic instability)');
  }

  if (input.consciousAltered) {
    score += 2;
    rationaleParts.push('Acute neurological deterioration / altered mental state');
  }

  // 3. Departmental baseline risk modifier
  if (input.department === 'Intensive Care (ICU)' || input.department === 'Emergency (ED)') {
    score += 1;
    rationaleParts.push('High-acuity critical department setting');
  }

  if (input.equipmentCriticality === 'auxiliary') {
    score += 1;
    rationaleParts.push('Auxiliary clinical device degraded');
  }

  // Cap score between 1 and 10
  score = Math.min(10, Math.max(1, score));

  // Determine Priority and SLA from score
  let priority: Priority;
  let recommendedSlaMinutes: number;

  if (score >= 8 || input.lifeThreateningHazard || input.equipmentCriticality === 'life_support') {
    priority = 'P1';
    recommendedSlaMinutes = 15; // 15 mins for Immediate Resuscitation / Code Incident
  } else if (score >= 5 || input.vitalInstability) {
    priority = 'P2';
    recommendedSlaMinutes = 60; // 1 hour for Urgent Care
  } else if (score >= 3) {
    priority = 'P3';
    recommendedSlaMinutes = 240; // 4 hours for Semi-Urgent
  } else {
    priority = 'P4';
    recommendedSlaMinutes = 1440; // 24 hours for Routine maintenance / reports
  }

  const clinicalRationale = rationaleParts.length > 0 
    ? rationaleParts.join('; ') + ` (Algorithmic Index: ${score}/10)`
    : `Standard baseline triage assessment without red-flag risk factors (Score: ${score}/10)`;

  return {
    vitalInstability: input.vitalInstability,
    consciousAltered: input.consciousAltered,
    lifeThreateningHazard: input.lifeThreateningHazard,
    equipmentCriticality: input.equipmentCriticality,
    calculatedScore: score,
    priority,
    recommendedSlaMinutes,
    clinicalRationale
  };
}

/**
 * Calculates time remaining until SLA breach. Negative value indicates breach.
 */
export function getSlaRemainingMinutes(deadlineIso: string, referenceTime: Date = new Date()): number {
  const deadline = new Date(deadlineIso).getTime();
  const current = referenceTime.getTime();
  const diffMs = deadline - current;
  return Math.round(diffMs / 60000);
}

/**
 * Formats SLA countdown into human readable text with urgency classification.
 */
export function formatSlaCountdown(deadlineIso: string, isResolved: boolean = false): {
  text: string;
  isBreached: boolean;
  isWarning: boolean;
} {
  if (isResolved) {
    return { text: 'Resolved', isBreached: false, isWarning: false };
  }

  const remainingMinutes = getSlaRemainingMinutes(deadlineIso);

  if (remainingMinutes < 0) {
    const overdueMinutes = Math.abs(remainingMinutes);
    const hours = Math.floor(overdueMinutes / 60);
    const mins = overdueMinutes % 60;
    const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    return {
      text: `Breached by ${timeStr}`,
      isBreached: true,
      isWarning: false
    };
  }

  const hours = Math.floor(remainingMinutes / 60);
  const mins = remainingMinutes % 60;

  if (hours > 0) {
    return {
      text: `${hours}h ${mins}m left`,
      isBreached: false,
      isWarning: remainingMinutes <= 30
    };
  }

  return {
    text: `${mins}m left`,
    isBreached: false,
    isWarning: remainingMinutes <= 15
  };
}
