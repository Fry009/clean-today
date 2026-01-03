import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('ac-button')
export class AcButton extends LitElement {
  static properties = {
    variant: { type: String },
    disabled: { type: Boolean, reflect: true },
    block: { type: Boolean, reflect: true }
  };

  declare variant: 'primary' | 'ghost' | 'secondary';
  declare disabled: boolean;
  declare block: boolean;

  constructor() {
    super();
    this.variant = 'primary';
    this.disabled = false;
    this.block = false;
  }

  static styles = css`
    :host {
      display: inline-block;
    }
    :host button {
      width: auto;
      border-radius: 999px;
      padding: 12px 14px;
      font-weight: 650;
      border: 1px solid transparent;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: transform 0.12s ease, background-color 0.2s ease, border-color 0.2s ease,
        filter 0.2s ease;
    }
    :host([block]) {
      display: block;
    }
    :host([block]) button {
      width: 100%;
    }
    :host button:active {
      transform: translateY(1px) scale(0.99);
    }
    :host([disabled]) button {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .primary {
      background: var(--accent);
      color: white;
    }
    .primary:hover {
      filter: brightness(0.98);
    }
    .secondary {
      background: var(--surface);
      color: var(--text);
      border: 1px solid var(--border);
    }
    .ghost {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text);
    }
    .ghost:hover,
    .secondary:hover {
      background: color-mix(in srgb, var(--accent) 6%, var(--surface) 94%);
      border-color: color-mix(in srgb, var(--accent) 22%, var(--border) 78%);
    }
  `;

  render() {
    return html`<button class=${this.variant} ?disabled=${this.disabled}>
      <slot></slot>
    </button>`;
  }
}
