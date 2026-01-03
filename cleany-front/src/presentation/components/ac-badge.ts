import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('ac-badge')
export class AcBadge extends LitElement {
  static properties = {
    label: { type: String },
    color: { type: String }
  };

  declare label: string;
  declare color: 'green' | 'blue' | 'yellow';

  constructor() {
    super();
    this.label = '';
    this.color = 'green';
  }

  static styles = css`
    :host {
      display: inline-block;
    }
    .badge {
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      display: inline-flex;
      gap: 6px;
      align-items: center;
      border: 1px solid var(--border);
      box-shadow: none;
    }
    .green {
      background: color-mix(in srgb, #dcfce7 85%, white 15%);
      color: #166534;
    }
    .blue {
      background: color-mix(in srgb, #dbeafe 85%, white 15%);
      color: #1d4ed8;
    }
    .yellow {
      background: color-mix(in srgb, #fef9c3 85%, white 15%);
      color: #854d0e;
    }
  `;

  render() {
    return html`<span class="badge ${this.color}">${this.label}</span>`;
  }
}
