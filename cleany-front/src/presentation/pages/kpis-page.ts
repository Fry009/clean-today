import '../components/ac-card';
import '../components/ac-icon';
import '../components/ac-kpi-tile';

import Chart from 'chart.js/auto';
import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { BaseComponent } from '../components/base';
import { computeKpis, getState, subscribe } from '../state/store';
import { portalDefinitions } from '@shared/market/portalUrlBuilders';

@customElement('kpis-page')
export class KpisPage extends BaseComponent {
  @state() declare kpis: ReturnType<typeof getState>['kpis'];
  @state() declare metric: 'jobs' | 'revenue' | 'rating';
  @state() declare period: 'week' | 'month';
  @state() declare opportunities: ReturnType<typeof getState>['opportunities'];
  private chart?: Chart;

  private unsub?: () => void;

  connectedCallback(): void {
    super.connectedCallback();
    this.kpis = getState().kpis;
    this.opportunities = getState().opportunities;
    this.metric = 'jobs';
    this.period = 'week';
    this.unsub = subscribe((s) => {
      this.kpis = s.kpis;
      this.opportunities = s.opportunities;
      this.renderChart();
    });
    queueMicrotask(() => this.renderChart());
  }

  disconnectedCallback(): void {
    this.unsub?.();
    this.chart?.destroy();
  }

  private async renderChart() {
    const canvas = this.querySelector<HTMLCanvasElement>('#kpi-chart');
    if (!canvas) return;
    if (this.chart) this.chart.destroy();

    const rootStyle = getComputedStyle(document.documentElement);
    const accent = rootStyle.getPropertyValue('--accent').trim() || '#0ea5e9';
    const strong = rootStyle.getPropertyValue('--accent-strong').trim() || '#0284c7';
    const muted = rootStyle.getPropertyValue('--muted').trim() || 'rgba(15, 23, 42, 0.62)';

    const labels = this.kpis.map((k) => k.period);
    const data =
      this.metric === 'jobs'
        ? this.kpis.map((k) => k.jobsDone)
        : this.metric === 'revenue'
          ? this.kpis.map((k) => k.revenue)
          : this.kpis.map((k) => k.avgRating);
    const label =
      this.metric === 'jobs' ? 'Servicios' : this.metric === 'revenue' ? 'Ingresos' : 'Rating';

    this.chart = new Chart(canvas, {
      type: this.metric === 'revenue' ? 'bar' : 'line',
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            borderColor: accent,
            backgroundColor: this.metric === 'revenue' ? strong : accent,
            tension: 0.4,
            fill: this.metric !== 'revenue'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: muted }
          },
          x: {
            ticks: { color: muted }
          }
        }
      }
    });
  }

  private async onPeriodChange(period: 'week' | 'month') {
    this.period = period;
    await computeKpis(period);
    this.renderChart();
  }

  private onMetricChange(metric: 'jobs' | 'revenue' | 'rating') {
    this.metric = metric;
    this.renderChart();
  }

  private opportunityStats() {
    const totals = { saved: 0, applied: 0, interview: 0, rejected: 0, opens: 0 };
    const byPortal: Record<string, number> = {};
    this.opportunities.forEach((opp) => {
      totals[opp.status] += 1;
      totals.opens += opp.openCount ?? 0;
      byPortal[opp.portal] = (byPortal[opp.portal] ?? 0) + 1;
    });
    const totalGuardadas = totals.saved + totals.applied + totals.interview + totals.rejected;
    const ratio = totalGuardadas > 0 ? Math.round((totals.applied / totalGuardadas) * 100) : 0;
    const topPortalKey = Object.entries(byPortal).sort((a, b) => b[1] - a[1])[0]?.[0];
    return {
      totals,
      totalGuardadas,
      ratio,
      topPortal: topPortalKey
    };
  }

  render() {
    const latest = this.kpis[this.kpis.length - 1];
    const metrics = [
      { key: 'jobs', label: 'Servicios' },
      { key: 'revenue', label: 'Ingresos' },
      { key: 'rating', label: 'Rating' }
    ] as const;
    const oppStats = this.opportunityStats();
    const topPortalLabel = oppStats.topPortal
      ? portalDefinitions.find((p) => p.key === oppStats.topPortal)?.name ?? oppStats.topPortal
      : 'N/D';

    return html`
      <section class="space-y-3 fade-up max-w-[520px] mx-auto">
        <div class="flex items-center justify-between px-1">
          <div>
            <p class="text-sm text-muted">Panel</p>
            <h2 class="text-2xl font-extrabold text-strong">Tus KPIs</h2>
          </div>
          <div class="flex gap-2">
            <button
              class="chip-btn ${this.period === 'week' ? 'selected' : ''}"
              @click=${() => this.onPeriodChange('week')}
            >
              Semana
            </button>
            <button
              class="chip-btn ${this.period === 'month' ? 'selected' : ''}"
              @click=${() => this.onPeriodChange('month')}
            >
              Mes
            </button>
          </div>
        </div>

        <div class="flex gap-2 overflow-x-auto pb-1">
          ${metrics.map(
            ({ key, label }) => html`<button
              class="chip-btn ${this.metric === key ? 'selected' : ''}"
              @click=${() => this.onMetricChange(key)}
            >
              ${label}
            </button>`
          )}
        </div>

        <div class="grid grid-cols-2 gap-2">
          <ac-kpi-tile label="Servicios" value=${latest?.jobsDone ?? 0}></ac-kpi-tile>
          <ac-kpi-tile
            label="Tiempo prom."
            value=${`${(latest?.avgTime ?? 0).toFixed(0)}m`}
          ></ac-kpi-tile>
          <ac-kpi-tile label="Ingresos" value=${`${latest?.revenue ?? 0}€`}></ac-kpi-tile>
          <ac-kpi-tile label="Cancelaciones" value=${latest?.cancellations ?? 0}></ac-kpi-tile>
        </div>

        <ac-card variant="glass">
          <canvas id="kpi-chart" height="160"></canvas>
        </ac-card>

        <ac-card variant="glass">
          <div class="flex items-center gap-3">
            <div class="icon-btn" aria-hidden="true">
              <ac-icon name="trophy" size="18" color="#f59e0b"></ac-icon>
            </div>
            <div>
              <p class="font-semibold">Ranking (Premium)</p>
              <p class="text-sm text-muted">Desbloquea medallas y retos semanales.</p>
            </div>
          </div>
        </ac-card>

        <div class="space-y-2">
          <div class="flex items-center justify-between px-1">
            <div>
              <p class="text-sm text-muted">Market</p>
              <h3 class="text-lg font-semibold text-strong">KPIs Oportunidades</h3>
            </div>
            <span class="text-xs text-muted">${oppStats.totalGuardadas} totales</span>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <ac-kpi-tile label="Guardadas" value=${oppStats.totalGuardadas}></ac-kpi-tile>
            <ac-kpi-tile label="Aplicadas" value=${oppStats.totals.applied}></ac-kpi-tile>
            <ac-kpi-tile label="Entrevistas" value=${oppStats.totals.interview}></ac-kpi-tile>
            <ac-kpi-tile label="Aperturas" value=${oppStats.totals.opens}></ac-kpi-tile>
          </div>
          <ac-card variant="glass">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-sm text-muted">Top portal</p>
                <p class="font-semibold text-strong">${topPortalLabel}</p>
              </div>
              <div class="text-right">
                <p class="text-sm text-muted">Ratio aplicadas/guardadas</p>
                <p class="text-lg font-semibold text-strong">${oppStats.ratio}%</p>
              </div>
            </div>
          </ac-card>
        </div>
      </section>
    `;
  }
}
