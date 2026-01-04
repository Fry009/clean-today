import '../components/ac-button';
import '../components/ac-icon';
import '../components/ac-chip';
import '../components/ac-skeleton';

import dayjs from 'dayjs';
import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { JobPosting } from '@core/entities/types';
import {
  fetchJobSources,
  getState,
  importCsvPosting,
  importManualPosting,
  listJobPostings,
  subscribe,
  toggleFavorite
} from '../state/store';
import { BaseComponent } from '../components/base';
import { countriesLatamEs, provinceOptions } from '@shared/geo';

@customElement('job-offers-page')
export class JobOffersPage extends BaseComponent {
  @state() declare postings: JobPosting[];
  @state() declare loading: boolean;
  @state() declare error?: string;
  @state() declare textFilter: string;
  @state() declare locationFilter: string;
  @state() declare countryFilter: string;
  @state() declare provinceFilter: string;

  private unsub?: () => void;

  constructor() {
    super();
    this.postings = [];
    this.loading = false;
    this.textFilter = '';
    this.locationFilter = '';
    this.countryFilter = '';
    this.provinceFilter = '';
  }

  connectedCallback(): void {
    super.connectedCallback();
    const state = getState();
    this.postings = state.jobPostings ?? [];
    this.loading = state.jobLoading ?? false;
    this.error = state.jobError;
    this.unsub = subscribe((s) => {
      this.postings = s.jobPostings ?? [];
      this.loading = s.jobLoading ?? false;
      this.error = s.jobError;
    });
    if (this.postings.length === 0 && !this.loading) {
      queueMicrotask(() => this.refresh());
    }
  }

  disconnectedCallback(): void {
    this.unsub?.();
  }

  private async refresh() {
    this.loading = true;
    await fetchJobSources();
    this.loading = false;
  }

  private async applyFilters() {
    await listJobPostings({
      text: this.textFilter,
      location: this.locationFilter,
      country: this.countryFilter,
      province: this.provinceFilter
    });
  }

