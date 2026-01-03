import '../components/ac-button';
import '../components/ac-icon';
import '../components/ac-skeleton';

import dayjs from 'dayjs';
import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { BaseComponent } from '../components/base';
import { getState, subscribe } from '../state/store';

@customElement('home-page')
export class HomePage extends BaseComponent {
  @state() declare ready: boolean;
  @state() declare jobs: ReturnType<typeof getState>['jobs'];
  @state() declare kpis: ReturnType<typeof getState>['kpis'];
  @state() declare employeeName: string;
  @state() declare employeeAvatar?: string;
  @state() declare clients: ReturnType<typeof getState>['clients'];
  @state() declare plan?: string;

  private unsub?: () => void;

  connectedCallback(): void {
    super.connectedCallback();
    const state = getState();
    this.ready = state.ready;
    this.jobs = state.jobs;
    this.kpis = state.kpis;
    this.clients = state.clients;
    this.plan = state.settings.plan;
    this.employeeName = state.employee?.name ?? 'Fran';
    this.employeeAvatar = state.employee?.avatar;
    this.unsub = subscribe((s) => {
      this.ready = s.ready;
      this.jobs = s.jobs;
      this.kpis = s.kpis;
      this.clients = s.clients;
      this.plan = s.settings.plan;
      this.employeeName = s.employee?.name ?? 'Fran';
      this.employeeAvatar = s.employee?.avatar;
    });
  }

  disconnectedCallback(): void {
    this.unsub?.();
  }

  private go(path: string) {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  private computeStats() {
    const now = dayjs();
    const done = this.jobs.filter((j) => j.status === 'done');
    const scheduled = this.jobs.filter((j) => j.status === 'pending' || j.status === 'in_progress');
    const canceled = this.jobs.filter((j) => j.status === 'canceled');
    const revenueLast30 = done
      .filter((j) => dayjs(j.scheduledAt).isAfter(now.subtract(30, 'day')))
      .reduce((acc, j) => acc + j.price.amount, 0);
    const next = this.jobs
      .filter((j) => dayjs(j.scheduledAt).isAfter(now))
      .sort((a, b) => (dayjs(a.scheduledAt).isAfter(dayjs(b.scheduledAt)) ? 1 : -1))[0];
    return {
      done: done.length,
      scheduled: scheduled.length,
      canceled: canceled.length,
      revenueLast30,
      next
    };
  }

  private topClientName() {
    if (!this.clients?.length) return 'Sin datos';
    const counts = new Map<string, number>();
    this.jobs.forEach((job) => counts.set(job.clientId, (counts.get(job.clientId) ?? 0) + 1));
    const [clientId] = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0] ?? [];
    const client = this.clients.find((c) => c.id === clientId);
    return client ? client.name : 'Cliente nuevo';
  }

  private buildInsights() {
    const morning = this.jobs.filter((job) => dayjs(job.scheduledAt).hour() < 14).length;
    const afternoon = this.jobs.filter((job) => dayjs(job.scheduledAt).hour() >= 14).length;
    const busiestDay = this.jobs
      .filter((j) => j.status !== 'canceled')
      .reduce<Record<string, number>>((acc, job) => {
        const day = dayjs(job.scheduledAt).format('dddd');
        acc[day] = (acc[day] ?? 0) + 1;
        return acc;
      }, {});
    const topDay = Object.entries(busiestDay).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Sin definir';
    const nextJob = this.computeStats().next;
    return [
      {
        title: 'Cliente que mas repite',
        detail: this.topClientName()
      },
      {
        title: 'Horarios preferidos',
        detail: morning >= afternoon ? 'Mananas mas solicitadas' : 'Tardes mas solicitadas'
      },
      {
        title: 'Dia con mas movimiento',
        detail: topDay
      },
      {
        title: 'Proximo servicio',
        detail: nextJob ? dayjs(nextJob.scheduledAt).format('DD MMM HH:mm') : 'Nada agendado'
      }
    ];
  }

  private upcomingJobs(limit = 3) {
    const now = dayjs();
    return this.jobs
      .filter((job) => dayjs(job.scheduledAt).isAfter(now.subtract(1, 'day')))
      .sort((a, b) => (dayjs(a.scheduledAt).isAfter(dayjs(b.scheduledAt)) ? 1 : -1))
      .slice(0, limit);
  }

