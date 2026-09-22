# NHS Trainee Feedback Platform - Implementation Plan

A modern, responsive cross-platform application (Ionic 9 + Angular Standalone + Capacitor) designed for London NHS regional trainee representatives and junior doctors. Replaces scattered Google Forms and WhatsApp links with centralized, targeted feedback distribution, dynamic surveys, safeguarding escalation, and actionable training insights.

---

## User Requirements & Decisions Summary

| Area | Decision & Design |
| :--- | :--- |
| **Authentication & Access Control** | **Sign In / Sign Out System**: <br>Demo switcher replaced with a dedicated NHS-branded login screen (`/login`), functional route guards (`authGuard`, `roleGuard`), and secure session termination from the Profile tab.<br><br>**Test Credentials:**<br>- **Trainee Doctor:** `username: trainee`, `password: trainee1`<br>- **Regional Rep:** `username: rep`, `password: rep1`<br>- **Admin:** `username: admin`, `password: admin1` |
| **Roles & Privileges** | **Trainee:** Fills targeted feedback forms, selects department, can flag serious incident.<br>**Regional Rep:** Creates & publishes surveys, reviews aggregated analytics & exports to Excel.<br>**Admin:** Full visibility/control of all Rep tools, plus approves Reps, manages Hospitals/Trusts/Sectors, and oversees safety incident investigations. |
| **Anonymity & Safeguarding** | **Anonymous by default**: Reps only see anonymized feedback. <br>**Un-anonymization Exception**: If an investigation is formally required, the **Admin** has the authority to un-anonymize the author with a permanent audit log, or dismiss/remove the safety flag. |
| **Hierarchy & Targeting** | **London Region** -> **Sectors** (NCL, NEL, NWL, SL) -> **NHS Trusts** -> **Individual Hospitals**.<br>Admin can manage hospitals and trusts directly from the portal. |
| **Analytics & Reporting** | **Reactive Filter Engine**: Multi-criteria filters with real-time reactive signals, collapsible filter drawer, KPI cards, rating distribution chart, and simple one-click **Export to Excel** (.csv). |

---

## Phased Project Roadmap Status

```mermaid
graph TD
    P1[Phase 1: Frontend UI Foundation & Shell - COMPLETED] --> P2[Phase 2: Interactive MVP / Demo with Mock Data - COMPLETED]
    P2 --> P3[Phase 3: Analytics, Filtering & Export Engine - COMPLETED]
    P3 --> P4[Phase 4: Backend Integration & Authentication - IN PROGRESS]
    P4 --> P5[Phase 5: Native Capacitor & Push Notifications - UPCOMING]
```