  private async onImportManual(e: SubmitEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    await importManualPosting({
      title: String(data.get('title') ?? ''),
      company: String(data.get('company') ?? ''),
      location: String(data.get('location') ?? ''),
      applyUrl: String(data.get('applyUrl') ?? ''),
      tags: (String(data.get('tags') ?? '') || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    });
    form.reset();
  }

  private async onImportCsv(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const text = await file.text();
    await importCsvPosting(text);
    input.value = '';
  }

  render() {
    return html`
      <section class="fade-up max-w-[1100px] mx-auto space-y-4 px-1">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-extrabold text-strong">Ofertas</h1>
            <p class="text-sm text-muted">Fuentes permitidas (RSS, API, manual/CSV). Sin scraping.</p>
          </div>
          <ac-button ?disabled=${this.loading} @click=${() => this.refresh()}>
            <ac-icon name="refresh" size="16"></ac-icon>
            Actualizar
          </ac-button>
        </div>
        ${this.error ? html`<p class="text-sm text-warning">${this.error}</p>` : null}

        <div class="rounded-2xl p-4 space-y-3" style="background: var(--surface); border: 1px solid var(--border);">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="space-y-1">
              <label class="text-sm text-muted">Buscar</label>
              <input
                class="w-full rounded-xl border px-3 py-2 text-sm"
                style="border-color: var(--border); background: var(--surface);"
                .value=${this.textFilter}
                @input=${(e: Event) => (this.textFilter = (e.target as HTMLInputElement).value)}
              />
            </div>
            <div class="space-y-1">
              <label class="text-sm text-muted">Ubicación</label>
              <input
                class="w-full rounded-xl border px-3 py-2 text-sm"
                style="border-color: var(--border); background: var(--surface);"
                .value=${this.locationFilter}
                @input=${(e: Event) => (this.locationFilter = (e.target as HTMLInputElement).value)}
              />
            </div>
            <div class="space-y-1">
              <label class="text-sm text-muted">Provincia</label>
              <input
                list="province-options"
                class="w-full rounded-xl border px-3 py-2 text-sm"
                style="border-color: var(--border); background: var(--surface);"
                .value=${this.provinceFilter}
                @input=${(e: Event) => (this.provinceFilter = (e.target as HTMLInputElement).value)}
              />
              <datalist id="province-options">
                ${provinceOptions.map((p) => html`<option value=${p}></option>`)}
              </datalist>
            </div>
            <div class="space-y-1">
              <label class="text-sm text-muted">País</label>
              <input
                list="country-options"
                class="w-full rounded-xl border px-3 py-2 text-sm"
                style="border-color: var(--border); background: var(--surface);"
                .value=${this.countryFilter}
                @input=${(e: Event) => (this.countryFilter = (e.target as HTMLInputElement).value)}
              />
              <datalist id="country-options">
                ${countriesLatamEs.map((c) => html`<option value=${c}></option>`)}
              </datalist>
            </div>
            <div class="flex items-end">
              <ac-button block @click=${() => this.applyFilters()}>Filtrar</ac-button>
            </div>
          </div>
        </div>

        <div class="rounded-2xl p-4 space-y-3" style="background: var(--surface); border: 1px solid var(--border);">
          <h2 class="font-semibold text-strong">Importar</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <form class="space-y-2" @submit=${(e: SubmitEvent) => this.onImportManual(e)}>
              <p class="text-sm text-muted">Añadir oferta manual</p>
              <input required name="title" placeholder="Título" class="input" />
              <input required name="company" placeholder="Empresa" class="input" />
              <input required name="location" placeholder="Ubicación" class="input" />
              <input required name="applyUrl" placeholder="URL de aplicación" class="input" />
              <input name="tags" placeholder="Tags (coma)" class="input" />
              <ac-button type="submit" size="sm">Guardar</ac-button>
            </form>
            <div class="space-y-2">
              <p class="text-sm text-muted">Importar CSV (title,company,location,applyUrl,...)</p>
              <input type="file" accept=".csv" @change=${(e: Event) => this.onImportCsv(e)} />
            </div>
          </div>
        </div>

        <div class="space-y-2">
          ${this.loading
            ? html`${Array.from({ length: 4 }).map(
                () => html`<ac-skeleton width="100%" height="96"></ac-skeleton>`
              )}`
            : this.postings.length === 0
              ? html`<p class="text-sm text-muted">Sin ofertas. Pulsa “Actualizar” o importa manual/CSV.</p>`
              : this.postings.map((p) => this.renderCard(p))}
        </div>
      </section>
    `;
  }

  private renderCard(p: JobPosting) {
    const snippetRaw = p.descriptionSnippet ?? '';
    const snippetText = stripHtml(snippetRaw);
    const snippet =
      snippetText.length > 220 ? `${snippetText.slice(0, 220).trimEnd()}…` : snippetText;
    return html`
      <article
        class="p-4 rounded-2xl border flex flex-col gap-2"
        style="border-color: var(--border); background: var(--surface);"
      >
        <div class="flex items-center justify-between gap-2">
          <div>
            <p class="font-semibold text-strong">${p.title}</p>
            <p class="text-sm text-muted">${p.company} · ${p.location}</p>
          </div>
          <button class="chip-btn" @click=${() => toggleFavorite(p.id, !p.favorite)}>
            <ac-icon name="heart" size="16" color=${p.favorite ? 'var(--accent)' : 'var(--muted)'}></ac-icon>
            ${p.favorite ? 'Favorito' : 'Guardar'}
          </button>
        </div>
        ${snippet ? html`<p class="text-sm text-muted">${snippet}</p>` : null}
        <div class="flex items-center gap-2 text-xs text-muted">
          <ac-chip color="blue">${p.sourceName}</ac-chip>
          <span>${dayjs(p.publishedAt).format('DD MMM HH:mm')}</span>
        </div>
        <div class="flex gap-2">
          <ac-button size="sm" @click=${() => window.open(p.applyUrl, '_blank')}>
            <ac-icon name="external-link" size="14"></ac-icon>
            Aplicar
          </ac-button>
          <ac-button size="sm" variant="secondary" @click=${() => window.open(p.applyUrl || p.sourceUrl, '_blank')}>
            Fuente
          </ac-button>
        </div>
      </article>
    `;
  }
}

function stripHtml(html: string): string {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent?.trim() ?? '';
}
