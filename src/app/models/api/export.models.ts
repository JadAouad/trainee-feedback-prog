import { AnalyticsFilterQuery } from './analytics.models';

export type ExportFormat = 'csv' | 'xlsx' | 'pdf' | 'json';

export interface ExportRequest {
  filter: AnalyticsFilterQuery;
  format: ExportFormat;
  includeClinicalGovernanceDisclaimer: boolean;
  anonymized: boolean;
  reportTitle?: string;
}

export interface ExportReportMetadata {
  filename: string;
  fileSizeBytes: number;
  rowCount: number;
  generatedAt: string;
  format: ExportFormat;
  checksum?: string;
}
