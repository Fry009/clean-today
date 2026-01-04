import '../components/ac-button';
import '../components/ac-chip';
import '../components/ac-icon';
import '../components/ac-skeleton';

import dayjs from 'dayjs';
import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { MarketEvent, MarketOfferResult, MarketPortal, TrackedOpportunity } from '@core/entities/types';
import { clearMarketEvents, getState, includeMarketResult, listMarketEvents, subscribe, trackMarketEvent } from '../state/store';
import { BaseComponent } from '../components/base';
import type { AcToast } from '../components/ac-toast';

const debounceMs = 300;
const INFOJOBS_PORTAL: MarketPortal = 'infojobs';

@customElement('market-page')
export class MarketPage extends BaseComponent {
  @state() declare query: string;
  @state() declare debouncedQuery: string;
  @state() declare location: string;
  @state() declare events: MarketEvent[];
  @state() declare ready: boolean;
  @state() declare feedback?: string;
  @state() declare showAll: boolean;
  @state() declare results: MarketOfferResult[];
  @state() declare loadingResults: boolean;
  @state() declare opportunities: TrackedOpportunity[];
  @state() declare including: Set<string>;

  private unsub?: () => void;
  private debounceHandle?: number;

  constructor() {
    super();
    this.query = '';
    this.debouncedQuery = '';
    this.location = '';
    this.events = [];
    this.ready = false;
    this.showAll = false;
    this.results = [];
    this.loadingResults = false;
    this.opportunities = [];
    this.including = new Set();
  }

  connectedCallback(): void {
    super.connectedCallback();
    const state = getState();
    this.ready = state.ready;
    this.events = state.marketEvents ?? [];
    this.opportunities = state.opportunities ?? [];
    this.unsub = subscribe((s) => {
      this.ready = s.ready;
      this.events = s.marketEvents ?? [];
      this.opportunities = s.opportunities ?? [];
    });
    queueMicrotask(() => listMarketEvents());
  }

  disconnectedCallback(): void {
    window.clearTimeout(this.debounceHandle);
    this.unsub?.();
  }

  private onQueryInput(value: string) {
    this.query = value;
    window.clearTimeout(this.debounceHandle);
    this.debounceHandle = window.setTimeout(() => (this.debouncedQuery = value), debounceMs);
  }

