import { FeatureFlag } from '@core/entities/types';
import { FeatureFlagRepository } from '@core/ports/repositories';

import { db } from '../storage/dexieClient';

export class LocalFeatureFlagRepository implements FeatureFlagRepository {
  private buildEnabled(plan: FeatureFlag['plan']) {
    if (plan === 'PRO_EMPLOYEE') return ['export_pdf', 'kpi_plus', 'smart_tips', 'market_priority'];
    if (plan === 'PRO_TEAM') return ['export_pdf', 'kpi_plus', 'smart_tips', 'team_views', 'market_priority'];
    return [];
  }

  async getPlan(employeeId: string): Promise<FeatureFlag> {
    const stored = await db.settings.get(`flags-${employeeId}`);
    if (stored?.value) return stored.value as FeatureFlag;
    const fallback: FeatureFlag = { plan: 'FREE', enabledFeatures: [] };
    await db.settings.put({ id: `flags-${employeeId}`, value: fallback });
    return fallback;
  }

  async upgradePlan(employeeId: string, plan: FeatureFlag['plan']): Promise<FeatureFlag> {
    const enabled = this.buildEnabled(plan);
    const next: FeatureFlag = { plan, enabledFeatures: enabled, trialEndsAt: undefined };
    await db.settings.put({ id: `flags-${employeeId}`, value: next });
    return next;
  }
}
