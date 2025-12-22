import '../components/ac-button';
import '../components/ac-icon';
import '../components/ac-progress';
import '../components/ac-skeleton';

import dayjs from 'dayjs';
import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { BaseComponent } from '../components/base';
import { getState, startCheckIn, subscribe } from '../state/store';

@customElement('home-page')
export class HomePage extends BaseComponent {
  @state() declare ready: boolean;
  @state() declare jobs: ReturnType<typeof getState>['jobs'];
  @state() declare employeeName: string;

  private unsub?: () => void;

  connectedCallback(): void {
    super.connectedCallback();
    const state = getState();
    this.ready = state.ready;
    this.jobs = state.jobs;
    this.employeeName = state.employee?.name ?? 'Fran';
    this.unsub = subscribe((s) => {
      this.ready = s.ready;
      this.jobs = s.jobs;
      this.employeeName = s.employee?.name ?? 'Fran';
    });
  }

  disconnectedCallback(): void {
    this.unsub?.();
  }

  private go(path: string) {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  private nextJobs() {
    return this.jobs
      .filter((job) => dayjs(job.scheduledAt).isAfter(dayjs().subtract(1, 'day')))
      .slice(0, 4);
  }

  render() {
    const todayJobs = this.nextJobs();
    const next = todayJobs[0];

    return html`
      <section class="fade-up max-w-[560px] mx-auto space-y-3">
        <div class="px-1">
          <h1 class="text-xl font-semibold text-strong">Hoy, ${this.employeeName}</h1>
          <p class="text-sm text-muted">Resumen rápido</p>
        </div>

        <div class="rounded-2xl p-4" style="background: var(--surface); border: 1px solid var(--border);">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium">Próximo servicio</p>
              ${!this.ready
                ? html`<div class="mt-2 space-y-2">
                    <ac-skeleton width="260" height="14"></ac-skeleton>
                    <ac-skeleton width="210" height="12"></ac-skeleton>
                  </div>`
                : next
                  ? html`
                      <p class="mt-1 text-sm text-muted">
                        ${dayjs(next.scheduledAt).format('HH:mm')} · ${next.type.toUpperCase()}
                      </p>
                      <p class="text-sm text-muted">${next.price.amount}€ · ${next.durationEstimate} min</p>
                    `
                  : html`<p class="mt-1 text-sm text-muted">Sin servicios próximos</p>`}
            </div>
            <div class="flex flex-col gap-2">
              <ac-button
                variant="secondary"
                @click=${() => (next?.id ? this.go(`/jobs/${next.id}`) : this.go('/jobs'))}
              >
                Ver
              </ac-button>
              ${next
                ? html`<ac-button @click=${() => startCheckIn(next.id)}>Iniciar</ac-button>`
                : null}
            </div>
          </div>
        </div>

        <div class="rounded-2xl overflow-hidden" style="background: var(--surface); border: 1px solid var(--border);">
          <div class="px-4 py-3 flex items-center justify-between">
            <p class="font-medium">Próximos</p>
            <button class="chip-btn" @click=${() => this.go('/jobs')}>
              <span class="inline-flex items-center gap-2">
                <ac-icon name="briefcase" size="16"></ac-icon>
                Ver todos
              </span>
            </button>
          </div>
          <div style="border-top: 1px solid var(--border);"></div>
          ${!this.ready
            ? html`<div class="p-4 space-y-3">
                ${Array.from({ length: 3 }).map(
                  () => html`
                    <div class="flex items-center justify-between gap-3">
                      <div class="space-y-2">
                        <ac-skeleton width="180" height="12"></ac-skeleton>
                        <ac-skeleton width="260" height="12"></ac-skeleton>
                      </div>
                      <ac-skeleton width="60" height="12"></ac-skeleton>
                    </div>
                  `
                )}
              </div>`
            : todayJobs.length === 0
              ? html`<div class="px-4 py-6 text-center text-sm text-muted">Nada por aquí.</div>`
              : todayJobs.map((job, idx) => {
                  const when = dayjs(job.scheduledAt).format('DD MMM · HH:mm');
                  const progress = job.status === 'done' ? 100 : job.status === 'in_progress' ? 60 : 30;
                  return html`
                    <button
                      class="w-full text-left px-4 py-3 hover:bg-black/5 dark:hover:bg-white/10 transition"
                      style=${idx === todayJobs.length - 1 ? '' : 'border-bottom: 1px solid var(--border);'}
                      @click=${() => this.go(`/jobs/${job.id}`)}
                    >
                      <div class="flex items-start justify-between gap-3">
                        <div>
                          <p class="text-sm font-medium capitalize">${job.type}</p>
                          <p class="text-xs text-muted">${when} · ${job.durationEstimate} min</p>
                        </div>
                        <p class="text-sm font-semibold text-strong">${job.price.amount}€</p>
                      </div>
                      <div class="mt-2">
                        <ac-progress value=${progress}></ac-progress>
                      </div>
                    </button>
                  `;
                })}
        </div>
      </section>
    `;
  }
}

