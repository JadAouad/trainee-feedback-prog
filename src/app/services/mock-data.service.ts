import { Injectable, signal, computed } from '@angular/core';
import {
  Sector, Trust, Hospital, Department, Survey, SurveySubmission,
  RepApprovalRequest, AuditLogEntry, IncidentStatus
} from '../models/nhs.models';
import {
  AnalyticsFilterQuery, AnalyticsSummaryResponse, DepartmentMetric,
  HospitalMetric, QuestionAnalyticsMetric, TimelineDataPoint
} from '../models/api/analytics.models';
import { ExportRequest, ExportReportMetadata } from '../models/api/export.models';

const STORAGE_KEY_SECTORS = 'nhs_sectors_v4';
const STORAGE_KEY_TRUSTS = 'nhs_trusts_v4';
const STORAGE_KEY_HOSPITALS = 'nhs_hospitals_v4';
const STORAGE_KEY_SURVEYS = 'nhs_surveys_v4';
const STORAGE_KEY_SUBMISSIONS = 'nhs_submissions_v4';
const STORAGE_KEY_REPS = 'nhs_rep_requests_v4';
const STORAGE_KEY_AUDIT = 'nhs_audit_logs_v4';

@Injectable({
  providedIn: 'root',
})
export class MockDataService {
  readonly sectors = signal<Sector[]>(this.loadInitialSectors());
  readonly trusts = signal<Trust[]>(this.loadInitialTrusts());
  readonly hospitals = signal<Hospital[]>(this.loadInitialHospitals());

  readonly departments = signal<Department[]>([
    { id: 'dep-ed', name: 'Emergency Medicine (A&E)' },
    { id: 'dep-aim', name: 'Acute Internal Medicine' },
    { id: 'dep-paeds', name: 'Paediatrics & Neonatology' },
    { id: 'dep-gensurg', name: 'General Surgery' },
    { id: 'dep-anaesth', name: 'Anaesthetics & Intensive Care' },
    { id: 'dep-obgyn', name: 'Obstetrics & Gynaecology' },
    { id: 'dep-to', name: 'Trauma & Orthopaedics' },
    { id: 'dep-cardio', name: 'Cardiology' },
  ]);

  readonly surveys = signal<Survey[]>(this.loadInitialSurveys());
  readonly submissions = signal<SurveySubmission[]>(this.loadInitialSubmissions());
  readonly repApprovals = signal<RepApprovalRequest[]>(this.loadInitialRepRequests());
  readonly auditLogs = signal<AuditLogEntry[]>(this.loadInitialAuditLogs());

  private loadInitialSectors(): Sector[] {
    const s = localStorage.getItem(STORAGE_KEY_SECTORS);
    if (s) { try { return JSON.parse(s); } catch (e) {} }
    return [
      { id: 'sec-ncl', name: 'North Central London', code: 'NCL' },
      { id: 'sec-nel', name: 'North East London', code: 'NEL' },
      { id: 'sec-nwl', name: 'North West London', code: 'NWL' },
      { id: 'sec-sl', name: 'South London', code: 'SL' },
    ];
  }

  private loadInitialTrusts(): Trust[] {
    const s = localStorage.getItem(STORAGE_KEY_TRUSTS);
    if (s) { try { return JSON.parse(s); } catch (e) {} }
    return [
      { id: 'trust-barts', sectorId: 'sec-nel', name: 'Barts Health Trust', code: 'BH' },
      { id: 'trust-uclh', sectorId: 'sec-ncl', name: 'University College London Hospitals Trust', code: 'UCLH' },
      { id: 'trust-imperial', sectorId: 'sec-nwl', name: 'Imperial College Healthcare Trust', code: 'ICH' },
      { id: 'trust-gstt', sectorId: 'sec-sl', name: "Guy's and St Thomas' Foundation Trust", code: 'GSTT' },
      { id: 'trust-kings', sectorId: 'sec-sl', name: "King's College Hospital Foundation Trust", code: 'KCH' },
      { id: 'trust-rf', sectorId: 'sec-ncl', name: 'Royal Free London Foundation Trust', code: 'RFL' },
    ];
  }

  private loadInitialHospitals(): Hospital[] {
    const s = localStorage.getItem(STORAGE_KEY_HOSPITALS);
    if (s) { try { return JSON.parse(s); } catch (e) {} }
    return [
      { id: 'hosp-rlh', trustId: 'trust-barts', sectorId: 'sec-nel', name: 'The Royal London Hospital' },
      { id: 'hosp-barts', trustId: 'trust-barts', sectorId: 'sec-nel', name: "St Bartholomew's Hospital" },
      { id: 'hosp-uclh', trustId: 'trust-uclh', sectorId: 'sec-ncl', name: 'University College Hospital' },
      { id: 'hosp-stmarys', trustId: 'trust-imperial', sectorId: 'sec-nwl', name: "St Mary's Hospital" },
      { id: 'hosp-charing', trustId: 'trust-imperial', sectorId: 'sec-nwl', name: 'Charing Cross Hospital' },
      { id: 'hosp-stthomas', trustId: 'trust-gstt', sectorId: 'sec-sl', name: "St Thomas' Hospital" },
      { id: 'hosp-kings', trustId: 'trust-kings', sectorId: 'sec-sl', name: "King's College Hospital (Denmark Hill)" },
      { id: 'hosp-rfh', trustId: 'trust-rf', sectorId: 'sec-ncl', name: 'Royal Free Hospital' },
    ];
  }

