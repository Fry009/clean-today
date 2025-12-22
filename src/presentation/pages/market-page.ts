import '../components/ac-button';
import '../components/ac-icon';
import '../components/ac-skeleton';

import dayjs from 'dayjs';
import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { MarketEvent, MarketPortal } from '@core/entities/types';
import { BaseComponent } from '../components/base';
import { clearMarketEvents, getState, listMarketEvents, subscribe, trackMarketEvent } from '../state/store';
import { buildPortalSearchUrl, portalDefinitions } from '@shared/market/portalUrlBuilders';

const debounceMs = 300;

@customElement('market-page')
export class MarketPage extends BaseComponent {
  @state() declare query: string;
  @state() declare debouncedQuery: string;
  @state() declare location: string;
  @state() declare category: string;
  @state() declare events: MarketEvent[];
  @state() declare ready: boolean;
  @state() declare feedback?: string;
  @state() declare showAll: boolean;
  @state() declare selectedPortals: Set<MarketPortal>;
  @state() declare results: Array<{
    portal: MarketPortal;
    name: string;
    outboundUrl: string;
    query: string;
    location?: string;
    category?: string;
  }>;

  private unsub?: () => void;
  private debounceHandle?: number;

  constructor() {
    super();
    this.query = '';
    this.debouncedQuery = '';
    this.location = '';
    this.category = 'anuncios';
    this.events = [];
    this.ready = false;
    this.showAll = false;
    this.selectedPortals = new Set(portalDefinitions.map((p) => p.key));
    this.results = [];
  }

