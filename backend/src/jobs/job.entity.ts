import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  VersionColumn,
} from 'typeorm';

export enum JobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column()
  type!: string;

  @Column({
    type: 'text',
    default: JobStatus.PENDING,
  })
  status!: JobStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @VersionColumn()
  version!: number;
}