  private loadInitialSurveys(): Survey[] {
    const stored = localStorage.getItem(STORAGE_KEY_SURVEYS);
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return [
      {
        id: 'srv-1',
        title: 'Q3 Regional Junior Doctor Rota & Workload Review',
        description: 'Quarterly review assessing shift patterns, exception reporting support, rest facilities, and workload intensity across London emergency and acute rotas.',
        creatorId: 'usr-rep-1',
        creatorName: 'Regional Rep',
        estimatedMinutes: 4,
        deadline: '2026-10-15',
        status: 'active',
        responseCount: 15, // exactly 15 submissions
        createdAt: '2026-09-10',
        target: {
          allSectors: false,
          sectorIds: ['sec-nel', 'sec-ncl'],
          hospitalIds: ['hosp-rlh', 'hosp-barts', 'hosp-uclh', 'hosp-rfh'],
        },
        questions: [
          {
            id: 'q1',
            title: 'How manageable has your on-call workload been over the past month?',
            type: 'rating',
            required: true,
            minRating: 1,
            maxRating: 5,
            labels: { min: '1 - Severe Overload', max: '5 - Very Manageable' },
          },
          {
            id: 'q2',
            title: 'Are rota gaps covered in a timely and safe manner in your department?',
            type: 'single_choice',
            required: true,
            options: ['Always covered with locum/cover', 'Sometimes covered, often short', 'Rarely covered, unsafe staffing', 'Not applicable'],
          },
          {
            id: 'q3',
            title: 'Which rest facilities are available during night shifts? (Select all that apply)',
            type: 'multiple_choice',
            required: true,
            options: ['Designated doctor mess with beds', 'Reclining sleep chairs', 'Hot food access after 11pm', 'Secure locker space', 'None of the above'],
          },
          {
            id: 'q4',
            title: 'Please provide any specific comments regarding department culture, supervision, or safe staffing:',
            type: 'text',
            required: false,
          },
        ],
      },
      {
        id: 'srv-2',
        title: 'Senior Clinical Supervision & Induction Quality Review',
        description: 'London-wide survey exploring induction quality and out-of-hours consultant access for newly rotated trainees.',
        creatorId: 'usr-rep-2',
        creatorName: 'Regional Rep',
        estimatedMinutes: 5,
        deadline: '2026-10-30',
        status: 'active',
        responseCount: 9, // exactly 9 submissions
        createdAt: '2026-09-15',
        target: {
          allSectors: true,
          sectorIds: [],
          hospitalIds: [],
        },
        questions: [
          {
            id: 'q2-1',
            title: 'How would you rate the department-specific induction you received upon starting this rotation?',
            type: 'rating',
            required: true,
            minRating: 1,
            maxRating: 5,
            labels: { min: '1 - Inadequate', max: '5 - Comprehensive' },
          },
          {
            id: 'q2-2',
            title: 'Was there an accessible and clear escalation pathway for out-of-hours advice?',
            type: 'single_choice',
            required: true,
            options: ['Yes, always clear and responsive', 'Partially clear', 'No, unclear who to escalate to'],
          },
          {
            id: 'q2-3',
            title: 'Any additional feedback regarding clinical teaching or clinic access:',
            type: 'text',
            required: false,
          },
        ],
      },
    ];
  }

  private loadInitialSubmissions(): SurveySubmission[] {
    const stored = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }

