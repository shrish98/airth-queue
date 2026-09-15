import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { JobStatus, JobType } from '../jobs.enum';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: JobType.EMAIL_NOTIFICATION,
  })
  type: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: JobStatus.PENDING,
  })
  status: JobStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;
}
