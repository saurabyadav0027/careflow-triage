import { Incident, Responder } from '../types';
import { INITIAL_INCIDENTS, INITIAL_RESPONDERS } from '../data/seedData';

const INCIDENTS_STORAGE_KEY = 'careflow_incidents_v1';
const RESPONDERS_STORAGE_KEY = 'careflow_responders_v1';

export function loadIncidents(): Incident[] {
  try {
    const raw = localStorage.getItem(INCIDENTS_STORAGE_KEY);
    if (!raw) {
      saveIncidents(INITIAL_INCIDENTS);
      return INITIAL_INCIDENTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveIncidents(INITIAL_INCIDENTS);
      return INITIAL_INCIDENTS;
    }
    return parsed;
  } catch (error) {
    console.warn('Failed to load incidents from localStorage, resetting to seed data', error);
    saveIncidents(INITIAL_INCIDENTS);
    return INITIAL_INCIDENTS;
  }
}

export function saveIncidents(incidents: Incident[]): void {
  try {
    localStorage.setItem(INCIDENTS_STORAGE_KEY, JSON.stringify(incidents));
  } catch (error) {
    console.error('Failed to save incidents to localStorage', error);
  }
}

export function loadResponders(): Responder[] {
  try {
    const raw = localStorage.getItem(RESPONDERS_STORAGE_KEY);
    if (!raw) {
      saveResponders(INITIAL_RESPONDERS);
      return INITIAL_RESPONDERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveResponders(INITIAL_RESPONDERS);
      return INITIAL_RESPONDERS;
    }
    return parsed;
  } catch (error) {
    console.warn('Failed to load responders from localStorage, resetting to seed data', error);
    saveResponders(INITIAL_RESPONDERS);
    return INITIAL_RESPONDERS;
  }
}

export function saveResponders(responders: Responder[]): void {
  try {
    localStorage.setItem(RESPONDERS_STORAGE_KEY, JSON.stringify(responders));
  } catch (error) {
    console.error('Failed to save responders to localStorage', error);
  }
}

export function resetToSeedData(): { incidents: Incident[]; responders: Responder[] } {
  localStorage.removeItem(INCIDENTS_STORAGE_KEY);
  localStorage.removeItem(RESPONDERS_STORAGE_KEY);
  saveIncidents(INITIAL_INCIDENTS);
  saveResponders(INITIAL_RESPONDERS);
  return { incidents: INITIAL_INCIDENTS, responders: INITIAL_RESPONDERS };
}

export function exportSystemDataToJson(incidents: Incident[], responders: Responder[]): void {
  const exportPayload = {
    appName: 'CareFlow Clinical Incident Triage Platform',
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    data: {
      incidents,
      responders
    }
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `careflow-triage-export-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function importSystemDataFromJson(jsonString: string): { incidents: Incident[]; responders: Responder[] } | null {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.data && Array.isArray(parsed.data.incidents) && Array.isArray(parsed.data.responders)) {
      saveIncidents(parsed.data.incidents);
      saveResponders(parsed.data.responders);
      return { incidents: parsed.data.incidents, responders: parsed.data.responders };
    }
    return null;
  } catch (e) {
    console.error('Invalid JSON file format for import', e);
    return null;
  }
}