    // EXACTLY 15 SUBMISSIONS FOR SURVEY 1 (srv-1)
    const srv1_submissions: SurveySubmission[] = [
      {
        id: 'sub-1',
        surveyId: 'srv-1',
        surveyTitle: 'Q3 Regional Junior Doctor Rota & Workload Review',
        traineeId: 'usr-trainee-1',
        traineeName: 'Trainee',
        traineeEmail: 'trainee@nhs.net',
        sectorId: 'sec-nel',
        hospitalId: 'hosp-rlh',
        hospitalName: 'The Royal London Hospital',
        departmentName: 'Emergency Medicine (A&E)',
        grade: 'ST3',
        submittedAt: '2026-09-12 14:32',
        answers: [
          { questionId: 'q1', value: 2 },
          { questionId: 'q2', value: 'Rarely covered, unsafe staffing' },
          { questionId: 'q3', value: ['Reclining sleep chairs', 'Secure locker space'] },
          { questionId: 'q4', value: 'Night staffing frequently down 2 SHOs without locum cover. Escalation threshold unclear.' },
        ],
        incident: {
          isFlagged: true,
          concernSummary: 'Persistent unstaffed night shifts in Emergency Medicine posing risk to acute patient admissions.',
          status: 'under_investigation',
          isUnanonymized: false,
        },
      },
      {
        id: 'sub-2',
        surveyId: 'srv-1',
        surveyTitle: 'Q3 Regional Junior Doctor Rota & Workload Review',
        traineeId: 'usr-trainee-2',
        traineeName: 'Trainee',
        traineeEmail: 'trainee2@nhs.net',
        sectorId: 'sec-nel',
        hospitalId: 'hosp-rlh',
        hospitalName: 'The Royal London Hospital',
        departmentName: 'Paediatrics & Neonatology',
        grade: 'ST4',
        submittedAt: '2026-09-14 09:15',
        answers: [
          { questionId: 'q1', value: 4 },
          { questionId: 'q2', value: 'Always covered with locum/cover' },
          { questionId: 'q3', value: ['Designated doctor mess with beds', 'Hot food access after 11pm'] },
          { questionId: 'q4', value: 'Supportive consultants and well-structured rota coordination.' },
        ],
        incident: { isFlagged: false, isUnanonymized: false },
      },
      {
        id: 'sub-3',
        surveyId: 'srv-1',
        surveyTitle: 'Q3 Regional Junior Doctor Rota & Workload Review',
        traineeId: 'usr-trainee-3',
        traineeName: 'Trainee',
        traineeEmail: 'trainee3@nhs.net',
        sectorId: 'sec-ncl',
        hospitalId: 'hosp-uclh',
        hospitalName: 'University College Hospital',
        departmentName: 'Acute Internal Medicine',
        grade: 'FY2',
        submittedAt: '2026-09-16 11:20',
        answers: [
          { questionId: 'q1', value: 3 },
          { questionId: 'q2', value: 'Sometimes covered, often short' },
          { questionId: 'q3', value: ['Reclining sleep chairs'] },
          { questionId: 'q4', value: 'Exception reporting is encouraged, but rota gaps remain frequent on weekends.' },
        ],
        incident: { isFlagged: false, isUnanonymized: false },
      },
      {
        id: 'sub-4',
        surveyId: 'srv-1',
        surveyTitle: 'Q3 Regional Junior Doctor Rota & Workload Review',
        traineeId: 'usr-trainee-4',
        traineeName: 'Trainee',
        traineeEmail: 'trainee4@nhs.net',
        sectorId: 'sec-ncl',
        hospitalId: 'hosp-rfh',
        hospitalName: 'Royal Free Hospital',
        departmentName: 'General Surgery',
        grade: 'ST2',
        submittedAt: '2026-09-17 16:45',
        answers: [
          { questionId: 'q1', value: 4 },
          { questionId: 'q2', value: 'Always covered with locum/cover' },
          { questionId: 'q3', value: ['Designated doctor mess with beds', 'Secure locker space'] },
          { questionId: 'q4', value: 'Good theater time and supportive middle-grade supervision.' },
        ],
        incident: { isFlagged: false, isUnanonymized: false },
      },
      {
        id: 'sub-5',
        surveyId: 'srv-1',
        surveyTitle: 'Q3 Regional Junior Doctor Rota & Workload Review',
        traineeId: 'usr-trainee-5',
        traineeName: 'Trainee',
        traineeEmail: 'trainee5@nhs.net',
        sectorId: 'sec-nel',
        hospitalId: 'hosp-barts',
        hospitalName: "St Bartholomew's Hospital",
        departmentName: 'Cardiology',
        grade: 'ST5',
        submittedAt: '2026-09-18 18:10',
        answers: [
          { questionId: 'q1', value: 5 },
          { questionId: 'q2', value: 'Always covered with locum/cover' },
          { questionId: 'q3', value: ['Designated doctor mess with beds', 'Hot food access after 11pm', 'Secure locker space'] },
          { questionId: 'q4', value: 'Excellent teaching and catheter lab exposure.' },
        ],
        incident: { isFlagged: false, isUnanonymized: false },
      },
      {
        id: 'sub-6',
        surveyId: 'srv-1',
        surveyTitle: 'Q3 Regional Junior Doctor Rota & Workload Review',
        traineeId: 'usr-trainee-6',
        traineeName: 'Trainee',
        traineeEmail: 'trainee6@nhs.net',
        sectorId: 'sec-ncl',
        hospitalId: 'hosp-uclh',
        hospitalName: 'University College Hospital',
        departmentName: 'Emergency Medicine (A&E)',
        grade: 'FY1',
        submittedAt: '2026-09-19 20:05',
        answers: [
          { questionId: 'q1', value: 2 },
          { questionId: 'q2', value: 'Sometimes covered, often short' },
          { questionId: 'q3', value: ['None of the above'] },
          { questionId: 'q4', value: 'Intense shifts, hot food unavailable at night, high patient volume.' },
        ],
        incident: { isFlagged: false, isUnanonymized: false },
      },
      {
        id: 'sub-7',
        surveyId: 'srv-1',
        surveyTitle: 'Q3 Regional Junior Doctor Rota & Workload Review',
        traineeId: 'usr-trainee-7',
        traineeName: 'Trainee',
        traineeEmail: 'trainee7@nhs.net',
        sectorId: 'sec-nel',
        hospitalId: 'hosp-rlh',
        hospitalName: 'The Royal London Hospital',
        departmentName: 'Trauma & Orthopaedics',
        grade: 'ST3',
        submittedAt: '2026-09-20 10:14',
        answers: [
          { questionId: 'q1', value: 3 },
          { questionId: 'q2', value: 'Always covered with locum/cover' },
          { questionId: 'q3', value: ['Designated doctor mess with beds', 'Reclining sleep chairs'] },
          { questionId: 'q4', value: 'Heavy trauma intake on call, good consultant backup on site until 10pm.' },
        ],
        incident: { isFlagged: false, isUnanonymized: false },
      },
      {
        id: 'sub-8',
        surveyId: 'srv-1',
        surveyTitle: 'Q3 Regional Junior Doctor Rota & Workload Review',
        traineeId: 'usr-trainee-8',
        traineeName: 'Trainee',
        traineeEmail: 'trainee8@nhs.net',
        sectorId: 'sec-ncl',
        hospitalId: 'hosp-rfh',
        hospitalName: 'Royal Free Hospital',
        departmentName: 'Anaesthetics & Intensive Care',
        grade: 'ST4',
        submittedAt: '2026-09-20 13:40',
        answers: [
          { questionId: 'q1', value: 4 },
          { questionId: 'q2', value: 'Always covered with locum/cover' },
          { questionId: 'q3', value: ['Designated doctor mess with beds', 'Hot food access after 11pm'] },
          { questionId: 'q4', value: 'Well balanced ITU rota, excellent airway training.' },
        ],
        incident: { isFlagged: false, isUnanonymized: false },
      },
      {
        id: 'sub-9',
        surveyId: 'srv-1',
        surveyTitle: 'Q3 Regional Junior Doctor Rota & Workload Review',
        traineeId: 'usr-trainee-9',
        traineeName: 'Trainee',
        traineeEmail: 'trainee9@nhs.net',
        sectorId: 'sec-nel',
        hospitalId: 'hosp-barts',
        hospitalName: "St Bartholomew's Hospital",
        departmentName: 'Acute Internal Medicine',
        grade: 'FY2',
        submittedAt: '2026-09-20 15:55',
        answers: [
          { questionId: 'q1', value: 4 },
          { questionId: 'q2', value: 'Always covered with locum/cover' },
          { questionId: 'q3', value: ['Secure locker space', 'Reclining sleep chairs'] },
          { questionId: 'q4', value: 'Elective focus keeps unmanageable acute spikes low.' },
        ],
        incident: { isFlagged: false, isUnanonymized: false },
      },
      {
        id: 'sub-10',
        surveyId: 'srv-1',
        surveyTitle: 'Q3 Regional Junior Doctor Rota & Workload Review',
        traineeId: 'usr-trainee-10',
        traineeName: 'Trainee',
        traineeEmail: 'trainee10@nhs.net',
        sectorId: 'sec-ncl',
        hospitalId: 'hosp-uclh',
        hospitalName: 'University College Hospital',
        departmentName: 'Paediatrics & Neonatology',
        grade: 'ST2',
        submittedAt: '2026-09-21 08:30',
        answers: [
          { questionId: 'q1', value: 3 },
          { questionId: 'q2', value: 'Sometimes covered, often short' },
          { questionId: 'q3', value: ['Designated doctor mess with beds'] },
          { questionId: 'q4', value: 'NICU transport shifts can run over with delayed handovers.' },
        ],
        incident: { isFlagged: false, isUnanonymized: false },
      },
      {
        id: 'sub-11',
        surveyId: 'srv-1',
        surveyTitle: 'Q3 Regional Junior Doctor Rota & Workload Review',
        traineeId: 'usr-trainee-11',
        traineeName: 'Trainee',
        traineeEmail: 'trainee11@nhs.net',
        sectorId: 'sec-nel',
        hospitalId: 'hosp-rlh',
        hospitalName: 'The Royal London Hospital',
        departmentName: 'Obstetrics & Gynaecology',
        grade: 'ST3',
        submittedAt: '2026-09-21 11:15',
        answers: [
          { questionId: 'q1', value: 2 },
          { questionId: 'q2', value: 'Rarely covered, unsafe staffing' },
          { questionId: 'q3', value: ['Reclining sleep chairs'] },
          { questionId: 'q4', value: 'Labour ward coordinator shifts have recurrent gaps leading to delayed C-sections.' },
        ],
        incident: {
          isFlagged: true,
          concernSummary: 'Recurrent Middle-grade gaps on Labour Ward resulting in single-doctor cover during emergency inductions.',
          status: 'pending_review',
          isUnanonymized: false,
        },
      },
      {
        id: 'sub-12',
        surveyId: 'srv-1',
        surveyTitle: 'Q3 Regional Junior Doctor Rota & Workload Review',
        traineeId: 'usr-trainee-12',
        traineeName: 'Trainee',
        traineeEmail: 'trainee12@nhs.net',
        sectorId: 'sec-ncl',
        hospitalId: 'hosp-rfh',
        hospitalName: 'Royal Free Hospital',
        departmentName: 'Emergency Medicine (A&E)',
        grade: 'FY2',
        submittedAt: '2026-09-21 14:02',
        answers: [
          { questionId: 'q1', value: 3 },
          { questionId: 'q2', value: 'Sometimes covered, often short' },
          { questionId: 'q3', value: ['Hot food access after 11pm', 'Reclining sleep chairs'] },
          { questionId: 'q4', value: 'A&E corridor queuing impacts rest break compliance.' },
        ],
        incident: { isFlagged: false, isUnanonymized: false },
      },
      {
        id: 'sub-13',
        surveyId: 'srv-1',
        surveyTitle: 'Q3 Regional Junior Doctor Rota & Workload Review',
        traineeId: 'usr-trainee-13',
        traineeName: 'Trainee',
        traineeEmail: 'trainee13@nhs.net',
        sectorId: 'sec-nel',
        hospitalId: 'hosp-barts',
        hospitalName: "St Bartholomew's Hospital",
        departmentName: 'General Surgery',
        grade: 'ST5',
        submittedAt: '2026-09-21 17:35',
        answers: [
          { questionId: 'q1', value: 5 },
          { questionId: 'q2', value: 'Always covered with locum/cover' },
          { questionId: 'q3', value: ['Designated doctor mess with beds', 'Hot food access after 11pm', 'Secure locker space'] },
          { questionId: 'q4', value: 'Smooth surgical service and timely registrar relief.' },
        ],
        incident: { isFlagged: false, isUnanonymized: false },
      },
      {
        id: 'sub-14',
        surveyId: 'srv-1',
        surveyTitle: 'Q3 Regional Junior Doctor Rota & Workload Review',
        traineeId: 'usr-trainee-14',
        traineeName: 'Trainee',
        traineeEmail: 'trainee14@nhs.net',
        sectorId: 'sec-ncl',
        hospitalId: 'hosp-uclh',
        hospitalName: 'University College Hospital',
        departmentName: 'Cardiology',
        grade: 'ST4',
        submittedAt: '2026-09-22 09:20',
        answers: [
          { questionId: 'q1', value: 4 },
          { questionId: 'q2', value: 'Always covered with locum/cover' },
          { questionId: 'q3', value: ['Designated doctor mess with beds', 'Secure locker space'] },
          { questionId: 'q4', value: 'Good CCU consultant rounds.' },
        ],
        incident: { isFlagged: false, isUnanonymized: false },
      },
      {
        id: 'sub-15',
        surveyId: 'srv-1',
        surveyTitle: 'Q3 Regional Junior Doctor Rota & Workload Review',
        traineeId: 'usr-trainee-15',
        traineeName: 'Trainee',
        traineeEmail: 'trainee15@nhs.net',
        sectorId: 'sec-nel',
        hospitalId: 'hosp-rlh',
        hospitalName: 'The Royal London Hospital',
        departmentName: 'Emergency Medicine (A&E)',
        grade: 'FY1',
        submittedAt: '2026-09-22 11:45',
        answers: [
          { questionId: 'q1', value: 2 },
          { questionId: 'q2', value: 'Rarely covered, unsafe staffing' },
          { questionId: 'q3', value: ['None of the above'] },
          { questionId: 'q4', value: 'Need better senior supervision in resus during night shifts.' },
        ],
        incident: { isFlagged: false, isUnanonymized: false },
      }
    ];

