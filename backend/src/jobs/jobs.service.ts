import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './entities/job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { JobStatus, JobType, isValidTransition } from './jobs.enum';
import { JobsGateway } from './jobs.gateway';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    private readonly jobsGateway: JobsGateway,
  ) {}

  /**
   * Create a new job (Status defaults to PENDING)
   */
  async create(createJobDto: CreateJobDto): Promise<Job> {
    const job = this.jobRepository.create({
      title: createJobDto.title.trim(),
      type: createJobDto.type || JobType.EMAIL_NOTIFICATION,
      status: JobStatus.PENDING,
    });

    const savedJob = await this.jobRepository.save(job);
    this.logger.log(`Created job: [${savedJob.id}] "${savedJob.title}"`);
    
    // Broadcast real-time WebSocket notification
    this.jobsGateway.notifyJobCreated(savedJob);
    this.broadcastCounts();

    return savedJob;
  }

  /**
   * Get all jobs, optional filter by status
   */
  async findAll(status?: JobStatus): Promise<Job[]> {
    const query = this.jobRepository.createQueryBuilder('job');

    if (status) {
      query.where('job.status = :status', { status });
    }

    return query.orderBy('job.createdAt', 'DESC').getMany();
  }

  /**
   * Get job by ID
   */
  async findOne(id: string): Promise<Job> {
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException(`Job with ID "${id}" not found`);
    }
    return job;
  }

  /**
   * Get count of jobs grouped by status
   */
  async getStatusCounts(): Promise<Record<JobStatus, number>> {
    const rawCounts = await this.jobRepository
      .createQueryBuilder('job')
      .select('job.status', 'status')
      .addSelect('COUNT(job.id)', 'count')
      .groupBy('job.status')
      .getRawMany();

    const counts: Record<JobStatus, number> = {
      [JobStatus.PENDING]: 0,
      [JobStatus.RUNNING]: 0,
      [JobStatus.COMPLETED]: 0,
      [JobStatus.FAILED]: 0,
    };

    for (const row of rawCounts) {
      if (row.status in counts) {
        counts[row.status as JobStatus] = parseInt(row.count, 10);
      }
    }

    return counts;
  }

  /**
   * Update Job Status with Atomic Concurrency Protection & Strict State Machine Logic
   */
  async updateStatus(id: string, newStatus: JobStatus): Promise<Job> {
    // 1. Fetch current state of job
    const job = await this.findOne(id);
    const currentStatus = job.status;

    // 2. Validate state machine rule
    if (!isValidTransition(currentStatus, newStatus)) {
      throw new BadRequestException(
        `Invalid state transition: Cannot change status from "${currentStatus}" to "${newStatus}". Allowed transitions from "${currentStatus}": [${
          currentStatus === JobStatus.PENDING
            ? 'running'
            : currentStatus === JobStatus.RUNNING
            ? 'completed, failed'
            : 'none (terminal state)'
        }]`,
      );
    }

    // 3. Execute ATOMIC SQL UPDATE to handle Race Conditions
    // We only update IF status is STILL currentStatus at the moment the query hits the DB
    const updateResult = await this.jobRepository
      .createQueryBuilder()
      .update(Job)
      .set({
        status: newStatus,
        updatedAt: new Date(),
      })
      .where('id = :id AND status = :expectedStatus', {
        id,
        expectedStatus: currentStatus,
      })
      .execute();

    // If 0 rows were updated, another concurrent request changed the status first!
    if (updateResult.affected === 0) {
      this.logger.warn(
        `Race condition detected on Job [${id}]! Another request updated status concurrently.`,
      );
      throw new ConflictException(
        `Concurrency Conflict: Job [${id}] was modified by another concurrent request or tab. Current status is no longer "${currentStatus}".`,
      );
    }

    // 4. Retrieve updated entity
    const updatedJob = await this.findOne(id);
    this.logger.log(`Job [${id}] status transitioned: ${currentStatus} -> ${newStatus}`);

    // Notify WebSockets
    this.jobsGateway.notifyJobUpdated(updatedJob);
    this.broadcastCounts();

    // 5. Bonus Feature: If job moved to RUNNING, simulate background execution
    if (newStatus === JobStatus.RUNNING) {
      this.simulateJobProcessing(id);
    }

    return updatedJob;
  }

  /**
   * Delete a job by ID
   */
  async delete(id: string): Promise<{ message: string }> {
    const job = await this.findOne(id);
    await this.jobRepository.remove(job);

    this.logger.log(`Deleted job [${id}]`);
    this.jobsGateway.notifyJobDeleted(id);
    this.broadcastCounts();

    return { message: `Job [${id}] deleted successfully` };
  }

  /**
   * Broadcast updated counts over WebSockets
   */
  private async broadcastCounts() {
    try {
      const counts = await this.getStatusCounts();
      this.jobsGateway.notifyCountsUpdated(counts);
    } catch (err) {
      this.logger.error('Failed to broadcast counts:', err);
    }
  }

  /**
   * Simulated Background Queue Processing (Bonus Feature)
   * Automatically transitions a RUNNING job to COMPLETED (or FAILED) after 4 seconds.
   */
  private simulateJobProcessing(jobId: string) {
    const processingTime = 4000; // 4 seconds delay
    this.logger.log(`Background worker picked up Job [${jobId}]. Processing for ${processingTime / 1000}s...`);

    setTimeout(async () => {
      try {
        const job = await this.jobRepository.findOne({ where: { id: jobId } });
        if (job && job.status === JobStatus.RUNNING) {
          // 90% chance of completed, 10% chance of failed
          const targetStatus = Math.random() > 0.1 ? JobStatus.COMPLETED : JobStatus.FAILED;

          await this.jobRepository
            .createQueryBuilder()
            .update(Job)
            .set({ status: targetStatus, updatedAt: new Date() })
            .where('id = :id AND status = :expectedStatus', {
              id: jobId,
              expectedStatus: JobStatus.RUNNING,
            })
            .execute();

          const finalJob = await this.findOne(jobId);
          this.logger.log(`Background worker finished Job [${jobId}] -> Result: ${targetStatus}`);

          this.jobsGateway.notifyJobUpdated(finalJob);
          this.broadcastCounts();
        }
      } catch (err) {
        this.logger.error(`Error during background job processing for [${jobId}]:`, err);
      }
    }, processingTime);
  }
}
