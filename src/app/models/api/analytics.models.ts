import { QuestionType } from '../nhs.models';

export interface AnalyticsFilterQuery {
  surveyId?: string;
  sectorIds?: string[];
  trustIds?: string[];
  hospitalIds?: string[];
  departmentNames?: string[];
  grades?: string[];
  startDate?: string;
  endDate?: string;
  onlyFlagged?: boolean;
  searchKeyword?: string;
}

export interface DepartmentMetric {
  departmentName: string;
  count: number;
  percentage: number;
  averageRating: number;
  flaggedCount: number;
}

export interface HospitalMetric {
  hospitalId: string;
  hospitalName: string;
  trustName: string;
  sectorCode: string;
  count: number;
  averageRating: number;
}

export interface QuestionAnalyticsMetric {
  questionId: string;
  questionTitle: string;
  type: QuestionType;
  totalAnswered: number;
  averageRating?: number;
  distribution?: Record<string, number>;
  sampleComments?: string[];
}

export interface TimelineDataPoint {
  date: string;
  count: number;
  averageScore: number;
}

export interface AnalyticsSummaryResponse {
  totalSubmissions: number;
  totalEligibleTrainees: number;
  responseRatePercentage: number;
  overallSatisfactionScore: number; // e.g. 3.8 / 5.0
  safeStaffingIndex: number; // e.g. 74%
  flaggedIncidentsCount: number;
  ratingDistribution: Record<number, number>; // { 1: 3, 2: 5, 3: 12, 4: 20, 5: 18 }
  departmentMetrics: DepartmentMetric[];
  hospitalMetrics: HospitalMetric[];
  questionMetrics: QuestionAnalyticsMetric[];
  timeline: TimelineDataPoint[];
}
