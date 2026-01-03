import { EvidenceRepository, OutboxRepository } from '@core/ports/repositories';
import dayjs from 'dayjs';
import { v4 as uuid } from 'uuid';

export class CaptureClientSignature {
  constructor(
    private readonly evidenceRepo: EvidenceRepository,
    private readonly outbox: OutboxRepository
  ) {}

  async execute(jobId: string, signatureData: string): Promise<void> {
    const evidence = (await this.evidenceRepo.getByJob(jobId)) || {
      jobId,
      beforePhotos: [],
      afterPhotos: [],
      checklist: []
    };
    evidence.signature = signatureData;
    await this.evidenceRepo.save(evidence);
    await this.outbox.enqueue({
      id: uuid(),
      type: 'UPLOAD_EVIDENCE',
      payload: { jobId, signature: true },
      createdAt: dayjs().toISOString()
    });
  }
}
