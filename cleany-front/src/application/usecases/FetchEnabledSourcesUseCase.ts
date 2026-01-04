import { JobPostingRepository, SourceRepository } from '@core/ports/repositories';
import { FetcherPort } from '@core/ports/fetchers';
import { hashKey } from '@core/domain/jobOffers';
import { JobPosting } from '@core/entities/types';

export class FetchEnabledSourcesUseCase {
  constructor(
    private readonly sourceRepo: SourceRepository,
    private readonly jobRepo: JobPostingRepository,
    private readonly fetcher: FetcherPort
  ) {}

  async execute(): Promise<{ added: number; total: number }> {
    const sources = await this.sourceRepo.listEnabled();
    let added = 0;
    const now = new Date().toISOString();

    for (const source of sources) {
      try {
        const postings = await this.fetcher.fetchSource(source);
        const deduped = dedupPostings(postings);
        await this.jobRepo.upsertMany(deduped);
        await this.sourceRepo.upsert({ ...source, lastFetchedAt: now });
        added += deduped.length;
      } catch (error) {
        console.warn('Source failed', source.name, error);
        await this.sourceRepo.disable(source.id);
      }
    }
    return { added, total: sources.length };
  }
}

function dedupPostings(items: JobPosting[]): JobPosting[] {
  const seen = new Set<string>();
  const result: JobPosting[] = [];
  for (const item of items) {
    const key = hashKey([item.title, item.company, item.applyUrl]);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}
