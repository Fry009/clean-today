import { FeatureFlag } from '@core/entities/types';
import { FeatureFlagRepository } from '@core/ports/repositories';

export class UpgradeToPremium {
  constructor(private readonly flags: FeatureFlagRepository) {}

  async execute(employeeId: string, plan: FeatureFlag['plan']): Promise<FeatureFlag> {
    return this.flags.upgradePlan(employeeId, plan);
  }
}
