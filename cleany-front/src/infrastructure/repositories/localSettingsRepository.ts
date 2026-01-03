import { AppSettings, SettingsRepository } from '@core/ports/repositories';

import { db } from '../storage/dexieClient';

const defaultSettings: AppSettings = {
  theme: 'light',
  language: 'es',
  demoMode: true,
  accent: 'ocean',
  plan: 'FREE',
  referralCode: undefined,
  trialEndsAt: undefined
};

export class LocalSettingsRepository implements SettingsRepository {
  async getSettings(): Promise<AppSettings> {
    const stored = await db.settings.get('app');
    return { ...defaultSettings, ...(stored?.value as Partial<AppSettings>) };
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    await db.settings.put({ id: 'app', value: settings });
  }
}