  private async runSearch() {
    const activeQuery = (this.debouncedQuery || this.query).trim();
    if (!activeQuery) {
      this.feedback = 'Escribe una búsqueda primero';
      window.setTimeout(() => (this.feedback = undefined), 2000);
      return;
    }
    this.loadingResults = true;
    try {
      const params = new URLSearchParams();
      params.set('query', activeQuery);
      if (this.location.trim()) params.set('location', this.location.trim());
      const res = await fetch(`/api/market/search?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }
      const data = (await res.json()) as Array<{
        externalId: string;
        title: string;
        description: string;
        company: string;
        location: string;
        publishedAt: string;
        outboundUrl: string;
      }>;
      this.results = data.map((item) => ({
        id: item.externalId,
        portal: INFOJOBS_PORTAL,
        title: item.title,
        location: item.location,
        category: 'empleo',
        priceOrSalary: null,
        createdAt: item.publishedAt ?? new Date().toISOString(),
        outboundUrl: item.outboundUrl,
        sourceQuery: activeQuery
      }));
      this.feedback = `InfoJobs: ${this.results.length} resultados`;
    } catch (_error) {
      this.feedback = 'No se pudo obtener resultados de InfoJobs';
      this.results = [];
    }
    this.loadingResults = false;
    window.setTimeout(() => (this.feedback = undefined), 2400);
  }

  private isTracked(result: MarketOfferResult) {
    return this.opportunities.some((opp) => opp.outboundUrl === result.outboundUrl);
  }

  private async includeResult(result: MarketOfferResult) {
    this.including = new Set(this.including).add(result.id);
    const toast = document.querySelector('#toast') as AcToast | null;
    try {
      const { duplicated } = await includeMarketResult(result);
      if (duplicated) {
        toast?.show('Ya estaba en seguimiento', 'info');
      } else {
        toast?.show('Añadido a seguimiento', 'success');
      }
    } catch (_e) {
      toast?.show('No se pudo guardar la oportunidad', 'error');
    } finally {
      const next = new Set(this.including);
      next.delete(result.id);
      this.including = next;
    }
  }

  private async openOffer(result: MarketOfferResult) {
    window.open(result.outboundUrl, '_blank');
    await trackMarketEvent({
      type: 'market_offer_open',
      portal: result.portal,
      query: result.sourceQuery,
      location: result.location,
      category: result.category,
      outboundUrl: result.outboundUrl,
      resultId: result.id
    });
  }

  private async clearHistory() {
    await clearMarketEvents();
  }

  private resultMeta(result: MarketOfferResult) {
    const when = dayjs(result.createdAt).format('DD MMM HH:mm');
    return `${when} · ${result.location}`;
  }

  private eventDescription(evt: MarketEvent) {
    if (evt.type === 'market_offer_open') return 'Oferta abierta desde resultados';
    if (evt.type === 'opportunity_added') return 'Incluida en seguimiento';
    if (evt.type === 'opportunity_status_changed')
      return `Estado: ${evt.statusFrom ?? '-'} -> ${evt.statusTo ?? '-'}`;
    if (evt.type === 'opportunity_opened') return 'Apertura desde Oportunidades';
    return 'Búsqueda directa';
  }

  render() {
    const recent = this.events.slice(0, 10);
    const list = this.showAll ? this.events : recent;

    return html`
      <section class="fade-up max-w-[1100px] mx-auto space-y-4 px-1">
        <div class="space-y-1">
          <h1 class="text-2xl font-extrabold text-strong">Market</h1>
          <p class="text-sm text-muted">Buscador InfoJobs (sin scraping, vía backend)</p>
          ${this.feedback
            ? html`<p class="text-xs text-strong rounded-xl px-3 py-2 inline-flex items-center gap-2"
                style="background: color-mix(in srgb, var(--accent) 10%, var(--surface) 90%); border: 1px solid var(--border);"
              >
                <ac-icon name="sparkle" size="14"></ac-icon>
                ${this.feedback}
              </p>`
            : null}
        </div>

        <div
          class="rounded-2xl p-4 space-y-4"
          style="background: var(--surface); border: 1px solid var(--border);"
        >
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="md:col-span-2 space-y-2">
              <label class="text-sm text-muted">Búsqueda</label>
              <input
                class="w-full rounded-xl border px-3 py-2 text-sm"
                style="border-color: var(--border); background: color-mix(in srgb, var(--surface) 94%, var(--accent) 6%);"
                type="text"
                .value=${this.query}
                placeholder="Buscar ofertas (ej: limpieza Madrid)"
                @input=${(e: Event) => this.onQueryInput((e.target as HTMLInputElement).value)}
              />
              <p class="text-xs text-muted">Debounce 300ms para evitar peticiones repetidas.</p>
            </div>
            <div class="space-y-2">
              <label class="text-sm text-muted">Ubicación</label>
              <input
                class="w-full rounded-xl border px-3 py-2 text-sm"
                style="border-color: var(--border); background: var(--surface);"
                type="text"
                .value=${this.location}
                placeholder="Ciudad o provincia"
                @input=${(e: Event) => (this.location = (e.target as HTMLInputElement).value)}
              />
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <ac-button ?disabled=${this.loadingResults} @click=${() => this.runSearch()}>
              <ac-icon name="search" size="16"></ac-icon>
              Buscar en InfoJobs
            </ac-button>
          </div>
        </div>

        <div
          class="rounded-2xl p-4 space-y-3"
          style="background: var(--surface); border: 1px solid var(--border);"
        >
          <div class="flex items-center justify-between gap-2">
            <div>
              <p class="text-sm text-muted">Resultados InfoJobs</p>
              <h2 class="text-lg font-semibold text-strong">Previsualiza antes de abrir</h2>
            </div>
            <span class="text-xs text-muted">${this.results.length} resultados</span>
          </div>
          <p class="text-xs text-muted">Cada "Ver oferta" abre el enlace proporcionado por el backend.</p>
          ${this.loadingResults
            ? html`
                <div class="space-y-2">
                  ${Array.from({ length: 4 }).map(
                    () => html`<ac-skeleton width="100%" height="84"></ac-skeleton>`
                  )}
                </div>
              `
            : this.results.length === 0
              ? html`<p class="text-sm text-muted">Aún no hay resultados. Ejecuta una búsqueda.</p>`
              : html`
                  <div class="space-y-2">
                    ${this.results.map((res) => {
                      const tracked = this.isTracked(res);
                      return html`
                        <div
                          class="flex flex-col md:flex-row md:items-center gap-3 p-3 rounded-2xl border"
                          style="border-color: var(--border); background: color-mix(in srgb, var(--surface) 96%, var(--accent) 4%);"
                        >
                          <div class="flex-1 min-w-0 space-y-1">
                            <div class="flex items-center gap-2 flex-wrap">
                              <ac-chip color="blue">InfoJobs</ac-chip>
                              <span class="text-xs text-muted">${this.resultMeta(res)}</span>
                            </div>
                            <p class="font-semibold text-strong truncate">${res.title}</p>
                            <p class="text-sm text-muted">${res.location}</p>
                          </div>
                          <div class="flex items-center gap-2">
                            <ac-button size="sm" @click=${() => this.openOffer(res)}>
                              <ac-icon name="external-link" size="14"></ac-icon>
                              Ver oferta
                            </ac-button>
                            <ac-button
                              size="sm"
                              variant="secondary"
                              ?disabled=${tracked || this.including.has(res.id)}
                              @click=${() => this.includeResult(res)}
                            >
                              ${tracked ? 'Incluido' : 'Incluir en la app'}
                            </ac-button>
                          </div>
                        </div>
                      `;
                    })}
                  </div>
                `}
        </div>

        <div
          class="rounded-2xl p-4 space-y-3"
          style="background: var(--surface); border: 1px solid var(--border);"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted">Actividad Market</p>
              <h2 class="text-lg font-semibold text-strong">Historial</h2>
            </div>
            <div class="flex gap-2">
              <ac-button variant="secondary" @click=${() => (this.showAll = !this.showAll)}>
                ${this.showAll ? 'Ver últimos 10' : 'Ver todo'}
              </ac-button>
              <ac-button variant="secondary" @click=${() => this.clearHistory()}>
                Borrar historial
              </ac-button>
            </div>
          </div>

          ${!this.ready
            ? html`<div class="space-y-2">
                ${Array.from({ length: 4 }).map(
                  () => html`<ac-skeleton width="100%" height="14"></ac-skeleton>`
                )}
              </div>`
            : list.length === 0
              ? html`<p class="text-sm text-muted">Sin actividad registrada todavía.</p>`
              : html`
                  <div class="overflow-auto">
                    <table class="w-full text-sm">
                      <thead class="text-xs text-muted">
                        <tr>
                          <th class="text-left py-2">Portal</th>
                          <th class="text-left py-2">Detalle</th>
                          <th class="text-left py-2">Fecha</th>
                          <th class="text-left py-2">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${list.map((evt) => {
                          const detail =
                            evt.type === 'opportunity_status_changed'
                              ? `${evt.statusFrom ?? '-'} -> ${evt.statusTo ?? '-'}`
                              : evt.query || evt.category || evt.outboundUrl;
                          return html`
                            <tr class="border-t" style="border-color: var(--border);">
                              <td class="py-2 capitalize font-semibold text-strong">${evt.portal}</td>
                              <td class="py-2">
                                <div class="font-semibold text-sm">${this.eventDescription(evt)}</div>
                                <div class="text-xs text-muted">${detail}</div>
                              </td>
                              <td class="py-2 text-muted">${dayjs(evt.createdAt).format('DD MMM HH:mm')}</td>
                              <td class="py-2">
                                <button class="chip-btn" @click=${() => window.open(evt.outboundUrl, '_blank')}>
                                  <ac-icon name="chevron-right" size="14"></ac-icon>
                                  Ir a URL
                                </button>
                              </td>
                            </tr>
                          `;
                        })}
                      </tbody>
                    </table>
                  </div>
                `}
        </div>
      </section>
    `;
  }
}
