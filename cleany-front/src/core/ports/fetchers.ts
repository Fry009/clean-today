import { JobPosting, Source } from '../entities/types';

export interface FetcherPort {
  fetchSource(source: Source): Promise<JobPosting[]>;
}