  connectedCallback(): void {
    super.connectedCallback();
    const state = getState();
    this.ready = state.ready;
    this.events = state.marketEvents ?? [];
    this.unsub = subscribe((s) => {
      this.ready = s.ready;
      this.events = s.marketEvents ?? [];
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

  private togglePortal(portal: MarketPortal, checked: boolean) {
    const next = new Set(this.selectedPortals);
    if (checked) {
      next.add(portal);
    } else {
      next.delete(portal);
    }
    this.selectedPortals = next;
  }

  private buildResult(portal: MarketPortal) {
    const activeQuery = (this.debouncedQuery || this.query).trim();
    if (!activeQuery) {
      this.feedback = 'Escribe una busqueda primero';
      return null;
    }
    const outboundUrl = buildPortalSearchUrl(portal, {
      query: activeQuery,
      location: this.location.trim(),
      category: this.category
    });
    const name = portalDefinitions.find((p) => p.key === portal)?.name ?? portal;
    return { portal, name, outboundUrl, query: activeQuery, location: this.location.trim(), category: this.category };
  }

  private runSearch(portals: MarketPortal[]) {
    const built = portals
      .map((p) => this.buildResult(p))
      .filter((r): r is NonNullable<ReturnType<MarketPage['buildResult']>> => Boolean(r));
    this.results = built;
    if (built.length > 0) {
      this.feedback = `Listo: ${built.length} resultados preparados (sin navegar).`;
      window.setTimeout(() => (this.feedback = undefined), 2000);
    }
  }

  private async copyAndTrack(result: { portal: MarketPortal; outboundUrl: string; query: string; location?: string; category?: string }) {
    try {
      await navigator.clipboard.writeText(result.outboundUrl);
      this.feedback = 'URL copiada';
      window.setTimeout(() => (this.feedback = undefined), 1500);
    } catch (_e) {
      // fallback
      window.prompt('Copia la URL', result.outboundUrl);
    }
    await trackMarketEvent({
      portal: result.portal,
      query: result.query,
      location: result.location ?? null,
      category: result.category ?? null,
      outboundUrl: result.outboundUrl
    });
  }

  private async clearHistory() {
    await clearMarketEvents();
  }

  private locationParts(raw?: string | null) {
    if (!raw) return { municipio: 'N/D', provincia: 'N/D' };
    const [first, second] = raw.split(',').map((p) => p.trim());
    return {
      municipio: first || 'N/D',
      provincia: second || 'N/D'
    };
  }

  render() {
    const recent = this.events.slice(0, 10);
    const list = this.showAll ? this.events : recent;

    return html`
      <section class="fade-up max-w-[1100px] mx-auto space-y-4 px-1">
        <div class="space-y-1">
          <h1 class="text-2xl font-extrabold text-strong">Market</h1>
          <p class="text-sm text-muted">Busca ofertas en portales externos</p>
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
              <label class="text-sm text-muted">Busqueda</label>
              <input
                class="w-full rounded-xl border px-3 py-2 text-sm"
                style="border-color: var(--border); background: color-mix(in srgb, var(--surface) 94%, var(--accent) 6%);"
                type="text"
                .value=${this.query}
                placeholder="Buscar ofertas… (ej: limpieza Madrid)"
                @input=${(e: Event) => this.onQueryInput((e.target as HTMLInputElement).value)}
              />
              <p class="text-xs text-muted">Debounce 300ms: solo para UX, no se hacen llamadas externas.</p>
            </div>
            <div class="space-y-2">
              <label class="text-sm text-muted">Ubicacion</label>
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
          <div class="flex flex-wrap items-center gap-3">
            <label class="text-sm text-muted">Categoria</label>
            <select
              class="rounded-xl border px-3 py-2 text-sm"
              style="border-color: var(--border); background: var(--surface);"
              .value=${this.category}
              @change=${(e: Event) => (this.category = (e.target as HTMLSelectElement).value)}
            >
              ${['anuncios', 'servicios', 'empleo', 'limpieza'].map(
                (opt) => html`<option value=${opt}>${opt}</option>`
              )}
            </select>
          </div>

          <div class="space-y-3">
            <p class="text-sm text-muted">Selecciona portales (busqueda via Google con site:portal)</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              ${portalDefinitions.map(
                (portal) => html`
                  <label
                    class="flex items-start gap-3 p-3 rounded-xl border cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition"
                    style="border-color: var(--border);"
                  >
                    <input
                      type="checkbox"
                      .checked=${this.selectedPortals.has(portal.key)}
                      @change=${(e: Event) =>
                        this.togglePortal(portal.key, (e.target as HTMLInputElement).checked)}
                    />
                    <div class="space-y-1">
                      <p class="text-sm font-semibold text-strong">${portal.name}</p>
                      <p class="text-xs text-muted">${portal.description}</p>
                      <p class="text-xs text-muted">Dominio: ${portal.domain}</p>
                    </div>
                  </label>
                `
              )}
            </div>
            <div class="flex flex-wrap gap-2">
              <ac-button @click=${() => this.runSearch(Array.from(this.selectedPortals))}>
                <ac-icon name="search" size="16"></ac-icon>
                Buscar en seleccionados
              </ac-button>
              <ac-button variant="secondary" @click=${() => this.runSearch(portalDefinitions.map((p) => p.key))}>
                <ac-icon name="bolt" size="16"></ac-icon>
                Generar todos
              </ac-button>
            </div>
          </div>
        </div>

        <div
          class="rounded-2xl p-4 space-y-3"
          style="background: var(--surface); border: 1px solid var(--border);"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted">Resultados (sin navegar)</p>
              <h2 class="text-lg font-semibold text-strong">Tabla de URLs</h2>
            </div>
            <span class="text-xs text-muted">${this.results.length} entradas</span>
          </div>
          ${this.results.length === 0
            ? html`<p class="text-sm text-muted">Aún no hay resultados. Ejecuta una búsqueda.</p>`
            : html`
                <div class="overflow-auto">
                  <table class="w-full text-sm">
                    <thead class="text-xs text-muted">
                      <tr>
                        <th class="text-left py-2">Portal</th>
                        <th class="text-left py-2">URL</th>
                        <th class="text-left py-2">Descripcion</th>
                        <th class="text-left py-2">Municipio</th>
                        <th class="text-left py-2">Provincia</th>
                        <th class="text-left py-2">Accion</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${this.results.map((res) => {
                        const loc = this.locationParts(res.location);
                        const shortUrl =
                          res.outboundUrl.length > 50
                            ? `${res.outboundUrl.slice(0, 50)}...`
                            : res.outboundUrl;
                        return html`
                          <tr class="border-t" style="border-color: var(--border);">
                            <td class="py-2 font-semibold text-strong">${res.name}</td>
                            <td class="py-2 text-xs text-muted break-all">${shortUrl}</td>
                            <td class="py-2">${res.query}</td>
                            <td class="py-2">${loc.municipio}</td>
                            <td class="py-2">${loc.provincia}</td>
                            <td class="py-2">
                              <button class="chip-btn" @click=${() => this.copyAndTrack(res)}>
                                Copiar URL
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
                ${this.showAll ? 'Ver ultimos 10' : 'Ver todo'}
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
              ? html`<p class="text-sm text-muted">Sin actividad registrada todavia.</p>`
              : html`
                  <div class="overflow-auto">
                    <table class="w-full text-sm">
                      <thead class="text-xs text-muted">
                        <tr>
                          <th class="text-left py-2">Portal</th>
                          <th class="text-left py-2">Municipio</th>
                          <th class="text-left py-2">Provincia</th>
                          <th class="text-left py-2">Descripcion</th>
                          <th class="text-left py-2">Fecha</th>
                          <th class="text-left py-2">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${list.map((evt) => {
                          const loc = this.locationParts(evt.location);
                          return html`
                            <tr class="border-t" style="border-color: var(--border);">
                              <td class="py-2 capitalize font-semibold text-strong">${evt.portal}</td>
                              <td class="py-2">${loc.municipio}</td>
                              <td class="py-2">${loc.provincia}</td>
                              <td class="py-2">${evt.query}</td>
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
