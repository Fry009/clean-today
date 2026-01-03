import '../components/ac-icon';
import '../components/ac-progress';
import '../components/ac-skeleton';

import dayjs from 'dayjs';
import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { BaseComponent } from '../components/base';
import { getState, subscribe } from '../state/store';

@customElement('jobs-page')
export class JobsPage extends BaseComponent {
  @state() declare ready: boolean;
  @state() declare jobs: ReturnType<typeof getState>['jobs'];
  @state() declare clients: ReturnType<typeof getState>['clients'];
  @state() declare todayOnly: boolean;

  private unsub?: () => void;

  connectedCallback(): void {
    super.connectedCallback();
    const state = getState();
    this.ready = state.ready;
    this.jobs = state.jobs;
    this.clients = state.clients;
    this.todayOnly = true;
    this.unsub = subscribe((s) => {
      this.ready = s.ready;
      this.jobs = s.jobs;
      this.clients = s.clients;
    });
  }

  disconnectedCallback(): void {
    this.unsub?.();
  }

  private go(path: string) {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  render() {
    const clientById = new Map(this.clients.map((c) => [c.id, c]));
    const rows = [...this.jobs]
      .filter((job) => {
        if (!this.todayOnly) return true;
        return dayjs(job.scheduledAt).isSame(dayjs(), 'day');
      })
      .sort((a, b) => (dayjs(a.scheduledAt).isAfter(dayjs(b.scheduledAt)) ? 1 : -1));

    return html`
      <section class="fade-up max-w-[560px] mx-auto">
        <div class="flex items-center justify-between gap-3 mb-3">
          <div>
            <h2 class="text-lg font-semibold text-strong">Jobs</h2>
            <p class="text-sm text-muted">Servicios diarios</p>
          </div>
          <button
            class="chip-btn ${this.todayOnly ? 'selected' : ''}"
            @click=${() => (this.todayOnly = !this.todayOnly)}
          >
            Hoy
          </button>
        </div>

        <div
          class="rounded-2xl overflow-hidden"
          style="background: var(--surface); border: 1px solid var(--border);"
          role="list"
        >
          ${!this.ready
            ? html`
                <div class="p-4 space-y-3">
                  ${Array.from({ length: 6 }).map(
                    () => html`
                      <div class="flex items-center gap-3">
                        <ac-skeleton width="36" height="36" radius="999"></ac-skeleton>
                        <div class="flex-1 space-y-2">
                          <ac-skeleton width="240" height="14"></ac-skeleton>
                          <ac-skeleton width="180" height="12"></ac-skeleton>
                        </div>
                        <ac-skeleton width="20" height="20" radius="8"></ac-skeleton>
                      </div>
                    `
                  )}
                </div>
              `
            : rows.length === 0
              ? html`
                  <div class="p-6 text-center">
                    <p class="text-sm text-muted">No hay jobs para mostrar.</p>
                  </div>
                `
              : rows.map((job, idx) => {
                const clientName = clientById.get(job.clientId)?.name ?? job.clientId;
                const when = dayjs(job.scheduledAt).format('DD MMM · HH:mm');
                const status =
                  job.status === 'done'
                    ? { icon: 'check' as const, color: 'var(--success)' }
                    : job.status === 'canceled'
                      ? { icon: 'x' as const, color: 'var(--danger)' }
                      : job.status === 'in_progress'
                        ? { icon: 'bolt' as const, color: 'var(--accent)' }
                        : { icon: 'minus' as const, color: 'var(--warning)' };
                const progress = Math.min(
                  100,
                  job.status === 'done' ? 100 : job.status === 'in_progress' ? 60 : job.status === 'canceled' ? 0 : 30
                );
                return html`
                  <button
                    class="w-full text-left px-4 py-3 hover:bg-black/5 dark:hover:bg-white/10 transition"
                    style=${idx === rows.length - 1 ? '' : 'border-bottom: 1px solid var(--border);'}
                    role="listitem"
                    @click=${() => this.go(`/jobs/${job.id}`)}
                  >
                    <div class="flex items-center gap-3">
                      <div
                        class="w-9 h-9 rounded-full flex items-center justify-center"
                        style="background: color-mix(in srgb, ${status.color} 10%, var(--surface) 90%); border: 1px solid color-mix(in srgb, ${status.color} 22%, var(--border) 78%);"
                        aria-hidden="true"
                      >
                        <ac-icon name=${status.icon} size="18" color=${status.color}></ac-icon>
                      </div>

                      <div class="flex-1 min-w-0">
                        <div class="flex items-baseline justify-between gap-3">
                          <p class="font-medium capitalize truncate">${job.type}</p>
                          <p class="font-semibold text-strong">${job.price.amount}€</p>
                        </div>
                        <p class="text-sm text-muted truncate">${clientName}</p>
                        <p class="text-xs text-muted mt-1">${when} · ${job.durationEstimate} min</p>
                      </div>

                      <ac-icon name="chevron-right" size="16" color="var(--muted)"></ac-icon>
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
