import './ac-drawer';
import './ac-tabbar';

import { css,html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('ac-app-shell')
export class AcAppShell extends LitElement {
  static properties = {
    drawerOpen: { type: Boolean },
    activePath: { type: String }
  };

  declare drawerOpen: boolean;
  declare activePath: string;

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
    }
    .layout {
      display: grid;
      grid-template-columns: 0fr 1fr;
      gap: 0;
    }
    .layout.desktop {
      grid-template-columns: 280px 1fr;
      gap: 20px;
      align-items: start;
    }
    .content {
      position: relative;
      min-height: 100vh;
      background: transparent;
    }
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.28);
      z-index: 40;
    }
    @media (min-width: 900px) {
      .drawer-overlay {
        display: none;
      }
    }
  `;

  constructor() {
    super();
    this.drawerOpen = false;
    this.activePath = '/';
  }

  private toggleDrawer(open: boolean) {
    this.drawerOpen = open;
    this.dispatchEvent(new CustomEvent('drawer-toggle', { detail: open }));
  }

  render() {
    const isDesktop = window.matchMedia('(min-width: 900px)').matches;
    const handleNavigate = (e: CustomEvent<string>) => {
      this.dispatchEvent(new CustomEvent('navigate', { detail: e.detail }));
      if (!isDesktop) this.toggleDrawer(false);
    };
    return html`
      <div class="layout ${isDesktop ? 'desktop' : ''}">
        <ac-drawer
          .open=${this.drawerOpen || isDesktop}
          .persistent=${isDesktop}
          .activePath=${this.activePath}
          @navigate=${handleNavigate}
          @close=${() => this.toggleDrawer(false)}
        ></ac-drawer>
        <div class="content">
          ${!isDesktop && this.drawerOpen
            ? html`<div
                class="drawer-overlay overlay"
                aria-hidden="true"
                @click=${() => this.toggleDrawer(false)}
              ></div>`
            : null}
          <slot></slot>
          <ac-tabbar
            .activePath=${this.activePath}
            @navigate=${handleNavigate}
          ></ac-tabbar>
        </div>
      </div>
    `;
  }
}