  render() {
    const stats = this.computeStats();
    const insights = this.buildInsights();
    const latestKpi = this.kpis[this.kpis.length - 1];
    const nextJobs = this.upcomingJobs();

    return html`
      <section class="fade-up max-w-[1100px] mx-auto space-y-4 px-1">
        <div
          class="rounded-3xl p-5 md:p-6 space-y-4"
          style="background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 16%, var(--surface) 84%), var(--surface)); border: 1px solid var(--border); box-shadow: var(--shadow);"
        >
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="flex items-center gap-3">
              <img
                class="w-12 h-12 rounded-full border border-[var(--border)] object-cover"
                src=${this.employeeAvatar ?? 'https://i.pravatar.cc/120?img=47'}
                alt="avatar"
              />
              <div>
                <p class="text-sm text-muted">Resumen de descripcion</p>
                <h1 class="text-2xl md:text-3xl font-extrabold text-strong leading-tight">
                  Hola ${this.employeeName}, este es tu dashboard
                </h1>
                <p class="text-sm text-muted">
                  Controla tus servicios, tu progreso y las notas clave de tu jornada.
                </p>
                ${this.plan
                  ? html`<span
                      class="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full text-xs font-semibold"
                      style="background: color-mix(in srgb, var(--accent) 14%, var(--surface) 86%); color: var(--accent-strong);"
                    >
                      <ac-icon name="trophy" size="14" color="var(--accent-strong)"></ac-icon>
                      Plan ${this.plan}
                    </span>`
                  : null}
              </div>
            </div>
            <div class="flex gap-2 flex-wrap">
              <ac-button variant="secondary" @click=${() => this.go('/calendar')}>
                <ac-icon name="calendar" size="16"></ac-icon>
                Calendario
              </ac-button>
              <ac-button @click=${() => this.go('/kpis')}>
                <ac-icon name="graph" size="16"></ac-icon>
                Ver KPIs
              </ac-button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            ${[
              { label: 'Completados', value: stats.done, helper: 'Servicios cerrados', accent: 'var(--accent)' },
              { label: 'Reservados', value: stats.scheduled, helper: 'Agendados o en curso', accent: '#10b981' },
              { label: 'Incidencias', value: stats.canceled, helper: 'Cancelados o con error', accent: '#f97316' },
              { label: 'Ingresos 30d', value: `${stats.revenueLast30}€`, helper: 'Ultimos 30 dias', accent: '#6366f1' }
            ].map(
              (card) => html`
                <div
                  class="rounded-2xl p-4 space-y-1"
                  style="background: color-mix(in srgb, ${card.accent} 8%, var(--surface) 92%); border: 1px solid var(--border);"
                >
                  <p class="text-sm text-muted">${card.helper}</p>
                  <p class="text-2xl font-extrabold text-strong">${card.value}</p>
                  <div
                    class="h-1 rounded-full"
                    style="background: color-mix(in srgb, ${card.accent} 50%, transparent);"
                  ></div>
                </div>
              `
            )}
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div
            class="rounded-2xl p-4 space-y-3"
            style="background: var(--surface); border: 1px solid var(--border);"
          >
            <div class="flex items-center justify-between gap-2">
              <div>
                <p class="text-sm text-muted">Resumen de tus metricas</p>
                <h2 class="text-lg font-semibold text-strong">Estado general</h2>
              </div>
              <button class="chip-btn" @click=${() => this.go('/kpis')}>Detalle</button>
            </div>
            ${!this.ready
              ? html`<div class="space-y-2">
                  <ac-skeleton width="100%" height="16"></ac-skeleton>
                  <ac-skeleton width="92%" height="16"></ac-skeleton>
                  <ac-skeleton width="88%" height="16"></ac-skeleton>
                </div>`
              : html`
                  <div class="space-y-2">
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-muted">Servicios cerrados</span>
                      <span class="font-semibold text-strong">${stats.done}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-muted">Rating medio</span>
                      <span class="font-semibold text-strong">${latestKpi?.avgRating ?? '4.7'}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-muted">Crecimiento semanal</span>
                      <span class="font-semibold text-strong">
                        ${latestKpi ? `${latestKpi.jobsDone} jobs/sem` : 'Al dia'}
                      </span>
                    </div>
                    <div class="rounded-xl p-3 mt-2" style="background: color-mix(in srgb, var(--accent) 8%, transparent);">
                      <p class="text-sm text-muted">Proximo servicio</p>
                      <p class="text-base font-semibold text-strong">
                        ${stats.next
                          ? `${dayjs(stats.next.scheduledAt).format('DD MMM HH:mm')} · ${stats.next.type}`
                          : 'Nada programado'}
                      </p>
                    </div>
                  </div>
                `}
          </div>

          <div
            class="rounded-2xl p-4 space-y-3"
            style="background: var(--surface); border: 1px solid var(--border);"
          >
            <div class="flex items-center justify-between gap-2">
              <div>
                <p class="text-sm text-muted">Cosas interesantes</p>
                <h2 class="text-lg font-semibold text-strong">Notas rapidas</h2>
              </div>
              <button class="chip-btn" @click=${() => this.go('/calendar')}>
                <ac-icon name="calendar" size="14"></ac-icon>
                Ver calendario
              </button>
            </div>
            <div class="space-y-2">
              ${insights.map(
                (insight) => html`
                  <div class="flex items-start gap-3 rounded-xl px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition">
                    <div
                      class="w-2 h-2 rounded-full mt-2"
                      style="background: color-mix(in srgb, var(--accent) 60%, transparent);"
                    ></div>
                    <div>
                      <p class="text-sm font-semibold text-strong">${insight.title}</p>
                      <p class="text-sm text-muted">${insight.detail}</p>
                    </div>
                  </div>
                `
              )}
            </div>
          </div>
        </div>

        <div
          class="rounded-2xl p-4 space-y-3"
          style="background: var(--surface); border: 1px solid var(--border);"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted">Resumen operativo</p>
              <h2 class="text-lg font-semibold text-strong">Agenda y reservas</h2>
            </div>
            <button class="chip-btn" @click=${() => this.go('/jobs')}>
              <ac-icon name="briefcase" size="14"></ac-icon>
              Ver jobs
            </button>
          </div>

          ${!this.ready && nextJobs.length === 0
            ? html`<div class="space-y-2">
                <ac-skeleton width="100%" height="14"></ac-skeleton>
                <ac-skeleton width="92%" height="14"></ac-skeleton>
                <ac-skeleton width="88%" height="14"></ac-skeleton>
              </div>`
            : nextJobs.length === 0
              ? html`<p class="text-sm text-muted">No hay reservas proximas.</p>`
              : nextJobs.map((job, idx) => {
                  const statusColor =
                    job.status === 'done'
                      ? '#10b981'
                      : job.status === 'canceled'
                        ? '#f97316'
                        : 'var(--accent)';
                  return html`
                    <button
                      class="w-full text-left rounded-xl px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition"
                      style=${idx === nextJobs.length - 1 ? '' : 'border-bottom: 1px solid var(--border);'}
                      @click=${() => this.go(`/jobs/${job.id}`)}
                    >
                      <div class="flex items-center justify-between gap-3">
                        <div>
                          <p class="text-sm font-semibold text-strong capitalize">${job.type}</p>
                          <p class="text-xs text-muted">
                            ${dayjs(job.scheduledAt).format('DD MMM HH:mm')} · ${job.durationEstimate} min
                          </p>
                        </div>
                        <div class="flex items-center gap-3">
                          <span class="text-sm font-semibold text-strong">${job.price.amount}€</span>
                          <span
                            class="px-2 py-1 rounded-full text-xs font-semibold"
                            style="background: color-mix(in srgb, ${statusColor} 12%, transparent); color: ${statusColor};"
                          >
                            ${job.status === 'done'
                              ? 'Concluido'
                              : job.status === 'canceled'
                                ? 'Error/Cancelado'
                                : 'Reservado'}
                          </span>
                        </div>
                      </div>
                    </button>
                  `;
                })}
        </div>
      </section>
    `;
  }
}
