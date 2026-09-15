export enum JobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum JobType {
  EMAIL_NOTIFICATION = 'EMAIL_NOTIFICATION',
  DATA_EXPORT = 'DATA_EXPORT',
  REPORT_GENERATION = 'REPORT_GENERATION',
  IMAGE_PROCESSING = 'IMAGE_PROCESSING',
  DATABASE_BACKUP = 'DATABASE_BACKUP',
}

/**
 * Valid transitions defined by business logic:
 * pending   --> running --> completed
 *                       \-> failed
 */
export const ALLOWED_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  [JobStatus.PENDING]: [JobStatus.RUNNING],
  [JobStatus.RUNNING]: [JobStatus.COMPLETED, JobStatus.FAILED],
  [JobStatus.COMPLETED]: [], // Terminal state
  [JobStatus.FAILED]: [],    // Terminal state
};

export function isValidTransition(current: JobStatus, next: JobStatus): boolean {
  const allowed = ALLOWED_TRANSITIONS[current];
  return allowed ? allowed.includes(next) : false;
}
