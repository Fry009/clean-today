import { OpportunityStatus, TrackedOpportunity } from '@core/entities/types';
import { TrackedOpportunityRepository } from '@core/ports/repositories';

import { db } from '../storage/dexieClient';

const STORAGE_KEY = 'tracked_opportunities';

const readLocal = (): TrackedOpportunity[] => {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TrackedOpportunity[]) : [];
  } catch (_e) {
    return [];
  }
};

const writeLocal = (list: TrackedOpportunity[]) => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(-500)));
  } catch (_e) {
    // ignore
  }
};

export class LocalTrackedOpportunityRepository implements TrackedOpportunityRepository {
  private useLocalStorage = false;

  private async withDexie<T>(fn: () => Promise<T>, fallback: () => T): Promise<T> {
    if (this.useLocalStorage) return fallback();
    try {
      return await fn();
    } catch (_e) {
      this.useLocalStorage = true;
      return fallback();
    }
  }

  async add(opportunity: TrackedOpportunity): Promise<TrackedOpportunity> {
    return this.withDexie(
      async () => {
        await db.trackedOpportunities.put(opportunity);
        return opportunity;
      },
      () => {
        const list = readLocal();
        const next = [...list.filter((item) => item.id !== opportunity.id), opportunity];
        writeLocal(next);
        return opportunity;
      }
    );
  }

  async update(id: string, patch: Partial<TrackedOpportunity>): Promise<TrackedOpportunity | undefined> {
    return this.withDexie(
      async () => {
        const current = await db.trackedOpportunities.get(id);
        if (!current) return undefined;
        const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
        await db.trackedOpportunities.put(next);
        return next;
      },
      () => {
        const list = readLocal();
        const current = list.find((item) => item.id === id);
        if (!current) return undefined;
        const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
        const updated = list.map((item) => (item.id === id ? next : item));
        writeLocal(updated);
        return next;
      }
    );
  }

  async list(filters?: { status?: OpportunityStatus; portal?: string }): Promise<TrackedOpportunity[]> {
    return this.withDexie(
      async () => {
        const items = await db.trackedOpportunities.orderBy('createdAt').reverse().toArray();
        return this.applyFilters(items, filters);
      },
      () => this.applyFilters(readLocal(), filters)
    );
  }

  async getById(id: string): Promise<TrackedOpportunity | undefined> {
    return this.withDexie(
      async () => db.trackedOpportunities.get(id),
      () => readLocal().find((item) => item.id === id)
    );
  }

  async delete(id: string): Promise<void> {
    return this.withDexie(
      async () => {
        await db.trackedOpportunities.delete(id);
      },
      () => {
        const list = readLocal().filter((item) => item.id !== id);
        writeLocal(list);
      }
    );
  }

  async incrementOpenCount(id: string): Promise<TrackedOpportunity | undefined> {
    const now = new Date().toISOString();
    return this.withDexie(
      async () => {
        const current = await db.trackedOpportunities.get(id);
        if (!current) return undefined;
        const next = {
          ...current,
          openCount: (current.openCount ?? 0) + 1,
          lastOpenedAt: now,
          updatedAt: now
        };
        await db.trackedOpportunities.put(next);
        return next;
      },
      () => {
        const list = readLocal();
        const current = list.find((item) => item.id === id);
        if (!current) return undefined;
        const next = {
          ...current,
          openCount: (current.openCount ?? 0) + 1,
          lastOpenedAt: now,
          updatedAt: now
        };
        writeLocal(list.map((item) => (item.id === id ? next : item)));
        return next;
      }
    );
  }

  async findByOutboundUrl(outboundUrl: string): Promise<TrackedOpportunity | undefined> {
    return this.withDexie(
      async () => {
        const all = await db.trackedOpportunities.toArray();
        return all.find((item) => item.outboundUrl === outboundUrl);
      },
      () => readLocal().find((item) => item.outboundUrl === outboundUrl)
    );
  }

  private applyFilters(list: TrackedOpportunity[], filters?: { status?: OpportunityStatus; portal?: string }) {
    return [...list]
      .filter((item) => {
        if (filters?.status && item.status !== filters.status) return false;
        if (filters?.portal && item.portal !== filters.portal) return false;
        return true;
      })
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }
}
