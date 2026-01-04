import { JobPostingRepository } from '@core/ports/repositories';
import { JobPosting } from '@core/entities/types';
import { parseCsv } from '@shared/utils/csv';
import { hashKey } from '@core/domain/jobOffers';

type CsvRow = {
  title: string;
  company: string;
  location: string;
  applyUrl: string;
  sourceUrl?: string;
  publishedAt?: string;
  tags?: string;
};

export class ImportCsvUseCase {
  constructor(private readonly repo: JobPostingRepository) {}

  async execute(csvText: string): Promise<{ imported: number }> {
    const rows = parseCsv(csvText) as unknown as CsvRow[];
    const postings: JobPosting[] = rows.map((row) => {
      const now = new Date().toISOString();
      return {
        id: hashKey([row.title, row.company, row.applyUrl]),
        title: row.title?.trim() ?? '',
        company: row.company?.trim() ?? '',
        location: row.location?.trim() ?? '',
        province: row.location?.trim() ?? '',
        remoteType: undefined,
        salaryText: null,
        publishedAt: row.publishedAt || now,
        sourceName: 'csv',
        sourceUrl: row.sourceUrl || row.applyUrl || '',
        applyUrl: row.applyUrl || '',
        tags: row.tags ? row.tags.split('|').map((t) => t.trim()).filter(Boolean) : [],
        descriptionSnippet: undefined,
        createdAt: now
      };
    });
    await this.repo.upsertMany(postings);
    return { imported: postings.length };
  }
}
