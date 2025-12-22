import './components';
import './styles/tokens.css';
import './styles/tailwind.css';
import './components/ac-app-shell';

import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import type { AcToast } from './components/ac-toast';
import { createRouter } from './router';
import {
  AppState,
  clearError,
  getState,
  initStore,
  subscribe,
  syncNow,
  toggleTheme
} from './state/store';

@customElement('app-root')
export class AppRoot extends LitElement {
  @state() declare syncing: boolean;
  @state() declare error?: string;
  @state() declare path: string;
  @state() declare appState?: AppState;
  @state() declare drawerOpen: boolean;
  @state() declare overflowOpen: boolean;

  private lastTheme?: string;
  private lastAccent?: string;

  constructor() {
    super();
    this.syncing = false;
    this.error = undefined;
    this.path = window.location.pathname;
    this.drawerOpen = false;
    this.overflowOpen = false;
  }

  protected createRenderRoot() {
    return this;
  }

  async firstUpdated() {
    await initStore();
    const outlet = this.querySelector('#router-outlet');
    if (outlet) createRouter(outlet);

    subscribe((s) => {
      this.appState = s;
      this.syncing = s.syncing;
      this.error = s.error;
      this.applyTheme(s.settings);
      if (s.error) {
        (this.querySelector('#toast') as AcToast | null)?.show(s.error, 'error');
        clearError();
      }
    });

    this.applyTheme(getState().settings);

    window.addEventListener('vaadin-router-location-changed', () => {
      this.path = window.location.pathname;
      this.overflowOpen = false;
    });

    window.addEventListener('click', () => {
      if (this.overflowOpen) this.overflowOpen = false;
    });
  }

  private applyTheme(settings: { theme: string; accent: string }) {
    if (this.lastTheme === settings.theme && this.lastAccent === settings.accent) return;
    this.lastTheme = settings.theme;
    this.lastAccent = settings.accent;
    document.documentElement.setAttribute('data-theme', settings.theme === 'dark' ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
    document.documentElement.classList.remove('theme-ocean', 'theme-forest', 'theme-sunset');
    document.documentElement.classList.add(`theme-${settings.accent}`);
  }

  private headerTitle(path: string) {
    if (path === '/' || path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/calendar')) return 'Calendario';
    if (path.startsWith('/leads')) return 'Mercado';
    if (path.startsWith('/kpis')) return 'KPIs';
    if (path.startsWith('/jobs')) return 'Jobs';
    if (path.startsWith('/clients')) return 'Clientes';
    if (path.startsWith('/settings')) return 'Ajustes';
    if (path.startsWith('/profile')) return 'Perfil';
    if (path.startsWith('/premium')) return 'Premium';
    if (path.startsWith('/help')) return 'Ayuda';
    if (path.startsWith('/history')) return 'Historial';
    return 'Clean Today';
  }

  private go(path: string) {
    window.history.pushState({}, '', path);
    this.path = path;
    this.drawerOpen = false;
    this.overflowOpen = false;
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  render() {
    const title = this.headerTitle(this.path);
    return html`
      <ac-app-shell
        class="app-shell"
        .drawerOpen=${this.drawerOpen}
        .activePath=${this.path}
        @drawer-toggle=${(e: CustomEvent<boolean>) => (this.drawerOpen = e.detail)}
        @navigate=${(e: CustomEvent<string>) => this.go(e.detail)}
      >
        <header
          class="fixed top-0 left-0 right-0 z-30"
          style="background: var(--surface); border-bottom: 1px solid var(--border);"
        >
          <div class="max-w-[1180px] mx-auto px-3 py-2">
            <div class="flex items-center justify-between gap-2">
              <button
                class="icon-btn"
                aria-label="Abrir menú"
                @click=${(e: Event) => {
                  e.stopPropagation();
                  this.drawerOpen = true;
                }}
              >
                <ac-icon name="menu" size="20" color="var(--text)"></ac-icon>
              </button>

              <div class="flex-1 text-center">
                <span class="text-[15px] font-semibold text-strong">${title}</span>
              </div>

              <div class="relative flex items-center gap-2">
                <button
                  class="icon-btn"
                  title="Notificaciones"
                  aria-label="Notificaciones"
                  @click=${(e: Event) => e.stopPropagation()}
                >
                  <ac-icon name="bell" size="18" color="var(--text)"></ac-icon>
                </button>
                <button
                  class="icon-btn"
                  title="Más"
                  aria-label="Más opciones"
                  @click=${(e: Event) => {
                    e.stopPropagation();
                    this.overflowOpen = !this.overflowOpen;
                  }}
                >
                  <ac-icon name="more-vertical" size="18" color="var(--text)"></ac-icon>
                </button>

                ${this.overflowOpen
                  ? html`
                      <div
                        class="absolute right-0 top-11 w-56 rounded-2xl p-1"
                        style="background: var(--surface); border: 1px solid var(--border); box-shadow: var(--shadow);"
                        @click=${(e: Event) => e.stopPropagation()}
                      >
                        <button
                          class="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition text-left"
                          @click=${() => {
                            this.overflowOpen = false;
                            syncNow();
                          }}
                        >
                          <ac-icon name="sync" size="18"></ac-icon>
                          <span class="text-sm font-medium"
                            >${this.syncing ? 'Sincronizando…' : 'Sincronizar ahora'}</span
                          >
                        </button>
                        <button
                          class="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition text-left"
                          @click=${() => {
                            this.overflowOpen = false;
                            this.go('/settings');
                          }}
                        >
                          <ac-icon name="shield" size="18"></ac-icon>
                          <span class="text-sm font-medium">Ajustes</span>
                        </button>
                        <button
                          class="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition text-left"
                          @click=${() => {
                            this.overflowOpen = false;
                            toggleTheme();
                          }}
                        >
                          <ac-icon name="sparkle" size="18"></ac-icon>
                          <span class="text-sm font-medium">Cambiar tema</span>
                        </button>
                      </div>
                    `
                  : null}
              </div>
            </div>
          </div>
        </header>
        <main id="router-outlet" class="pt-16"></main>
      </ac-app-shell>
      <ac-toast id="toast" .message=${this.error ?? ''} variant="error"></ac-toast>
    `;
  }
}

