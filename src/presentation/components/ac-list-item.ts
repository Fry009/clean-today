import './ac-chip';
import './ac-button';

import { css,html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('ac-list-item')
export class AcListItem extends LitElement {
  static properties = {
    title: { type: String },
    subtitle: { type: String },
    price: { type: String },
    meta: { type: String },
    badge: { type: String },
    cta: { type: String }
  };

  declare title: string;
  declare subtitle: string;
  declare price: string;
  declare meta: string;
  declare badge: string;
  declare cta: string;

  constructor() {
    super();
    this.title = '';
    this.subtitle = '';
    this.price = '';
    this.meta = '';
    this.badge = '';
    this.cta = 'Contactar';
  }

  static styles = css`
    :host {
      display: block;
    }
    .item {
      border-radius: 16px;
      padding: 14px;
      background: var(--surface);
      border: 1px solid var(--border);
      box-shadow: none;
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .head {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .title {
      font-weight: 700;
      color: var(--text);
    }
    .subtitle,
    .meta {
      font-size: 13px;
      color: var(--muted);
    }
    .price {
      font-weight: 800;
      color: var(--accent-strong);
    }
    .actions {
      display: flex;
      flex-direction: column;
      gap: 6px;
      align-items: flex-end;
    }
    button.cta {
      border: 1px solid color-mix(in srgb, var(--accent) 22%, var(--border) 78%);
      border-radius: 12px;
      padding: 8px 12px;
      background: color-mix(in srgb, var(--accent) 10%, var(--surface) 90%);
      color: var(--accent-strong);
      font-weight: 650;
      cursor: pointer;
      box-shadow: none;
    }
  `;

  render() {
    return html`
      <div class="item">
        <div class="content">
          <div class="head">
            ${this.badge ? html`<ac-chip color="gray">${this.badge}</ac-chip>` : null}
            <span class="title">${this.title}</span>
          </div>
          <span class="subtitle">${this.subtitle}</span>
          <span class="meta">${this.meta}</span>
        </div>
        <div class="actions">
          <span class="price">${this.price}</span>
          <button class="cta" @click=${() => this.dispatchEvent(new CustomEvent('primary'))}>${this.cta}</button>
        </div>
      </div>
    `;
  }
}
