import { JobPosting, RemoteType } from '@core/entities/types';
import { JobPostingRepository } from '@core/ports/repositories';
import { db } from '../storage/dexieClient';
import { normalizeText } from '@core/domain/jobOffers';

export class DexieJobPostingRepository implements JobPostingRepository {
  async upsertMany(postings: JobPosting[]): Promise<void> {
    await db.jobPostings.bulkPut(postings);
  }

  async list(filters?: {
    text?: string;
    location?: string;
    province?: string;
    country?: string;
    remoteType?: RemoteType;
    tags?: string[];
    sourceName?: string;
    favorites?: boolean;
  }): Promise<JobPosting[]> {
    const all = await db.jobPostings.orderBy('publishedAt').reverse().toArray();
    return all.filter((item) => {
      if (filters?.favorites && !item.favorite) return false;
      if (filters?.location && !normalizeText(item.location).includes(normalizeText(filters.location))) return false;
      if (filters?.province && !normalizeText(item.province ?? '').includes(normalizeText(filters.province))) return false;
      if (filters?.country && !normalizeText(item.country ?? '').includes(normalizeText(filters.country))) return false;
      if (filters?.remoteType && item.remoteType !== filters.remoteType) return false;
      if (filters?.sourceName && item.sourceName !== filters.sourceName) return false;
      if (filters?.tags && filters.tags.length > 0) {
        const hasAll = filters.tags.every((t) => item.tags.includes(t));
        if (!hasAll) return false;
      }
      if (filters?.text) {
        const t = normalizeText(filters.text);
        const haystack = normalizeText(`${item.title} ${item.company} ${item.location} ${item.descriptionSnippet ?? ''}`);
        if (!haystack.includes(t)) return false;
      }
      return true;
    });
  }

  async getById(id: string): Promise<JobPosting | undefined> {
    return db.jobPostings.get(id);
  }

  async markFavorite(id: string, favorite: boolean): Promise<void> {
    await db.jobPostings.update(id, { favorite });
  }
}
