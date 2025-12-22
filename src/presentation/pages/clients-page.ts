import '../components/ac-button';
import '../components/ac-icon';
import '../components/ac-modal';
import '../components/ac-skeleton';

import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { BaseComponent } from '../components/base';
import { addClient, getState, subscribe } from '../state/store';

type ClientTag = 'Premium' | 'Recurrent';

@customElement('clients-page')
export class ClientsPage extends BaseComponent {
  @state() declare ready: boolean;
  @state() declare clients: ReturnType<typeof getState>['clients'];
  @state() declare query: string;
  @state() declare addOpen: boolean;
  @state() declare formName: string;
  @state() declare formAddress: string;
  @state() declare formNotes: string;
  @state() declare selectedId?: string;

  private unsub?: () => void;

  connectedCallback(): void {
    super.connectedCallback();
    const state = getState();
    this.ready = state.ready;
    this.clients = state.clients;
    this.query = '';
    this.addOpen = false;
    this.formName = '';
    this.formAddress = '';
    this.formNotes = '';
    this.selectedId = undefined;
    this.unsub = subscribe((s) => {
      this.ready = s.ready;
      this.clients = s.clients;
    });
  }

  disconnectedCallback(): void {
    this.unsub?.();
  }

  private tagsForClient(id: string): ClientTag[] {
    if (id.endsWith('1')) return ['Premium'];
    if (id.endsWith('2') || id.endsWith('5')) return ['Recurrent'];
    return [];
  }

  private initials(name: string) {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('');
  }

