import { ChecklistItem } from '@core/entities/types';
import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('ac-checklist')
export class AcChecklist extends LitElement {
  static properties = {
    items: { type: Array }
  };

  declare items: ChecklistItem[];

  constructor() {
    super();
    this.items = [];
  }

  static styles = css`
    :host {
      display: block;
      color: var(--text);
    }
    .item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 0;
      border-bottom: 1px dashed color-mix(in srgb, var(--border) 80%, transparent 20%);
    }
    .item:last-child {
      border-bottom: none;
    }
    input {
      width: 18px;
      height: 18px;
      margin-top: 2px;
      accent-color: var(--primary1);
    }
    .label {
      font-weight: 700;
      font-size: 14px;
    }
    .required {
      display: inline-flex;
      align-items: center;
      margin-top: 2px;
      font-size: 12px;
      color: color-mix(in srgb, var(--danger) 70%, var(--text) 30%);
      font-weight: 700;
    }
  `;

  private toggle(item: ChecklistItem) {
    item.done = !item.done;
    this.dispatchEvent(new CustomEvent('change', { detail: this.items }));
    this.requestUpdate();
  }

  render() {
    return html`${this.items.map(
      (item) => html`<div class="item">
        <input type="checkbox" ?checked=${item.done} @change=${() => this.toggle(item)} />
        <div>
          <div class="label">${item.label}</div>
          ${item.required ? html`<div class="required">Obligatorio</div>` : null}
        </div>
      </div>`
    )}`;
  }
}
