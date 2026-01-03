import { PdfExporter } from '@core/ports/repositories';
import { EvidenceRepository, JobRepository } from '@core/ports/repositories';

export class ExportJobReportPDF {
  constructor(
    private readonly exporter: PdfExporter,
    private readonly jobs: JobRepository,
    private readonly evidence: EvidenceRepository
  ) {}

  async execute(jobId: string): Promise<Blob> {
    const job = await this.jobs.getJob(jobId);
    if (!job) throw new Error('Job no encontrado');
    const evidence = await this.evidence.getByJob(jobId);
    return this.exporter.exportJob(job, evidence);
  }
}