  private filtered() {
    const q = this.query.trim().toLowerCase();
    if (!q) return this.clients;
    return this.clients.filter((c) => {
      const hay = `${c.name} ${c.address ?? ''} ${c.notes ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }

  private closeDetail() {
    this.selectedId = undefined;
  }

  private async onAdd() {
    if (!this.formName.trim()) return;
    await addClient({ name: this.formName, address: this.formAddress, notes: this.formNotes });
    this.addOpen = false;
    this.formName = '';
    this.formAddress = '';
    this.formNotes = '';
  }

  render() {
    const rows = this.filtered();
    const selected = this.selectedId ? this.clients.find((c) => c.id === this.selectedId) : undefined;

    return html`
      <section class="fade-up max-w-[560px] mx-auto">
        <div class="sticky top-16 z-10 -mx-3 px-3 py-2" style="background: var(--bg0);">
          <div
            class="flex items-center gap-2 px-3 py-2 rounded-full"
            style="background: var(--surface); border: 1px solid var(--border);"
          >
            <ac-icon name="search" size="18" color="var(--muted)"></ac-icon>
            <input
              class="flex-1 bg-transparent outline-none text-sm"
              placeholder="Buscar clientes"
              .value=${this.query}
              @input=${(e: Event) => (this.query = (e.target as HTMLInputElement).value)}
            />
          </div>
        </div>

        <div class="flex items-center justify-between gap-3 mb-3 mt-2">
          <div>
            <h2 class="text-lg font-semibold text-strong">Clientes</h2>
            <p class="text-sm text-muted">Agenda y notas rápidas</p>
          </div>
          <button class="icon-btn" aria-label="Añadir cliente" @click=${() => (this.addOpen = true)}>
            <ac-icon name="plus" size="18" color="var(--text)"></ac-icon>
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
                        <ac-skeleton width="40" height="40" radius="999"></ac-skeleton>
                        <div class="flex-1 space-y-2">
                          <ac-skeleton width="220" height="14"></ac-skeleton>
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
                <div class="p-8 text-center">
                  <div class="mx-auto w-12 h-12 rounded-full flex items-center justify-center" style="background: var(--surface-strong); border: 1px solid var(--border);">
                    <ac-icon name="user" size="22" color="var(--muted)"></ac-icon>
                  </div>
                  <p class="mt-3 font-medium">No hay resultados</p>
                  <p class="text-sm text-muted mt-1">Crea tu primer cliente para empezar.</p>
                  <div class="mt-4">
                    <ac-button @click=${() => (this.addOpen = true)}>Add client</ac-button>
                  </div>
                </div>
              `
            : rows.map((client, idx) => {
                const tags = this.tagsForClient(client.id);
                return html`
                  <button
                    class="w-full text-left px-4 py-3 hover:bg-black/5 dark:hover:bg-white/10 transition"
                    style=${idx === rows.length - 1 ? '' : 'border-bottom: 1px solid var(--border);'}
                    role="listitem"
                    @click=${() => (this.selectedId = client.id)}
                  >
                    <div class="flex items-center gap-3">
                      <div
                        class="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
                        style="background: color-mix(in srgb, var(--accent) 10%, var(--surface) 90%); border: 1px solid color-mix(in srgb, var(--accent) 18%, var(--border) 82%); color: var(--accent-strong);"
                        aria-hidden="true"
                      >
                        ${this.initials(client.name)}
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between gap-3">
                          <p class="font-medium truncate">${client.name}</p>
                          <ac-icon name="chevron-right" size="16" color="var(--muted)"></ac-icon>
                        </div>
                        <p class="text-sm text-muted truncate">
                          ${client.address || client.notes || 'Sin notas'}
                        </p>
                        ${tags.length
                          ? html`
                              <div class="mt-1 flex gap-2">
                                ${tags.map(
                                  (t) => html`
                                    <span
                                      class="text-[11px] px-2 py-0.5 rounded-full"
                                      style="background: var(--surface-strong); border: 1px solid var(--border); color: var(--muted);"
                                      >${t}</span
                                    >
                                  `
                                )}
                              </div>
                            `
                          : null}
                      </div>
                    </div>
                  </button>
                `;
              })}
        </div>
      </section>

      <!-- Detail sheet -->
      ${selected
        ? html`
            <div
              class="fixed inset-0 z-40"
              style="background: rgba(15, 23, 42, 0.22);"
              @click=${this.closeDetail}
            ></div>
            <div
              class="fixed z-50 right-0 bottom-0 top-0 w-full max-w-[520px] p-4"
              style="background: var(--bg1); border-left: 1px solid var(--border);"
              @click=${(e: Event) => e.stopPropagation()}
            >
              <div class="flex items-center justify-between">
                <p class="font-semibold text-strong">Cliente</p>
                <button class="icon-btn" aria-label="Cerrar" @click=${this.closeDetail}>
                  <ac-icon name="close" size="18" color="var(--text)"></ac-icon>
                </button>
              </div>

              <div
                class="mt-3 rounded-2xl p-4"
                style="background: var(--surface); border: 1px solid var(--border);"
              >
                <p class="text-xl font-semibold">${selected.name}</p>
                <div class="mt-3 space-y-2 text-sm">
                  <div>
                    <p class="text-xs text-muted">Dirección</p>
                    <p class="text-strong">${selected.address || '—'}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted">Notas</p>
                    <p class="text-strong">${selected.notes || '—'}</p>
                  </div>
                </div>
                <div class="mt-4 grid grid-cols-2 gap-2">
                  <ac-button variant="secondary" block @click=${this.closeDetail}>Llamar</ac-button>
                  <ac-button variant="ghost" block @click=${this.closeDetail}>Nuevo job</ac-button>
                </div>
              </div>
            </div>
          `
        : null}

      <!-- Add client modal -->
      <ac-modal .open=${this.addOpen} title="Nuevo cliente" @close=${() => (this.addOpen = false)}>
        <div class="space-y-3">
          <div>
            <label class="text-xs text-muted">Nombre</label>
            <input
              class="w-full mt-1 px-3 py-2 rounded-xl outline-none"
              style="background: var(--surface); border: 1px solid var(--border);"
              .value=${this.formName}
              @input=${(e: Event) => (this.formName = (e.target as HTMLInputElement).value)}
            />
          </div>
          <div>
            <label class="text-xs text-muted">Dirección</label>
            <input
              class="w-full mt-1 px-3 py-2 rounded-xl outline-none"
              style="background: var(--surface); border: 1px solid var(--border);"
              .value=${this.formAddress}
              @input=${(e: Event) => (this.formAddress = (e.target as HTMLInputElement).value)}
            />
          </div>
          <div>
            <label class="text-xs text-muted">Notas</label>
            <textarea
              class="w-full mt-1 px-3 py-2 rounded-xl outline-none"
              style="background: var(--surface); border: 1px solid var(--border);"
              rows="3"
              .value=${this.formNotes}
              @input=${(e: Event) => (this.formNotes = (e.target as HTMLTextAreaElement).value)}
            ></textarea>
          </div>
          <div class="flex gap-2">
            <ac-button variant="ghost" block @click=${() => (this.addOpen = false)}>Cancelar</ac-button>
            <ac-button block @click=${this.onAdd}>Guardar</ac-button>
          </div>
        </div>
      </ac-modal>
    `;
  }
}
