import { describe, expect, it } from 'vitest';
import { hashKey } from '@core/domain/jobOffers';
import { parseCsv } from '@shared/utils/csv';

describe('hashKey dedup', () => {
  it('dedupes same title/company/applyUrl', () => {
    const a = hashKey(['Title', 'Company', 'https://apply']);
    const b = hashKey(['title', 'company', 'https://apply']);
    expect(a).toEqual(b);
  });
});

describe('CSV parse', () => {
  it('parses simple CSV rows', () => {
    const csv = 'title,company,location\nDev,ACME,Remote';
    const rows = parseCsv(csv);
    expect(rows[0].title).toBe('Dev');
    expect(rows[0].company).toBe('ACME');
  });
});
