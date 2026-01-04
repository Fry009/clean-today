import { FetcherPort } from '@core/ports/fetchers';
import { JobPosting, Source } from '@core/entities/types';

export class OpenApiFetcher implements FetcherPort {
  async fetchSource(source: Source): Promise<JobPosting[]> {
    console.warn('OpenApiFetcher not implemented for source', source.name);
    return [];
  }
}
