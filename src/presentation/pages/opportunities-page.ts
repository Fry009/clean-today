import '../components/ac-button';
import '../components/ac-chip';
import '../components/ac-icon';
import '../components/ac-modal';
import '../components/ac-skeleton';

import dayjs from 'dayjs';
import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { MarketPortal, OpportunityStatus, TrackedOpportunity } from '@core/entities/types';
import { portalDefinitions } from '@shared/market/portalUrlBuilders';
import {
  getState,
  listOpportunities,
  openOpportunity,
  subscribe,
  updateOpportunityNotes,
  updateOpportunityStatus
} from '../state/store';
import { BaseComponent } from '../components/base';
import type { AcToast } from '../components/ac-toast';

const STATUS_LABEL: Record<OpportunityStatus, string> = {
  saved: 'Guardado',
  applied: 'Aplicado',
  interview: 'Entrevista',
  rejected: 'Descartado'
};

const STATUS_COLOR: Record<OpportunityStatus, 'gray' | 'blue' | 'green' | 'neutral'> = {
  saved: 'gray',
  applied: 'blue',
  interview: 'green',
  rejected: 'neutral'
};

@customElement('opportunities-page')
export class OpportunitiesPage extends BaseComponent {
  @state() declare opportunities: TrackedOpportunity[];
  @state() declare ready: boolean;
  @state() declare filters: { status: OpportunityStatus | 'all'; portal: MarketPortal | 'all'; search: string };
  @state() declare noteModalOpen: boolean;
  @state() declare noteDraft: string;
  @state() declare noteTarget?: TrackedOpportunity;

  private unsub?: () => void;

  constructor() {
    super();
    this.opportunities = [];
    this.ready = false;
    this.filters = { status: 'all', portal: 'all', search: '' };
    this.noteModalOpen = false;
    this.noteDraft = '';
  }

  connectedCallback(): void {
    super.connectedCallback();
    const state = getState();
    this.opportunities = state.opportunities ?? [];
    this.ready = state.ready;
    this.unsub = subscribe((s) => {
      this.opportunities = s.opportunities ?? [];
      this.ready = s.ready;
    });
    queueMicrotask(() => listOpportunities());
  }

  disconnectedCallback(): void {
    this.unsub?.();
  }

  private filtered() {
    return this.opportunities.filter((opp) => {
      if (this.filters.status !== 'all' && opp.status !== this.filters.status) return false;
      if (this.filters.portal !== 'all' && opp.portal !== this.filters.portal) return false;
      if (this.filters.search) {
        const term = this.filters.search.toLowerCase();
        if (!opp.title.toLowerCase().includes(term) && !opp.location.toLowerCase().includes(term)) return false;
      }
      return true;
    });
  }

  private async changeStatus(id: string, status: OpportunityStatus) {
    const toast = document.querySelector('#toast') as AcToast | null;
    await updateOpportunityStatus(id, status);
    toast?.show('Estado actualizado', 'success');
  }

  private async handleOpen(opp: TrackedOpportunity) {
    await openOpportunity(opp.id);
    window.open(opp.outboundUrl, '_blank');
  }

  private async saveNotes() {
    if (!this.noteTarget) return;
    await updateOpportunityNotes(this.noteTarget.id, this.noteDraft);
    const toast = document.querySelector('#toast') as AcToast | null;
    toast?.show('Notas guardadas', 'success');
    this.noteModalOpen = false;
    this.noteTarget = undefined;
    this.noteDraft = '';
  }

  private openNotesModal(opp: TrackedOpportunity) {
    this.noteTarget = opp;
    this.noteDraft = opp.notes ?? '';
    this.noteModalOpen = true;
  }

  private stats() {
    const base = { saved: 0, applied: 0, interview: 0, rejected: 0, opens: 0 };
    return this.opportunities.reduce((acc, opp) => {
      acc[opp.status] += 1;
      acc.opens += opp.openCount ?? 0;
      return acc;
    }, base);
  }