    // EXACTLY 9 SUBMISSIONS FOR SURVEY 2 (srv-2)
    const srv2_submissions: SurveySubmission[] = [
      {
        id: 'sub-16',
        surveyId: 'srv-2',
        surveyTitle: 'Senior Clinical Supervision & Induction Quality Review',
        traineeId: 'usr-trainee-16',
        traineeName: 'Trainee',
        traineeEmail: 'trainee16@nhs.net',
        sectorId: 'sec-nwl',
        hospitalId: 'hosp-stmarys',
        hospitalName: "St Mary's Hospital",
        departmentName: 'Paediatrics & Neonatology',
        grade: 'ST3',
        submittedAt: '2026-09-17 10:10',
        answers: [
          { questionId: 'q2-1', value: 4 },
          { questionId: 'q2-2', value: 'Yes, always clear and responsive' },
          { questionId: 'q2-3', value: 'Comprehensive induction manual with clear bleep directory.' },
        ],
        incident: { isFlagged: false, isUnanonymized: false },
      },
      {
        id: 'sub-17',
        surveyId: 'srv-2',
        surveyTitle: 'Senior Clinical Supervision & Induction Quality Review',
        traineeId: 'usr-trainee-17',
        traineeName: 'Trainee',
        traineeEmail: 'trainee17@nhs.net',
        sectorId: 'sec-nwl',
        hospitalId: 'hosp-charing',
        hospitalName: 'Charing Cross Hospital',
        departmentName: 'Acute Internal Medicine',
        grade: 'FY2',
        submittedAt: '2026-09-18 11:40',
        answers: [
          { questionId: 'q2-1', value: 3 },
          { questionId: 'q2-2', value: 'Partially clear' },
          { questionId: 'q2-3', value: 'IT access took 4 days to activate after departmental start.' },
        ],
        incident: { isFlagged: false, isUnanonymized: false },
      },
      {
        id: 'sub-18',
        surveyId: 'srv-2',
        surveyTitle: 'Senior Clinical Supervision & Induction Quality Review',
        traineeId: 'usr-trainee-18',
        traineeName: 'Trainee',
        traineeEmail: 'trainee18@nhs.net',
        sectorId: 'sec-sl',
        hospitalId: 'hosp-stthomas',
        hospitalName: "St Thomas' Hospital",
        departmentName: 'Anaesthetics & Intensive Care',
        grade: 'ST4',
        submittedAt: '2026-09-19 14:15',
        answers: [
          { questionId: 'q2-1', value: 5 },
          { questionId: 'q2-2', value: 'Yes, always clear and responsive' },
          { questionId: 'q2-3', value: 'Outstanding simulation-based induction and consultant availability.' },
        ],
        incident: { isFlagged: false, isUnanonymized: false },
      },
      {
        id: 'sub-19',
        surveyId: 'srv-2',
        surveyTitle: 'Senior Clinical Supervision & Induction Quality Review',
        traineeId: 'usr-trainee-19',
        traineeName: 'Trainee',
        traineeEmail: 'trainee19@nhs.net',
        sectorId: 'sec-sl',
        hospitalId: 'hosp-kings',
        hospitalName: "King's College Hospital (Denmark Hill)",
        departmentName: 'Emergency Medicine (A&E)',
        grade: 'FY1',
        submittedAt: '2026-09-20 09:30',
        answers: [
          { questionId: 'q2-1', value: 2 },
          { questionId: 'q2-2', value: 'No, unclear who to escalate to' },
          { questionId: 'q2-3', value: 'Induction was generic trust video with no department walk-through.' },
        ],
        incident: {
          isFlagged: true,
          concernSummary: 'FY1 rostered as sole junior doctor in paediatric A&E on day 2 without local resuscitation pathway induction.',
          status: 'pending_review',
          isUnanonymized: false,
        },
      },
      {
        id: 'sub-20',
        surveyId: 'srv-2',
        surveyTitle: 'Senior Clinical Supervision & Induction Quality Review',
        traineeId: 'usr-trainee-20',
        traineeName: 'Trainee',
        traineeEmail: 'trainee20@nhs.net',
        sectorId: 'sec-nel',
        hospitalId: 'hosp-rlh',
        hospitalName: 'The Royal London Hospital',
        departmentName: 'General Surgery',
        grade: 'ST3',
        submittedAt: '2026-09-20 16:50',
        answers: [
          { questionId: 'q2-1', value: 4 },
          { questionId: 'q2-2', value: 'Yes, always clear and responsive' },
          { questionId: 'q2-3', value: 'Good laparoscopic handbook and surgical timetable.' },
        ],
        incident: { isFlagged: false, isUnanonymized: false },
      },
      {
        id: 'sub-21',
        surveyId: 'srv-2',
        surveyTitle: 'Senior Clinical Supervision & Induction Quality Review',
        traineeId: 'usr-trainee-21',
        traineeName: 'Trainee',
        traineeEmail: 'trainee21@nhs.net',
        sectorId: 'sec-ncl',
        hospitalId: 'hosp-uclh',
        hospitalName: 'University College Hospital',
        departmentName: 'Obstetrics & Gynaecology',
        grade: 'ST2',
        submittedAt: '2026-09-21 12:20',
        answers: [
          { questionId: 'q2-1', value: 3 },
          { questionId: 'q2-2', value: 'Partially clear' },
          { questionId: 'q2-3', value: 'Clinical ultrasound access was delayed by 2 weeks.' },
        ],
        incident: { isFlagged: false, isUnanonymized: false },
      },
      {
        id: 'sub-22',
        surveyId: 'srv-2',
        surveyTitle: 'Senior Clinical Supervision & Induction Quality Review',
        traineeId: 'usr-trainee-22',
        traineeName: 'Trainee',
        traineeEmail: 'trainee22@nhs.net',
        sectorId: 'sec-nwl',
        hospitalId: 'hosp-stmarys',
        hospitalName: "St Mary's Hospital",
        departmentName: 'Cardiology',
        grade: 'ST5',
        submittedAt: '2026-09-21 15:45',
        answers: [
          { questionId: 'q2-1', value: 5 },
          { questionId: 'q2-2', value: 'Yes, always clear and responsive' },
          { questionId: 'q2-3', value: 'Direct consultant mobile contacts provided on day one.' },
        ],
        incident: { isFlagged: false, isUnanonymized: false },
      },
      {
        id: 'sub-23',
        surveyId: 'srv-2',
        surveyTitle: 'Senior Clinical Supervision & Induction Quality Review',
        traineeId: 'usr-trainee-23',
        traineeName: 'Trainee',
        traineeEmail: 'trainee23@nhs.net',
        sectorId: 'sec-sl',
        hospitalId: 'hosp-stthomas',
        hospitalName: "St Thomas' Hospital",
        departmentName: 'Trauma & Orthopaedics',
        grade: 'FY2',
        submittedAt: '2026-09-22 08:15',
        answers: [
          { questionId: 'q2-1', value: 4 },
          { questionId: 'q2-2', value: 'Yes, always clear and responsive' },
          { questionId: 'q2-3', value: 'Fracture clinic induction was clear and structured.' },
        ],
        incident: { isFlagged: false, isUnanonymized: false },
      },
      {
        id: 'sub-24',
        surveyId: 'srv-2',
        surveyTitle: 'Senior Clinical Supervision & Induction Quality Review',
        traineeId: 'usr-trainee-24',
        traineeName: 'Trainee',
        traineeEmail: 'trainee24@nhs.net',
        sectorId: 'sec-ncl',
        hospitalId: 'hosp-rfh',
        hospitalName: 'Royal Free Hospital',
        departmentName: 'Emergency Medicine (A&E)',
        grade: 'ST4',
        submittedAt: '2026-09-22 10:50',
        answers: [
          { questionId: 'q2-1', value: 4 },
          { questionId: 'q2-2', value: 'Yes, always clear and responsive' },
          { questionId: 'q2-3', value: 'Helpful ultrasound training module during induction.' },
        ],
        incident: { isFlagged: false, isUnanonymized: false },
      }
    ];

