import './ac-icon';

import { css,html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import type { IconName } from './ac-icon';

type TabItem = { label: string; icon: IconName; path: string };

const tabs: TabItem[] = [
  { label: 'Dashboard', icon: 'home', path: '/dashboard' },
  { label: 'Market', icon: 'search', path: '/market' },
  { label: 'Ofertas', icon: 'bookmark', path: '/offers' },
  { label: 'Oportunidades', icon: 'bookmark', path: '/opportunities' },
  { label: 'Calendario', icon: 'calendar', path: '/calendar' },
  { label: 'Jobs', icon: 'briefcase', path: '/jobs' },
  { label: 'KPIs', icon: 'graph', path: '/kpis' },
  { label: 'Perfil', icon: 'user', path: '/profile' }
];

@customElement('ac-tabbar')
export class AcTabbar extends LitElement {
  static properties = {
    activePath: { type: String }
  };

  declare activePath: string;

  constructor() {
    super();
    this.activePath = '/';
  }

  static styles = css`
    :host {
      pointer-events: none;
    }
    nav {
      position: fixed;
      bottom: 8px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      pointer-events: auto;
      z-index: 40;
    }
    .bar {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 6px;
      background: var(--surface);
      border: 1px solid var(--border);
      box-shadow: none;
      border-radius: 999px;
      padding: 6px;
      min-width: 460px;
      max-width: 640px;
    }
    button {
      border: none;
      background: transparent;
      border-radius: 999px;
      padding: 8px 6px;
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      color: var(--text-muted);
      font-weight: 600;
      font-size: 10px;
      transition: transform 0.15s ease, background-color 0.2s ease, color 0.2s ease;
    }
    button.active {
      background: color-mix(in srgb, var(--accent) 14%, transparent 86%);
      color: var(--accent-strong);
    }
    button:active {
      transform: scale(0.98);
    }
    @media (min-width: 900px) {
      nav {
        display: none;
      }
    }
  `;

  private navigate(path: string) {
    this.dispatchEvent(new CustomEvent('navigate', { detail: path }));
  }

  render() {
    return html`
      <nav aria-label="Bottom navigation">
        <div class="bar">
          ${tabs.map(
            (tab) => html`<button
              class=${this.activePath === tab.path ? 'active' : ''}
              @click=${() => this.navigate(tab.path)}
            >
              <ac-icon
                .name=${tab.icon}
                size="18"
                color=${this.activePath === tab.path ? 'var(--accent)' : 'var(--muted)'}
              ></ac-icon>
              <span>${tab.label}</span>
            </button>`
          )}
        </div>
      </nav>
    `;
  }
}
