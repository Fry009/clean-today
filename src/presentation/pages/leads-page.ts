import '../components/ac-card';
import '../components/ac-chip';
import '../components/ac-icon';
import '../components/ac-skeleton';

import { Lead } from '@core/entities/types';
import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { BaseComponent } from '../components/base';
import {
  convertLead,
  discardLead,
  getState,
  listLeads,
  refreshLeads,
  saveLead,
  subscribe
} from '../state/store';

const SOURCE_LABEL: Record<string, string> = {
  milanuncios: 'Milanuncios',
  indeed: 'Indeed',
  jobtoday: 'JobToday',
  domestiko: 'Domestiko'
};

const STATUS_LABEL: Record<Lead['status'], string> = {
  unhandled: 'Sin gestionar',
  saved: 'Guardadas',
  discarded: 'Descartadas'
};

@customElement('leads-page')
export class LeadsPage extends BaseComponent {
  @state() declare leads: ReturnType<typeof getState>['leads'];
  @state() declare loading: boolean;
  @state() declare filters: { status?: Lead['status']; source?: string; type?: string };
  @state() declare lastRefreshAt?: number;

  private unsub?: () => void;

  connectedCallback(): void {
    super.connectedCallback();
    this.leads = getState().leads;
    this.loading = false;
    this.filters = { status: 'unhandled' };
    this.lastRefreshAt = Date.now();
    this.unsub = subscribe((s) => (this.leads = s.leads));
    void this.fetch();
  }

  disconnectedCallback(): void {
    this.unsub?.();
  }

  private async fetch() {
    this.loading = true;
    await listLeads(this.filters);
    this.loading = false;
  }

  private async applyFilters(next: Partial<typeof this.filters>) {
    this.filters = { ...this.filters, ...next };
    await this.fetch();
  }

  private relativeRefresh() {
    if (!this.lastRefreshAt) return '—';
    const minutes = Math.max(0, Math.round((Date.now() - this.lastRefreshAt) / 60000));
    if (minutes <= 1) return 'hace 1 min';
    if (minutes < 60) return `hace ${minutes} min`;
    const hours = Math.round(minutes / 60);
    return hours === 1 ? 'hace 1 h' : `hace ${hours} h`;
  }

  private async onRefresh() {
    this.loading = true;
    await refreshLeads();
    this.lastRefreshAt = Date.now();
    await listLeads(this.filters);
    this.loading = false;
  }

  render() {
    return html`
      <section class="space-y-3 fade-up max-w-[520px] mx-auto">
        <div class="sticky top-2 z-10">
          <div class="flex items-center justify-between gap-2">
            <div class="flex gap-2 overflow-x-auto pb-2">
              ${(['unhandled', 'saved', 'discarded'] as const).map(
                (status) => html`
                  <button
                    class="chip-btn ${this.filters.status === status ? 'selected' : ''}"
                    @click=${() => this.applyFilters({ status })}
                  >
                    ${STATUS_LABEL[status]}
                  </button>
                `
              )}
              <button class="chip-btn" title="Orden y distancia (mock)">
                Cerca
                <ac-icon name="chevron-right" size="14" color="var(--muted)"></ac-icon>
              </button>
              <button class="chip-btn" title="Ubicación (mock)">
                Madrid
                <ac-icon name="chevron-right" size="14" color="var(--muted)"></ac-icon>
              </button>
            </div>
            <button class="icon-btn" aria-label="Actualizar" title="Actualizar" @click=${this.onRefresh}>
              <ac-icon name="sync" size="18" color="var(--accent-strong)"></ac-icon>
            </button>
          </div>
          <div class="flex items-center justify-between px-1 text-xs text-muted">
            <span>Última actualización: ${this.relativeRefresh()}</span>
            <span class=${this.loading ? 'text-[var(--accent-strong)]' : ''}>${this.loading ? 'Cargando…' : ''}</span>
          </div>
        </div>

        ${this.loading
          ? html`
              <div class="space-y-2">
                <ac-skeleton width="320" height="120"></ac-skeleton>
                <ac-skeleton width="320" height="120"></ac-skeleton>
                <ac-skeleton width="320" height="120"></ac-skeleton>
              </div>
            `
          : this.leads.length === 0
            ? html`
                <ac-card variant="glass">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background: var(--surface-strong); border: 1px solid var(--border);" aria-hidden="true">
                      <ac-icon name="search" size="18" color="var(--muted)"></ac-icon>
                    </div>
                    <div>
                      <p class="font-semibold">No hay ofertas</p>
                      <p class="text-sm text-muted">Cambia filtros o actualiza para buscar nuevos leads.</p>
                    </div>
                  </div>
                </ac-card>
              `
            : this.leads.map((lead) => {
                const sourceLabel = SOURCE_LABEL[lead.source] ?? lead.source;
                const price = `${lead.price.amount}€`;
                const meta = `${lead.distanceKm} km · hace ${lead.postedHoursAgo} h`;
                return html`
                  <ac-card variant="glass">
                    <div class="flex items-start justify-between gap-3">
                      <div class="space-y-1">
                        <div class="flex items-center gap-2">
                          <ac-chip color="gray">${sourceLabel}</ac-chip>
                          <ac-chip color="blue">${lead.type.toUpperCase()}</ac-chip>
                        </div>
                        <p class="font-semibold text-strong">${lead.title}</p>
                        <p class="text-sm text-muted">${lead.location}</p>
                      </div>
                      <div class="text-right space-y-1">
                        <p class="text-lg font-extrabold" style="color: var(--accent-strong);">${price}</p>
                        <p class="text-xs text-muted">${meta}</p>
                      </div>
                    </div>
                    <div class="mt-3 flex items-center justify-between gap-3">
                      <div class="flex items-center gap-2 text-xs text-muted">
                        <ac-icon name="map-pin" size="14" color="var(--muted)"></ac-icon>
                        <span>${lead.distanceKm} km aprox.</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <a
                          class="px-3 py-2 rounded-full text-white font-semibold active:scale-95 transition"
                          style="background: var(--accent);"
                          href=${lead.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Contactar
                        </a>
                        <button class="icon-btn" aria-label="Guardar" title="Guardar" @click=${() => saveLead(lead.id)}>
                          <ac-icon name="bookmark" size="18" color="var(--accent-strong)"></ac-icon>
                        </button>
                      </div>
                    </div>
                    <div class="mt-3 flex items-center justify-between">
                      <button class="text-xs font-semibold text-[var(--accent-strong)]" @click=${() => convertLead(lead.id)}>
                        Convertir en Job
                      </button>
                      <button class="text-xs font-semibold text-rose-500" @click=${() => discardLead(lead.id)}>
                        Descartar
                      </button>
                    </div>
                  </ac-card>
                `;
              })}
      </section>
    `;
  }
}