  render() {
    const list = this.filtered();
    const stats = this.stats();

    return html`
      <section class="fade-up max-w-[900px] mx-auto space-y-4 px-1">
        <div class="flex items-center justify-between gap-2">
          <div>
            <p class="text-sm text-muted">Seguimiento interno</p>
            <h1 class="text-2xl font-extrabold text-strong">Oportunidades</h1>
          </div>
          <div class="text-right text-xs text-muted">
            <p>${this.opportunities.length} guardadas</p>
            <p>${stats.opens} aperturas</p>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div class="p-3 rounded-xl border" style="border-color: var(--border);">
            <p class="text-xs text-muted">Guardadas</p>
            <p class="text-lg font-semibold text-strong">${stats.saved}</p>
          </div>
          <div class="p-3 rounded-xl border" style="border-color: var(--border);">
            <p class="text-xs text-muted">Aplicadas</p>
            <p class="text-lg font-semibold text-strong">${stats.applied}</p>
          </div>
          <div class="p-3 rounded-xl border" style="border-color: var(--border);">
            <p class="text-xs text-muted">Entrevistas</p>
            <p class="text-lg font-semibold text-strong">${stats.interview}</p>
          </div>
          <div class="p-3 rounded-xl border" style="border-color: var(--border);">
            <p class="text-xs text-muted">Aperturas</p>
            <p class="text-lg font-semibold text-strong">${stats.opens}</p>
          </div>
        </div>

        <div class="rounded-2xl p-4 space-y-3" style="background: var(--surface); border: 1px solid var(--border);">
          <div class="flex flex-col md:flex-row md:items-center gap-3">
            <div class="flex gap-2 overflow-x-auto">
              ${(['all', 'saved', 'applied', 'interview', 'rejected'] as const).map(
                (status) => html`
                  <button
                    class="chip-btn ${this.filters.status === status ? 'selected' : ''}"
                    @click=${() => (this.filters = { ...this.filters, status })}
                  >
                    ${status === 'all' ? 'Todos' : STATUS_LABEL[status as OpportunityStatus]}
                  </button>
                `
              )}
            </div>
            <div class="flex gap-2 overflow-x-auto">
              <select
                class="rounded-xl border px-3 py-2 text-sm"
                style="border-color: var(--border); background: var(--surface);"
                .value=${this.filters.portal}
                @change=${(e: Event) =>
                  (this.filters = { ...this.filters, portal: (e.target as HTMLSelectElement).value as MarketPortal | 'all' })}
              >
                <option value="all">Todos los portales</option>
                ${portalDefinitions.map(
                  (p) => html`<option value=${p.key}>${p.name}</option>`
                )}
              </select>
              <input
                class="rounded-xl border px-3 py-2 text-sm"
                style="border-color: var(--border); background: var(--surface);"
                type="search"
                placeholder="Buscar por titulo o ciudad"
                .value=${this.filters.search}
                @input=${(e: Event) => (this.filters = { ...this.filters, search: (e.target as HTMLInputElement).value })}
              />
            </div>
          </div>

          ${!this.ready
            ? html`
                <div class="space-y-2">
                  ${Array.from({ length: 3 }).map(
                    () => html`<ac-skeleton width="100%" height="80"></ac-skeleton>`
                  )}
                </div>
              `
            : list.length === 0
              ? html`<p class="text-sm text-muted">No hay oportunidades con estos filtros.</p>`
              : html`
                  <div class="space-y-2">
                    ${list.map((opp) => {
                      const portalName = portalDefinitions.find((p) => p.key === opp.portal)?.name ?? opp.portal;
                      const lastOpen = opp.lastOpenedAt
                        ? `• Abierto ${dayjs(opp.lastOpenedAt).format('DD MMM HH:mm')}`
                        : '';
                      return html`
                        <div class="p-3 rounded-2xl border" style="border-color: var(--border); background: var(--surface-strong);">
                          <div class="flex items-start justify-between gap-3">
                            <div class="space-y-1">
                              <div class="flex items-center gap-2 flex-wrap">
                                <ac-chip color="blue">${portalName}</ac-chip>
                                <ac-chip color=${STATUS_COLOR[opp.status]} aria-label=${opp.status}>
                                  ${STATUS_LABEL[opp.status]}
                                </ac-chip>
                              </div>
                              <p class="font-semibold text-strong">${opp.title}</p>
                              <p class="text-sm text-muted">${opp.location}</p>
                              <p class="text-xs text-muted">
                                Guardado ${dayjs(opp.createdAt).format('DD MMM HH:mm')} • ${opp.openCount} aperturas ${lastOpen}
                              </p>
                            </div>
                            <div class="flex flex-col gap-2 min-w-[160px]">
                              <ac-button size="sm" @click=${() => this.handleOpen(opp)}>
                                <ac-icon name="external-link" size="14"></ac-icon>
                                Abrir
                              </ac-button>
                              <select
                                class="rounded-xl border px-3 py-2 text-sm"
                                style="border-color: var(--border); background: var(--surface);"
                                .value=${opp.status}
                                @change=${(e: Event) =>
                                  this.changeStatus(opp.id, (e.target as HTMLSelectElement).value as OpportunityStatus)}
                              >
                                ${(Object.keys(STATUS_LABEL) as OpportunityStatus[]).map(
                                  (status) => html`<option value=${status}>${STATUS_LABEL[status]}</option>`
                                )}
                              </select>
                              <ac-button size="sm" variant="secondary" @click=${() => this.openNotesModal(opp)}>
                                <ac-icon name="edit" size="14"></ac-icon>
                                Notas
                              </ac-button>
                            </div>
                          </div>
                        </div>
                      `;
                    })}
                  </div>
                `}
        </div>

        <ac-modal .open=${this.noteModalOpen} title="Notas" @close=${() => (this.noteModalOpen = false)}>
          <div class="space-y-3">
            <textarea
              class="w-full rounded-xl border px-3 py-2 text-sm"
              style="border-color: var(--border); background: var(--surface-strong);"
              rows="4"
              .value=${this.noteDraft}
              @input=${(e: Event) => (this.noteDraft = (e.target as HTMLTextAreaElement).value)}
            ></textarea>
            <div class="flex justify-end gap-2">
              <ac-button variant="secondary" @click=${() => (this.noteModalOpen = false)}>Cancelar</ac-button>
              <ac-button @click=${() => this.saveNotes()}>Guardar</ac-button>
            </div>
          </div>
        </ac-modal>
      </section>
    `;
  }
}
