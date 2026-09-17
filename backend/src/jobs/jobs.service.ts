import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Job, JobStatus } from './job.entity';

@Injectable()
export class JobsService {
  constructor(@InjectRepository(Job) private readonly repo: Repository<Job>) {}

  create(dto: CreateJobDto) {
    return this.repo.save(this.repo.create({ ...dto, status: JobStatus.PENDING }));
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  private allowed(from: JobStatus, to: JobStatus) {
    return (
      (from === JobStatus.PENDING && [JobStatus.RUNNING, JobStatus.FAILED].includes(to)) ||
      (from === JobStatus.RUNNING && [JobStatus.COMPLETED, JobStatus.FAILED].includes(to))
    );
  }

  async updateStatus(id: string, dto: UpdateStatusDto) {
    const current = await this.repo.findOneBy({ id });
    if (!current) throw new NotFoundException('Job not found');
    if (!this.allowed(current.status, dto.status)) {
      throw new ConflictException(`Invalid transition: ${current.status} → ${dto.status}`);
    }

    // Compare-and-swap update: exactly one stale browser tab can win.
    const result = await this.repo
      .createQueryBuilder()
      .update(Job)
      .set({ status: dto.status, version: () => 'version + 1' })
      .where('id = :id AND version = :version', { id, version: dto.version })
      .execute();

    if (result.affected !== 1) {
      throw new ConflictException('Job changed in another tab. Refresh and try again.');
    }
    return this.repo.findOneByOrFail({ id });
  }

  async remove(id: string) {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundException('Job not found');
    return { deleted: true };
  }
}