    return [...srv1_submissions, ...srv2_submissions];
  }

  private loadInitialRepRequests(): RepApprovalRequest[] {
    const stored = localStorage.getItem(STORAGE_KEY_REPS);
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return [
      {
        id: 'req-1',
        userId: 'usr-new-rep',
        name: 'Trainee Rep Candidate',
        email: 'candidate.rep@nhs.net',
        gmcNumber: '7482910',
        currentHospital: 'The Royal London Hospital',
        trainingGrade: 'ST5',
        requestedSectors: ['sec-nel'],
        submittedAt: '2026-09-18 09:12',
        status: 'pending',
        gmcVerified: true,
      },
      {
        id: 'req-2',
        userId: 'usr-rep-2',
        name: 'Regional Rep',
        email: 'rep.nwl@nhs.net',
        gmcNumber: '6829103',
        currentHospital: "St Mary's Hospital",
        trainingGrade: 'ST6',
        requestedSectors: ['sec-nwl'],
        submittedAt: '2026-09-02 11:45',
        status: 'approved',
        gmcVerified: true,
      }
    ];
  }

  private loadInitialAuditLogs(): AuditLogEntry[] {
    const stored = localStorage.getItem(STORAGE_KEY_AUDIT);
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return [
      {
        id: 'aud-1',
        timestamp: '2026-09-10 10:00:00',
        adminName: 'Admin',
        action: 'SYSTEM_INITIALIZED',
        targetId: 'SYS_GOVERNANCE',
        justification: 'London Regional Trainee Feedback Platform baseline initialized with London sectors.',
        details: 'Initial regional sectors and trust hierarchies registered.',
      }
    ];
  }

  saveSectors() { localStorage.setItem(STORAGE_KEY_SECTORS, JSON.stringify(this.sectors())); }
  saveTrusts() { localStorage.setItem(STORAGE_KEY_TRUSTS, JSON.stringify(this.trusts())); }
  saveHospitals() { localStorage.setItem(STORAGE_KEY_HOSPITALS, JSON.stringify(this.hospitals())); }
  saveSurveys() { localStorage.setItem(STORAGE_KEY_SURVEYS, JSON.stringify(this.surveys())); }
  saveSubmissions() { localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(this.submissions())); }
  saveRepRequests() { localStorage.setItem(STORAGE_KEY_REPS, JSON.stringify(this.repApprovals())); }
  saveAuditLogs() { localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(this.auditLogs())); }

  resetDemoData() {
    localStorage.removeItem(STORAGE_KEY_SECTORS);
    localStorage.removeItem(STORAGE_KEY_TRUSTS);
    localStorage.removeItem(STORAGE_KEY_HOSPITALS);
    localStorage.removeItem(STORAGE_KEY_SURVEYS);
    localStorage.removeItem(STORAGE_KEY_SUBMISSIONS);
    localStorage.removeItem(STORAGE_KEY_REPS);
    localStorage.removeItem(STORAGE_KEY_AUDIT);

    this.sectors.set(this.loadInitialSectors());
    this.trusts.set(this.loadInitialTrusts());
    this.hospitals.set(this.loadInitialHospitals());
    this.surveys.set(this.loadInitialSurveys());
    this.submissions.set(this.loadInitialSubmissions());
    this.repApprovals.set(this.loadInitialRepRequests());
    this.auditLogs.set(this.loadInitialAuditLogs());
  }

  // Admin Hierarchy Management: Hospitals & Trusts
  addHospital(hospital: Hospital) {
    this.hospitals.update(list => [...list, hospital]);
    this.saveHospitals();
  }

  removeHospital(hospitalId: string) {
    this.hospitals.update(list => list.filter(h => h.id !== hospitalId));
    this.saveHospitals();
  }

  addTrust(trust: Trust) {
    this.trusts.update(list => [...list, trust]);
    this.saveTrusts();
  }

  removeTrust(trustId: string) {
    this.trusts.update(list => list.filter(t => t.id !== trustId));
    this.saveTrusts();
  }

  // Analytics Engine
  getFilteredSubmissions(filter: AnalyticsFilterQuery): SurveySubmission[] {
    return this.submissions().filter((sub) => {
      if (filter.surveyId && sub.surveyId !== filter.surveyId) return false;
      if (filter.sectorIds && filter.sectorIds.length > 0 && !filter.sectorIds.includes(sub.sectorId)) return false;
      if (filter.hospitalIds && filter.hospitalIds.length > 0 && !filter.hospitalIds.includes(sub.hospitalId)) return false;
      if (filter.departmentNames && filter.departmentNames.length > 0 && !filter.departmentNames.includes(sub.departmentName)) return false;
      if (filter.grades && filter.grades.length > 0 && !filter.grades.includes(sub.grade)) return false;
      if (filter.onlyFlagged && !sub.incident.isFlagged) return false;
      if (filter.searchKeyword && filter.searchKeyword.trim() !== '') {
        const kw = filter.searchKeyword.toLowerCase();
        const matchesComment = sub.answers.some(a => String(a.value).toLowerCase().includes(kw));
        const matchesHospital = sub.hospitalName.toLowerCase().includes(kw);
        const matchesDept = sub.departmentName.toLowerCase().includes(kw);
        if (!matchesComment && !matchesHospital && !matchesDept) return false;
      }
      return true;
    });
  }

  getAnalyticsSummary(filter: AnalyticsFilterQuery): AnalyticsSummaryResponse {
    const list = this.getFilteredSubmissions(filter);
    const totalSubmissions = list.length;
    // Cohort: 20 for survey 1, 12 for survey 2, or total 32
    const totalEligibleTrainees = filter.surveyId === 'srv-1' ? 20 : (filter.surveyId === 'srv-2' ? 12 : 32);
    const responseRatePercentage = Math.round((totalSubmissions / (totalEligibleTrainees || 1)) * 100);

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let ratingSum = 0;
    let ratingCount = 0;
    let safeStaffingCount = 0;
    let staffingQuestionCount = 0;

    list.forEach(sub => {
      sub.answers.forEach(ans => {
        if (typeof ans.value === 'number' && ans.value >= 1 && ans.value <= 5) {
          ratingDistribution[ans.value] = (ratingDistribution[ans.value] || 0) + 1;
          ratingSum += ans.value;
          ratingCount++;
        }
        if (ans.questionId === 'q2') {
          staffingQuestionCount++;
          if (ans.value === 'Always covered with locum/cover') {
            safeStaffingCount++;
          }
        }
      });
    });

    const overallSatisfactionScore = ratingCount > 0 ? Number((ratingSum / ratingCount).toFixed(1)) : 0;
    const safeStaffingIndex = staffingQuestionCount > 0 ? Math.round((safeStaffingCount / staffingQuestionCount) * 100) : 75;
    const flaggedIncidentsCount = list.filter(s => s.incident.isFlagged).length;

    const deptMap = new Map<string, { count: number, ratingSum: number, ratingCount: number, flagged: number }>();
    list.forEach(sub => {
      const existing = deptMap.get(sub.departmentName) || { count: 0, ratingSum: 0, ratingCount: 0, flagged: 0 };
      existing.count++;
      if (sub.incident.isFlagged) existing.flagged++;
      const r = sub.answers.find(a => typeof a.value === 'number');
      if (r) {
        existing.ratingSum += Number(r.value);
        existing.ratingCount++;
      }
      deptMap.set(sub.departmentName, existing);
    });

    const departmentMetrics: DepartmentMetric[] = Array.from(deptMap.entries()).map(([dept, val]) => ({
      departmentName: dept,
      count: val.count,
      percentage: totalSubmissions > 0 ? Math.round((val.count / totalSubmissions) * 100) : 0,
      averageRating: val.ratingCount > 0 ? Number((val.ratingSum / val.ratingCount).toFixed(1)) : 0,
      flaggedCount: val.flagged,
    })).sort((a, b) => b.count - a.count);

    const hospMap = new Map<string, { count: number, ratingSum: number, ratingCount: number, name: string, trust: string, sector: string }>();
    list.forEach(sub => {
      const hObj = this.hospitals().find(h => h.id === sub.hospitalId);
      const tObj = this.trusts().find(t => t.id === hObj?.trustId);
      const existing = hospMap.get(sub.hospitalId) || {
        count: 0, ratingSum: 0, ratingCount: 0,
        name: sub.hospitalName,
        trust: tObj?.name || 'Healthcare Trust',
        sector: sub.sectorId.replace('sec-', '').toUpperCase()
      };
      existing.count++;
      const r = sub.answers.find(a => typeof a.value === 'number');
      if (r) {
        existing.ratingSum += Number(r.value);
        existing.ratingCount++;
      }
      hospMap.set(sub.hospitalId, existing);
    });

    const hospitalMetrics: HospitalMetric[] = Array.from(hospMap.entries()).map(([hId, val]) => ({
      hospitalId: hId,
      hospitalName: val.name,
      trustName: val.trust,
      sectorCode: val.sector,
      count: val.count,
      averageRating: val.ratingCount > 0 ? Number((val.ratingSum / val.ratingCount).toFixed(1)) : 0,
    }));

    const selectedSurvey = this.surveys().find(s => s.id === (filter.surveyId || 'srv-1')) || this.surveys()[0];
    const questionMetrics: QuestionAnalyticsMetric[] = selectedSurvey.questions.map(q => {
      let qAnswered = 0;
      let qSum = 0;
      const dist: Record<string, number> = {};
      const comments: string[] = [];

      list.forEach(sub => {
        const match = sub.answers.find(a => a.questionId === q.id);
        if (match && match.value !== undefined && match.value !== null && match.value !== '') {
          qAnswered++;
          if (q.type === 'rating' && typeof match.value === 'number') {
            qSum += match.value;
            dist[match.value] = (dist[match.value] || 0) + 1;
          } else if (q.type === 'single_choice' && typeof match.value === 'string') {
            dist[match.value] = (dist[match.value] || 0) + 1;
          } else if (q.type === 'multiple_choice' && Array.isArray(match.value)) {
            match.value.forEach(opt => dist[opt] = (dist[opt] || 0) + 1);
          } else if (q.type === 'text' && typeof match.value === 'string') {
            comments.push(match.value);
          }
        }
      });

      return {
        questionId: q.id,
        questionTitle: q.title,
        type: q.type,
        totalAnswered: qAnswered,
        averageRating: q.type === 'rating' && qAnswered > 0 ? Number((qSum / qAnswered).toFixed(1)) : undefined,
        distribution: dist,
        sampleComments: comments.slice(0, 5),
      };
    });

    const timeline: TimelineDataPoint[] = [
      { date: '12 Sep', count: 1, averageScore: 2.0 },
      { date: '14 Sep', count: 1, averageScore: 4.0 },
      { date: '16 Sep', count: 1, averageScore: 3.0 },
      { date: '17 Sep', count: 2, averageScore: 4.0 },
      { date: '18 Sep', count: 2, averageScore: 4.5 },
      { date: '19 Sep', count: 2, averageScore: 3.0 },
      { date: '20 Sep', count: 4, averageScore: 3.5 },
      { date: '21 Sep', count: 4, averageScore: 3.2 },
      { date: '22 Sep', count: 3, averageScore: 3.0 },
    ];

    return {
      totalSubmissions,
      totalEligibleTrainees,
      responseRatePercentage,
      overallSatisfactionScore,
      safeStaffingIndex,
      flaggedIncidentsCount,
      ratingDistribution,
      departmentMetrics,
      hospitalMetrics,
      questionMetrics,
      timeline,
    };
  }

  // Export Engine: Simple Excel / CSV Export
  exportSurveyData(req: ExportRequest): { filename: string, content: string, metadata: ExportReportMetadata } {
    const list = this.getFilteredSubmissions(req.filter);
    const dateStr = new Date().toISOString().split('T')[0];
    const timestampStr = new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-GB');

    const headers = [
      'Submission ID',
      'Survey Title',
      'Sector',
      'Hospital',
      'Department',
      'Grade',
      'Submission Date',
      'Safety Concern Flagged',
      'Incident Summary',
      'Author Identity',
      'Answers Summary'
    ];

    const rows = list.map(sub => {
      const authorText = req.anonymized
        ? 'Anonymous'
        : `"${sub.traineeName} (${sub.traineeEmail})"`;

      const concernText = sub.incident.isFlagged
        ? `"${(sub.incident.concernSummary || '').replace(/"/g, '""')}"`
        : '"None"';

      const answersSummary = sub.answers.map(a => `${a.questionId}: ${Array.isArray(a.value) ? a.value.join(';') : a.value}`).join(' | ');

      return [
        sub.id,
        `"${sub.surveyTitle}"`,
        sub.sectorId.replace('sec-', '').toUpperCase(),
        `"${sub.hospitalName}"`,
        `"${sub.departmentName}"`,
        sub.grade,
        sub.submittedAt,
        sub.incident.isFlagged ? 'YES' : 'NO',
        concernText,
        authorText,
        `"${answersSummary.replace(/"/g, '""')}"`
      ].join(',');
    });

    const content = headers.join(',') + '\n' + rows.join('\n');
    const filename = `NHS_Trainee_Feedback_${dateStr}.csv`;

    return {
      filename,
      content,
      metadata: {
        filename,
        fileSizeBytes: new Blob([content]).size,
        rowCount: list.length,
        generatedAt: timestampStr,
        format: 'csv'
      }
    };
  }

  addSurvey(survey: Survey) {
    this.surveys.update((list) => [survey, ...list]);
    this.saveSurveys();
  }

  addSubmission(submission: SurveySubmission) {
    this.submissions.update((list) => [submission, ...list]);
    this.surveys.update((list) =>
      list.map((s) => (s.id === submission.surveyId ? { ...s, responseCount: s.responseCount + 1 } : s))
    );
    this.saveSubmissions();
    this.saveSurveys();
  }

  updateIncidentStatus(submissionId: string, status: IncidentStatus) {
    this.submissions.update((list) =>
      list.map((sub) =>
        sub.id === submissionId
          ? { ...sub, incident: { ...sub.incident, status } }
          : sub
      )
    );
    this.saveSubmissions();
  }

  removeSafetyFlag(submissionId: string) {
    this.submissions.update((list) =>
      list.map((sub) =>
        sub.id === submissionId
          ? { ...sub, incident: { ...sub.incident, isFlagged: false, status: 'resolved' } }
          : sub
      )
    );
    this.saveSubmissions();
  }

  unanonymizeSubmission(submissionId: string, adminName: string, justification: string) {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    this.submissions.update((list) =>
      list.map((sub) => {
        if (sub.id === submissionId) {
          return {
            ...sub,
            incident: {
              ...sub.incident,
              isUnanonymized: true,
              unanonymizedAt: timestamp,
              unanonymizedBy: adminName,
              unanonymizedReason: justification,
            },
          };
        }
        return sub;
      })
    );

    const logEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp,
      adminName,
      action: 'DE_ANONYMIZATION',
      targetId: submissionId,
      justification,
      details: `Admin unlocked trainee identity for submission ${submissionId}.`,
    };
    this.auditLogs.update((logs) => [logEntry, ...logs]);

    this.saveSubmissions();
    this.saveAuditLogs();
  }

  approveRep(requestId: string) { this.approveRepRequest(requestId); }
  approveRepRequest(requestId: string) {
    this.repApprovals.update((list) =>
      list.map((r) => (r.id === requestId ? { ...r, status: 'approved' } : r))
    );
    this.saveRepRequests();
  }

  rejectRep(requestId: string) { this.rejectRepRequest(requestId); }
  rejectRepRequest(requestId: string) {
    this.repApprovals.update((list) =>
      list.map((r) => (r.id === requestId ? { ...r, status: 'rejected' } : r))
    );
    this.saveRepRequests();
  }
}
