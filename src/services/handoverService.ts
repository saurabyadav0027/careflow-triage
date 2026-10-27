import { Incident, ShiftHandoverReport } from '../types';
import { getSlaRemainingMinutes } from './triageEngine';

/**
 * Generates an institutional SBAR (Situation, Background, Assessment, Recommendation)
 * handover report for hospital duty handovers between shifts.
 */
export function generateShiftHandover(
  incidents: Incident[],
  outgoingOfficer: string = 'Dr. Sarah Lin (Duty Medical Officer)',
  incomingOfficer: string = 'Dr. Robert Vance (Incoming Registrar)',
  shiftType: 'Morning (07:00 - 15:30)' | 'Evening (15:00 - 23:30)' | 'Night (23:00 - 07:30)' = 'Evening (15:00 - 23:30)'
): ShiftHandoverReport {
  const unresolved = incidents.filter(i => i.status !== 'RESOLVED');
  const resolvedToday = incidents.filter(i => i.status === 'RESOLVED');
  
  const activeP1 = unresolved.filter(i => i.priority === 'P1');
  const activeP2 = unresolved.filter(i => i.priority === 'P2');
  
  const breached = unresolved.filter(i => getSlaRemainingMinutes(i.slaDeadline) < 0);

  // Auto-compose SBAR sections based on actual data
  const situation = `Hospital operational triage summary for ${shiftType}. Currently managing ${unresolved.length} active incidents, including ${activeP1.length} Critical P1 cases and ${activeP2.length} Urgent P2 escalations across departments.`;

  const background = `Over the past shift cycle, a total of ${incidents.length} clinical, equipment, and facility incidents were registered. ${resolvedToday.length} cases have been formally investigated and signed off. ${breached.length} active incidents currently breach their SLA threshold.`;

  const assessmentDetails = unresolved.map(i => {
    const minsLeft = getSlaRemainingMinutes(i.slaDeadline);
    const slaStatus = minsLeft < 0 ? `BREACHED (-${Math.abs(minsLeft)}m)` : `${minsLeft}m remaining`;
    return `• [${i.priority}] ${i.id} (${i.department} - ${i.location}): ${i.title}. Status: ${i.status}. Assigned: ${i.assignedResponderName || 'UNASSIGNED'}. SLA: ${slaStatus}.`;
  }).join('\n');

  const assessment = unresolved.length > 0
    ? `High priority workload breakdown:\n${assessmentDetails}`
    : 'All ward alerts and clinical incidents are currently contained and closed. Zero active SLA breaches.';

  const criticalFollowups = activeP1.map(i => `Prioritize immediate response to ${i.id} at ${i.location} (${i.title}).`).join(' ');
  const breachFollowups = breached.length > 0 ? `Audit ${breached.length} breached cases for root-cause escalation.` : '';
  
  const recommendation = `${criticalFollowups} ${breachFollowups} Ensure continuous telemetry monitoring in ICU and review biomedical equipment turnaround with engineering staff. Incoming team to acknowledge open items.`.trim();

  return {
    shiftId: `HANDOVER-${new Date().toISOString().slice(0, 10)}-${Date.now().toString().slice(-4)}`,
    shiftName: shiftType,
    generatedAt: new Date().toISOString(),
    outgoingOfficer,
    incomingOfficer,
    activeP1Count: activeP1.length,
    activeP2Count: activeP2.length,
    totalPendingCount: unresolved.length,
    breachedSlaCount: breached.length,
    resolvedTodayCount: resolvedToday.length,
    sbarSituation: situation,
    sbarBackground: background,
    sbarAssessment: assessment,
    sbarRecommendation: recommendation,
    unresolvedIncidents: unresolved
  };
}

/**
 * Formats the SBAR handover report into clear, copyable clinical Markdown text.
 */
export function formatHandoverMarkdown(report: ShiftHandoverReport): string {
  return `# CLINICAL OPERATIONAL SHIFT HANDOVER (SBAR)
**Shift:** ${report.shiftName}  
**Timestamp:** ${new Date(report.generatedAt).toLocaleString()}  
**Outgoing Officer:** ${report.outgoingOfficer}  
**Incoming Officer:** ${report.incomingOfficer}  

---

### 1. SITUATION
${report.sbarSituation}

### 2. BACKGROUND
${report.sbarBackground}

### 3. ASSESSMENT
${report.sbarAssessment}

### 4. RECOMMENDATION
${report.sbarRecommendation}

---

### METRIC SUMMARY
- **Total Open Cases:** ${report.totalPendingCount}
- **Active P1 (Immediate):** ${report.activeP1Count}
- **Active P2 (Urgent):** ${report.activeP2Count}
- **SLA Breaches:** ${report.breachedSlaCount}
- **Resolved Cases:** ${report.resolvedTodayCount}
`;
}
