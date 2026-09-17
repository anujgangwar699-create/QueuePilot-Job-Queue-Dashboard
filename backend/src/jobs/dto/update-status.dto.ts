import { IsEnum, IsInt, Min } from 'class-validator';
import { JobStatus } from '../job.entity';

export class UpdateStatusDto {
  @IsEnum(JobStatus) status: JobStatus;
  @IsInt() @Min(1) version: number;
}
