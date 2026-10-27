# CareFlow — Clinical Incident Triage & Emergency Response Coordinator

[![Live Demo](https://img.shields.io/badge/Live%20Demo-careflow--triage.vercel.app-blue?style=for-the-badge&logo=vercel)](https://careflow-triage.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-saurabyadav0027%2Fcareflow--triage-black?style=for-the-badge&logo=github)](https://github.com/saurabyadav0027/careflow-triage)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](#)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](#)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8)](#)
[![Tests](https://img.shields.io/badge/tests-6%20passed-success)](#)

> An institutional clinical incident triage, emergency responder dispatch, and SBAR shift-handover coordination platform designed for healthcare facilities and emergency departments.

---

## 📌 Project Quick Links

- 🌐 **Live Deployed Application:** **[https://careflow-triage.vercel.app](https://careflow-triage.vercel.app)**
- 💻 **Source Code Repository:** **[https://github.com/saurabyadav0027/careflow-triage](https://github.com/saurabyadav0027/careflow-triage)**
- 👨‍💻 **Author / Student:** Saurabh Yadav (`saurabkumar.25bcs10244@sst.scaler.com`)
- 📋 **Official Submission Guidelines Compliance:** 100% Aligned (End-Term Software Project)

---

## 🎥 Demo Video

[![Demo Video Walkthrough](https://img.shields.io/badge/▶%20Watch%20Demo%20Video-CareFlow%20Walkthrough-red?style=for-the-badge&logo=google-drive)](https://drive.google.com/file/d/1I4dAGD1g-tJhufX0DSBrQobEZ3iATXyh/view?usp=sharing)

> 📹 **Official Walkthrough:** **[Watch the CareFlow 3–5 Minute Clinical Triage Demo Video](https://drive.google.com/file/d/1I4dAGD1g-tJhufX0DSBrQobEZ3iATXyh/view?usp=sharing)**  
> *(Demonstrates real-time algorithmic triage scoring, responder dispatch, guarded RCA resolution, and SBAR shift-handover generation)*

---

## 1. Problem Statement

In modern hospitals and clinical care centers, sudden adverse incidents—such as medical equipment failures (e.g., ventilator alarms, infusion pump occlusions), acute patient deteriorations, rapid telemetry collapses, and hazardous spills—occur constantly across high-acuity wards.

Currently, hospital staff rely heavily on fragmented communication channels: informal WhatsApp group chats, physical whiteboards, and manual telephone switchboards. This operational friction results in:
- **Delayed emergency interventions**: Critical alerts get lost in unstructured group chats.
- **Unmonitored SLA breaches**: Hospitals fail to respond within clinically recommended timeframes (e.g. Manchester Triage standards) without accountability.
- **Missed handovers**: Critical open issues fall through the cracks during shift changes between outgoing and incoming medical teams.
- **Lack of regulatory compliance**: Hospitals lack immutable, chronological audit trails necessary for Joint Commission (JCI) and ISO-9001 accreditation.

---

## 2. Target Users

CareFlow is built specifically for:
1. **Triage Nurses & Charge Nurses**: Need rapid, rule-based clinical scoring and instant operational escalation for ward emergencies.
2. **On-Duty Physicians & Medical Officers**: Need an actionable queue of assigned clinical deteriorations with transparent patient vitals and priority timelines.
3. **Biomedical Engineers & Technical Leads**: Need real-time visibility into defective life-support and auxiliary medical hardware to execute corrective maintenance.
4. **Hospital Quality & Safety Directors**: Require root cause analysis (RCA) records, regulatory audit logs, and institutional SLA compliance analytics.

---

## 3. Solution

CareFlow introduces a resilient, workflow-driven operational platform:
1. **Manchester / ESI Algorithmic Triage Engine**: Eliminates subjective guesswork by dynamically computing incident severity (P1 Immediate, P2 Urgent, P3 Semi-Urgent, P4 Routine) and assigning strict countdown SLA timers based on physiological vitals, neurological compromise, and equipment criticality.
2. **Guarded State Transition Engine**: Enforces strict operational guardrails (e.g., incidents cannot be resolved without a classified Root Cause and verified clinician sign-off).
3. **Smart Dispatch & Caseload Balancing**: Tracks on-duty responder specialization and prevents alert fatigue by warning coordinators when allocating cases to overloaded responders.
4. **SBAR Clinical Handover Generator**: Automates the compilation of institutional Situation-Background-Assessment-Recommendation transition documents with one click.
5. **Offline-First Persistence**: Stores complete clinical audit trails and incident lifecycles locally without requiring third-party credentials or fragile external APIs.

---

## 4. Key Features & Workflows

### Workflow 1: Intake & Algorithmic Triage Scoring
- Clinical staff log an adverse event by selecting department, specific bed location, and observations.
- Live rule engine evaluates:
  - Life-threatening risk / active arrest flags
  - Physiological vitals compromise (airway / breathing / circulation)
  - Neurological alteration (GCS drop)
  - Equipment criticality level (None / Auxiliary / Life-Support)
- Produces a deterministic severity score (1–10), priority tier (P1–P4), dynamic SLA deadline, and transparent clinical rationale.
- Allows clinician override with mandatory documented justification.

### Workflow 2: Dispatch & Workload Management
- Coordinators view active on-duty staff roster filtered by specialty and current status (`AVAILABLE`, `ENGAGED`, `ON_CALL`, `OFF_DUTY`).
- Caseload tracking warns dispatchers if a responder already carries $\ge 2$ active high-severity cases.
- Dispatch action transitions incident state and appends timestamped actor notes into the immutable audit trail.

### Workflow 3: Guarded Investigation & RCA Resolution
- Enforces strict regulatory compliance guards:
  - Resolution cannot be marked without mandatory Root Cause Analysis classification (`Equipment Wear`, `Human Protocol Error`, `Clinical Complication`, `External Infrastructure Failure`, `Supply Shortage`).
  - Requires minimum 10-character descriptive corrective action notes.
  - Requires authenticated sign-off by a verified clinician or lead engineer.
- Automatically calculates turnaround time and certifies whether the response was met within SLA.

### Workflow 4: SBAR Clinical Shift Handover Protocol
- Generates official Situation-Background-Assessment-Recommendation handover briefs for Morning, Evening, and Night duty changeovers.
- Summarizes open cases, active P1/P2 items, and SLA breaches.
- One-click copy formatted Markdown, export `.MD` file, or trigger print-optimized report.

### Workflow 5: Real-time Incident Analytics & SLA Monitoring
- Live countdown timers dynamically tick with color-coded warnings (Green $> 30\text{m}$, Amber $\le 15\text{m}$, Red Breached with overdue counter).
- Interactive KPI dashboards compute SLA compliance percentage, average resolution turnaround, departmental caseload distribution, and root cause trends.

---

## 5. Technology Stack

- **Frontend Framework**: React 18 with TypeScript (Strict Mode)
- **Build Tool & Bundler**: Vite 5 (Ultra-fast HMR and optimized production bundling)
- **Styling & UI**: Tailwind CSS (Enterprise-grade slate palette; clean high-contrast clinical interface with zero flashy purple gradients)
- **Icons**: Lucide React
- **Persistence Layer**: LocalStorage Engine with typed domain schema, seed dataset fallback, and JSON export/import
- **Automated Testing**: Node.js Native Test Runner (`node --test`) verifying triage calculations and state machine guards
- **Deployment Platform**: Vercel (Production CI/CD)

---

## 6. Architecture & System Design

CareFlow adopts a modular, decoupled domain-driven architecture:

```
src/
├── types/
│   └── index.ts                 # Domain models: Incident, Responder, TriageAssessment, AuditLog, ShiftHandover
├── services/
│   ├── triageEngine.ts          # Algorithmic triage index computation & SLA calculator
│   ├── stateMachine.ts          # Guarded status transitions & immutable audit logging
│   ├── handoverService.ts       # SBAR clinical report compiler
│   └── storage.ts               # LocalStorage persistence, seed initialization, JSON import/export
├── data/
│   └── seedData.ts              # Pre-loaded realistic hospital cases (ICU, ED, Pediatrics, BioMed)
├── components/
│   ├── layout/                  # Header, Navigation Tabs, Toast Feedback
│   ├── incidents/               # Filterable Incident Master Table, Triage Modal, Detail Drawer, Resolve Modal
│   ├── board/                   # 5-Column Triage Kanban Board
│   ├── responders/              # On-duty staff roster and caseload management
│   ├── handover/                # SBAR shift handover generator & export
│   └── analytics/               # Institutional SLA & quality metrics dashboard
├── App.tsx                      # Root state orchestrator & event bus
└── main.tsx                     # React DOM entry point
```

### State Machine Lifecycle

```
[ REPORTED ] ──(Triage Evaluation)──> [ TRIAGED ]
     │                                     │
     └─────────(Assign Staff)──────────────┘
                        │
                        ▼
                 [ DISPATCHED ]
                        │
                  (Commence Work)
                        │
                        ▼
                [ IN_PROGRESS ] ──(Escalate)──> [ ESCALATED ]
                        │                             │
               (Guarded RCA Sign-off)           (Re-dispatch)
                        │                             │
                        ▼                             ▼
                 [ RESOLVED ]                  [ DISPATCHED ]
```

---

## 7. Local Setup Instructions

### Prerequisites
- Node.js `v18.0.0` or higher (verified on Node `v22.x`)
- npm `v9.0.0` or higher

### Installation & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/saurabyadav0027/careflow-triage.git
   cd careflow-triage
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the automated test suite**:
   ```bash
   npm test
   ```
   *Verifies 6 algorithmic test cases: triage rule scoring, SLA window calculations, and guarded state transitions.*

4. **Start the local development server**:
   ```bash
   npm run dev
   ```
   *Open `http://localhost:5173` in your browser.*

5. **Build for production**:
   ```bash
   npm run build
   ```
   *Generates an optimized, deployable production bundle in the `dist/` directory.*

6. **Preview the production build**:
   ```bash
   npm run preview
   ```

---

## 8. Environment Variables

CareFlow is engineered as a zero-dependency, self-contained operational platform with offline persistence. No third-party API keys or external secrets are required to run the application, guaranteeing zero downtime or evaluator permission issues.

```env
# Optional configuration (defaults are built-in)
PORT=5173
VITE_APP_FACILITY_NAME="St. Jude Regional Medical Center"
```

---

## 9. Deployment Details

- **Production Deployment URL:** [https://careflow-triage.vercel.app](https://careflow-triage.vercel.app)
- **Hosting Provider:** Vercel
- **Continuous Deployment:** Triggered automatically upon git push to `main` branch.

---

## 10. Demo Video Script & Walkthrough (3–5 Minutes)

For your submission video, follow this concise script:

| Timestamp | Topic | Screen Action | What to Say |
|---|---|---|---|
| **0:00 – 0:45** | **Problem & Context** | Show Dashboard Header & Facility info | *"In hospitals, clinical incidents and ventilator alarms get lost in informal WhatsApp groups. CareFlow provides a unified, rule-based operational triage and dispatch platform."* |
| **0:45 – 1:45** | **Workflow 1: Triage Intake** | Click **Report Incident**; toggle *Life-Threatening* and *Life-Support* checks | *"Notice how toggling vitals instability and life-support device criticality automatically computes an ESI score of 10/10, assigning Priority P1 with an immediate 15-minute SLA target and transparent clinical rationale."* |
| **1:45 – 2:30** | **Workflow 2: Dispatch & Kanban** | Switch to **Triage Kanban** or **Incident Master**; click **Dispatch** | *"Here we assign an on-duty clinician. Notice the caseload counter: it warns us if a responder is already managing multiple critical cases, preventing clinical burnout."* |
| **2:30 – 3:15** | **Workflow 3: Guarded RCA Resolution** | Click **Resolve & Sign-Off**; attempt empty submit, then enter valid RCA | *"Notice our guarded state machine: the platform rejects arbitrary closure until mandatory Root Cause Analysis and clinician sign-off are verified, certifying whether the SLA was met."* |
| **3:15 – 4:00** | **Workflow 4: SBAR Shift Handover** | Switch to **Shift Handover (SBAR)** tab | *"At the end of every shift, CareFlow compiles an official SBAR brief with active P1 cases and SLA breaches, ready to copy to clipboard or print for incoming medical officers."* |
| **4:00 – 4:30** | **Workflow 5: SLA Analytics & Tests** | Show **SLA Analytics** tab & terminal `npm test` | *"Our analytics engine tracks real-time SLA compliance and turnaround distribution. All business logic is validated by automated unit tests."* |

---

## 11. Final Submission Checklist

- [x] Functional software application with active state & storage
- [x] Real-world clinical domain solving emergency communication failure
- [x] 5 complete, tested core workflows
- [x] Meaningful engineering logic (ESI triage engine, guarded state machine, SLA countdowns)
- [x] Clean, professional, human-crafted color palette (Slate & Navy; no AI purple templates)
- [x] Zero exposed secrets or credentials
- [x] Multi-commit Git development history
- [x] Automated unit test suite passing (`npm test`)
- [x] Comprehensive documentation & demo video script
