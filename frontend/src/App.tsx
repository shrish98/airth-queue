import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StatusCards } from './components/StatusCards';
import { JobTable } from './components/JobTable';
import { CreateJobModal } from './components/CreateJobModal';
import { RaceConditionModal } from './components/RaceConditionModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { jobApi } from './services/api';
import { Job, JobCounts, JobStatus } from './types/job';
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const App: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [counts, setCounts] = useState<JobCounts>({
    pending: 0,
    running: 0,
    completed: 0,
    failed: 0,
  });
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isRaceModalOpen, setIsRaceModalOpen] = useState<boolean>(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      title,
      message,
    };
    setToasts((prev) => [...prev.slice(-4), newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch Jobs & Counts
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [fetchedJobs, fetchedCounts] = await Promise.all([
        jobApi.getJobs(selectedStatus),
        jobApi.getCounts(),
      ]);
      setJobs(fetchedJobs);
      setCounts(fetchedCounts);
    } catch (err: any) {
      addToast('error', 'API Connection Error', err.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // WebSocket Connection Setup
  useEffect(() => {
    let socket: Socket | null = null;
    try {
      socket = io(API_BASE_URL, {
        reconnectionAttempts: 5,
        timeout: 10000,
      });

      socket.on('connect', () => {
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });

      socket.on('jobCreated', () => {
        fetchData();
      });

      socket.on('jobUpdated', () => {
        fetchData();
      });

      socket.on('jobDeleted', () => {
        fetchData();
      });

      socket.on('countsUpdated', (newCounts: JobCounts) => {
        setCounts(newCounts);
      });
    } catch (err) {
      setIsConnected(false);
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [fetchData]);

  // Handle Create Job
  const handleCreateJob = async (jobData: { title: string; type: string }) => {
    const created = await jobApi.createJob(jobData);
    addToast('success', 'Job Created', `"${created.title}" added to queue as Pending`);
    fetchData();
  };

  // Handle Status Update
  const handleUpdateStatus = async (id: string, newStatus: JobStatus) => {
    try {
      setActionLoadingId(id);
      const updated = await jobApi.updateJobStatus(id, newStatus);
      addToast('success', 'Status Updated', `Job transitioned to "${updated.status}"`);
      fetchData();
    } catch (err: any) {
      const isConflict = err.status === 409;
      addToast(
        'error',
        isConflict ? 'Race Condition Conflict' : 'Invalid Transition',
        err.message,
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Delete Job
  const handleDeleteJob = async (id: string) => {
    try {
      await jobApi.deleteJob(id);
      addToast('info', 'Job Deleted', `Job [${id}] removed from queue`);
      fetchData();
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.message);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50/40 text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Navbar */}
      <Navbar
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenRaceModal={() => setIsRaceModalOpen(true)}
        isConnected={isConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Status Metrics Cards */}
        <StatusCards
          counts={counts}
          selectedStatus={selectedStatus}
          onSelectStatus={(st) => setSelectedStatus(st)}
        />

        {/* Job Queue Table */}
        <JobTable
          jobs={jobs}
          loading={loading}
          onUpdateStatus={handleUpdateStatus}
          onDeleteJob={handleDeleteJob}
          actionLoadingId={actionLoadingId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-orange-100 bg-white/60 py-6 text-center text-xs text-slate-500 font-medium">
        <p>Airth React + NestJS Intern Assignment • Built with React 18 & NestJS TypeORM</p>
      </footer>

      {/* Create Job Modal */}
      <CreateJobModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateJob}
      />

      {/* Race Condition Simulator Modal */}
      <RaceConditionModal
        isOpen={isRaceModalOpen}
        onClose={() => setIsRaceModalOpen(false)}
        onRefresh={fetchData}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
