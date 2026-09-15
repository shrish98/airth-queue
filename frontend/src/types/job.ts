export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

export type JobType =
  | 'EMAIL_NOTIFICATION'
  | 'DATA_EXPORT'
  | 'REPORT_GENERATION'
  | 'IMAGE_PROCESSING'
  | 'DATABASE_BACKUP';

export interface Job {
  id: string;
  title: string;
  type: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  version?: number;
}

export interface JobCounts {
  pending: number;
  running: number;
  completed: number;
  failed: number;
}

export interface ApiErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string | string[];
  error?: string;
}
