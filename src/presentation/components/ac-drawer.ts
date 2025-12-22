import './ac-icon';
import './ac-chip';

import { css,html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import type { IconName } from './ac-icon';

type DrawerItem = {
  label: string;
  icon: IconName;
  badge?: string;
  path?: string;
  children?: DrawerItem[];
};

const items: DrawerItem[] = [
  { label: 'Dashboard', icon: 'home', path: '/dashboard' },
  { label: 'Calendario', icon: 'calendar', path: '/calendar' },
  { label: 'Jobs', icon: 'briefcase', path: '/jobs' },
  { label: 'Clientes', icon: 'user', path: '/clients' },
  { label: 'Mercado', icon: 'bolt', path: '/leads', badge: '10' },
  {
    label: 'Analíticas',
    icon: 'graph',
    children: [
      { label: 'KPIs', icon: 'graph', path: '/kpis', badge: '12' },
      { label: 'Historial', icon: 'bookmark', path: '/history' }
    ]
  },
  {
    label: 'Cuenta',
    icon: 'shield',
    children: [
      { label: 'Perfil', icon: 'user', path: '/profile' },
      { label: 'Ajustes', icon: 'shield', path: '/settings' },
      { label: 'Premium', icon: 'trophy', path: '/premium' }
    ]
  },
  { label: 'Ayuda', icon: 'info', path: '/help' }
];

@customElement('ac-drawer')
export class AcDrawer extends LitElement {
  static properties = {
    open: { type: Boolean },
    persistent: { type: Boolean },
    activePath: { type: String }
  };

  declare open: boolean;
  declare persistent: boolean;
  declare activePath: string;
  private expanded: Record<string, boolean>;

  constructor() {
    super();
    this.open = false;
    this.persistent = false;
    this.activePath = '/';
    this.expanded = {};
  }

  static styles = css`
    :host {
      display: block;
      height: 100%;
    }
    .drawer {
      width: 280px;
      height: 100vh;
      background: var(--surface);
      border-right: 1px solid var(--border);
      transform: translateX(-110%);
      transition: transform 0.25s ease;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 50;
      display: flex;
      flex-direction: column;
    }
    .drawer.open {
      transform: translateX(0);
    }
    .header {
      padding: 16px 14px 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      justify-content: space-between;
      border-bottom: 1px solid var(--border);
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }
    .header img {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      border: 1px solid var(--border);
    }
    .items {
      padding: 10px 10px 16px;
      display: grid;
      gap: 4px;
      overflow-y: auto;
      flex: 1;
    }
    .plan {
      font-size: 12px;
      color: var(--muted);
      margin: 0;
    }
    .name {
      margin: 2px 0 0;
      font-weight: 700;
      font-size: 14px;
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .meta-row {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 12px;
      color: var(--muted);
      margin-top: 6px;
    }
    .meta-star {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #f59e0b;
      font-weight: 700;
    }
    .item-left {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-weight: 650;
    }
    .count {
      padding: 2px 8px;
      font-size: 12px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--accent) 14%, var(--surface) 86%);
      color: var(--accent-strong);
      font-weight: 750;
      border: 1px solid color-mix(in srgb, var(--accent) 22%, var(--border) 78%);
    }
    button.item {
      width: 100%;
      border: none;
      background: transparent;
      border-radius: 14px;
      padding: 10px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: var(--text);
      transition: background-color 0.15s ease, transform 0.1s ease;
      cursor: pointer;
    }
    button.item:hover {
      background: color-mix(in srgb, var(--accent) 6%, var(--surface) 94%);
    }
    button.item.active {
      background: color-mix(in srgb, var(--accent) 12%, var(--surface) 88%);
      color: var(--text);
    }
    button.item:active {
      transform: scale(0.99);
    }

    .group-chevron {
      transition: transform 0.2s ease;
    }
    .group-chevron.open {
      transform: rotate(90deg);
    }

    .submenu {
      overflow: hidden;
      max-height: 0px;
      transition: max-height 0.25s ease;
    }
    .submenu.open {
      max-height: var(--submenu-height, 0px);
    }
    button.subitem {
      width: 100%;
      border: none;
      background: transparent;
      border-radius: 12px;
      padding: 9px 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: var(--text);
      cursor: pointer;
      transition: background-color 0.15s ease;
      margin-left: 10px;
    }
    button.subitem:hover {
      background: color-mix(in srgb, var(--accent) 6%, var(--surface) 94%);
    }
    button.subitem.active {
      background: color-mix(in srgb, var(--accent) 12%, var(--surface) 88%);
    }
    .subitem-left {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
      font-size: 13px;
    }

    .footer {
      padding: 12px 16px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      color: var(--muted);
      border-top: 1px solid var(--border);
    }
    .logout {
      border: none;
      background: transparent;
      color: var(--accent-strong);
      cursor: pointer;
      font-weight: 700;
    }
    .close-btn {
      border: none;
      background: transparent;
      padding: 8px;
      border-radius: 999px;
      cursor: pointer;
      color: var(--muted);
    }
    .close-btn:hover {
      background: color-mix(in srgb, var(--accent) 6%, var(--surface) 94%);
    }
    @media (min-width: 900px) {
      .drawer {
        position: sticky;
        top: 0;
        transform: translateX(0);
      }
      .close-btn {
        display: none;
      }
    }
  `;

  private emitNavigate(path: string) {
    this.dispatchEvent(new CustomEvent('navigate', { detail: path }));
  }

  private toggleGroup(label: string) {
    this.expanded = { ...this.expanded, [label]: !this.expanded[label] };
    this.requestUpdate();
  }

  render() {
    return html`
      <aside class="drawer ${this.open || this.persistent ? 'open' : ''}">
        <div class="header">
          <div class="header-left">
            <img src="https://i.pravatar.cc/120?img=47" alt="avatar" />
            <div>
              <p class="plan">Plan FREE</p>
              <p class="name">Ana Campos</p>
              <div class="meta-row">
                <span class="meta-star">
                  <ac-icon name="star" size="14" color="#f59e0b"></ac-icon>
                  4.5
                </span>
                <span>35</span>
              </div>
            </div>
          </div>
          <button class="close-btn" aria-label="Cerrar" @click=${() => this.dispatchEvent(new CustomEvent('close'))}>
            <ac-icon name="close" size="18"></ac-icon>
          </button>
        </div>
        <div class="items">
          ${items.map(
            (item) => {
              const hasChildren = Boolean(item.children?.length);
              const childActive = Boolean(item.children?.some((c) => c.path === this.activePath));
              const open = this.expanded[item.label] ?? childActive;
              if (!hasChildren) {
                const path = item.path ?? '/';
                return html`
                  <button
                    class="item ${this.activePath === path ? 'active' : ''}"
                    @click=${() => this.emitNavigate(path)}
                  >
                    <span class="item-left">
                      <ac-icon .name=${item.icon} size="18"></ac-icon>
                      ${item.label}
                    </span>
                    ${item.badge ? html`<span class="count">${item.badge}</span>` : null}
                  </button>
                `;
              }
              const height = `${(item.children?.length ?? 0) * 42}px`;
              return html`
                <button class="item ${childActive ? 'active' : ''}" @click=${() => this.toggleGroup(item.label)}>
                  <span class="item-left">
                    <ac-icon .name=${item.icon} size="18"></ac-icon>
                    ${item.label}
                  </span>
                  <ac-icon
                    class="group-chevron ${open ? 'open' : ''}"
                    name="chevron-right"
                    size="16"
                    color="var(--muted)"
                  ></ac-icon>
                </button>
                <div
                  class="submenu ${open ? 'open' : ''}"
                  style=${`--submenu-height:${height};`}
                  aria-hidden=${open ? 'false' : 'true'}
                >
                  ${item.children?.map((child) => {
                    const childPath = child.path ?? '/';
                    return html`
                      <button
                        class="subitem ${this.activePath === childPath ? 'active' : ''}"
                        @click=${() => this.emitNavigate(childPath)}
                      >
                        <span class="subitem-left">
                          <ac-icon .name=${child.icon} size="18"></ac-icon>
                          ${child.label}
                        </span>
                        ${child.badge ? html`<span class="count">${child.badge}</span>` : null}
                      </button>
                    `;
                  })}
                </div>
              `;
            }
          )}
        </div>
        <div class="footer">
          <span>v1.0.0 beta</span>
          <button class="logout" @click=${() => this.emitNavigate('/logout')}>
            Salir
          </button>
        </div>
      </aside>
    `;
  }
}
