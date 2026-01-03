import { Evidence } from '@core/entities/types';
import { EvidenceRepository, OutboxRepository } from '@core/ports/repositories';
import dayjs from 'dayjs';
import { v4 as uuid } from 'uuid';

export class AddEvidencePhoto {
  constructor(
    private readonly evidenceRepo: EvidenceRepository,
    private readonly outbox: OutboxRepository
  ) {}

  async execute(jobId: string, photo: string, type: 'before' | 'after'): Promise<Evidence> {
    const evidence = (await this.evidenceRepo.getByJob(jobId)) || {
      jobId,
      beforePhotos: [],
      afterPhotos: [],
      checklist: [],
      comments: ''
    };
    if (type === 'before') evidence.beforePhotos.push(photo);
    else evidence.afterPhotos.push(photo);
    await this.evidenceRepo.save(evidence);
    await this.outbox.enqueue({
      id: uuid(),
      type: 'UPLOAD_EVIDENCE',
      payload: { jobId, photo, kind: type },
      createdAt: dayjs().toISOString()
    });
    return evidence;
  }
}
