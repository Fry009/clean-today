import '../components/ac-button';
import '../components/ac-icon';

import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { BaseComponent } from '../components/base';
import { getState, setAccent, subscribe, toggleTheme } from '../state/store';

@customElement('settings-page')
export class SettingsPage extends BaseComponent {
  @state() declare settings: ReturnType<typeof getState>['settings'];
  private unsub?: () => void;

  connectedCallback(): void {
    super.connectedCallback();
    this.settings = getState().settings;
    this.unsub = subscribe((s) => (this.settings = s.settings));
  }

  disconnectedCallback(): void {
    this.unsub?.();
  }

  private themeLabel() {
    return this.settings.theme === 'dark' ? 'Oscuro' : 'Claro';
  }

  render() {
    const accent = this.settings.accent;
    return html`
      <section class="fade-up max-w-[560px] mx-auto">
        <h2 class="text-lg font-semibold text-strong mb-3">Ajustes</h2>

        <div
          class="rounded-2xl overflow-hidden"
          style="background: var(--surface); border: 1px solid var(--border);"
        >
          <button
            class="w-full text-left px-4 py-3 hover:bg-black/5 dark:hover:bg-white/10 transition flex items-center justify-between"
            style="border-bottom: 1px solid var(--border);"
            @click=${toggleTheme}
          >
            <div>
              <p class="font-medium">Tema</p>
              <p class="text-sm text-muted">Cambiar entre claro y oscuro</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-muted">${this.themeLabel()}</span>
              <ac-icon name="chevron-right" size="16" color="var(--muted)"></ac-icon>
            </div>
          </button>

          <div class="px-4 py-3">
            <p class="font-medium">Color</p>
            <p class="text-sm text-muted">Acento de la interfaz</p>
            <div class="mt-3 flex gap-2 flex-wrap">
              <button
                class="chip-btn ${accent === 'ocean' ? 'selected' : ''}"
                @click=${() => setAccent('ocean')}
              >
                Océano
              </button>
              <button
                class="chip-btn ${accent === 'forest' ? 'selected' : ''}"
                @click=${() => setAccent('forest')}
              >
                Bosque
              </button>
              <button
                class="chip-btn ${accent === 'sunset' ? 'selected' : ''}"
                @click=${() => setAccent('sunset')}
              >
                Atardecer
              </button>
            </div>
          </div>
        </div>
      </section>
    `;
  }
}

