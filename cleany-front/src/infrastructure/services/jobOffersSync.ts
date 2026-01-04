import { FetchEnabledSourcesUseCase } from '@application/usecases/FetchEnabledSourcesUseCase';

export class JobOffersSync {
  private timer?: number;

  constructor(private readonly fetchUseCase: FetchEnabledSourcesUseCase) {}

  async runOnce() {
    return this.fetchUseCase.execute();
  }

  startAuto(intervalMs = 5 * 60 * 1000) {
    this.stopAuto();
    this.timer = window.setInterval(() => {
      this.fetchUseCase.execute().catch((err) => console.warn('Auto sync failed', err));
    }, intervalMs);
  }

  stopAuto() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }
}
