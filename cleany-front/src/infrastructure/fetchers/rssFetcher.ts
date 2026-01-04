import { FetcherPort } from '@core/ports/fetchers';
import { JobPosting } from '@core/entities/types';
import { Source } from '@core/entities/types';
import { hashKey } from '@core/domain/jobOffers';

export class RssFetcher implements FetcherPort {
  async fetchSource(source: Source): Promise<JobPosting[]> {
    if (!source.url) return [];
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(source.url, {
        headers: { 'User-Agent': 'CleanToday/1.0 (+https://example.com)' },
        signal: controller.signal
      }).finally(() => clearTimeout(timeout));
      const text = await res.text();
      const doc = new DOMParser().parseFromString(text, 'text/xml');
      const items = Array.from(doc.querySelectorAll('item, entry'));
      const now = new Date().toISOString();
      return items.map((item) => {
        const title = item.querySelector('title')?.textContent ?? 'Sin titulo';
        const link =
          item.querySelector('link')?.getAttribute('href') ||
          item.querySelector('link')?.textContent ||
          source.url!;
        const company = item.querySelector('author > name')?.textContent || source.name;
        const country = item.querySelector('country')?.textContent || undefined;
        const province = item.querySelector('state')?.textContent || item.querySelector('region')?.textContent || undefined;
        const publishedAt = item.querySelector('pubDate, updated')?.textContent ?? now;
        return {
          id: hashKey([title, company, link]),
          title,
          company,
          location: item.querySelector('location')?.textContent ?? '',
          province,
          country,
          remoteType: undefined,
          salaryText: null,
          publishedAt,
          sourceName: source.name,
          sourceUrl: source.url!,
          applyUrl: link,
          tags: [],
          descriptionSnippet: extractText(item.querySelector('description, summary')?.textContent ?? ''),
          createdAt: now
        } as JobPosting;
      });
    } catch (error) {
      console.warn('RSS fetch failed', source.name, error);
      return [];
    }
  }
}

function extractText(html: string): string {
  if (!html) return '';
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent?.trim() ?? '';
  } catch (_e) {
    return html.replace(/<[^>]+>/g, '').trim();
  }
}
