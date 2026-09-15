import { Job, JobCounts, JobStatus } from '../types/job';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    const errorMsg = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message || 'An unexpected error occurred';
    const error = new Error(errorMsg);
    (error as any).status = response.status;
    (error as any).data = data;
    throw error;
  }
  return data as T;
}

export const jobApi = {
  async getJobs(statusFilter?: string): Promise<Job[]> {
    const url = new URL(`${API_BASE_URL}/jobs`);
    if (statusFilter && statusFilter !== 'all') {
      url.searchParams.append('status', statusFilter);
    }
    const res = await fetch(url.toString());
    return handleResponse<Job[]>(res);
  },

  async getCounts(): Promise<JobCounts> {
    const res = await fetch(`${API_BASE_URL}/jobs/counts`);
    return handleResponse<JobCounts>(res);
  },

  async createJob(payload: { title: string; type?: string }): Promise<Job> {
    const res = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<Job>(res);
  },

  async updateJobStatus(id: string, status: JobStatus): Promise<Job> {
    const res = await fetch(`${API_BASE_URL}/jobs/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return handleResponse<Job>(res);
  },

  async deleteJob(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string }>(res);
  },

  // Helper for simulating race conditions
  async triggerSimultaneousStatusUpdate(
    id: string,
    targetStatus: JobStatus,
  ): Promise<[PromiseSettledResult<Job>, PromiseSettledResult<Job>]> {
    const req1 = this.updateJobStatus(id, targetStatus);
    const req2 = this.updateJobStatus(id, targetStatus);

    return Promise.allSettled([req1, req2]);
  },
};
