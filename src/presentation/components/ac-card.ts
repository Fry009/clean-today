import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('ac-card')
export class AcCard extends LitElement {
  static properties = {
    variant: { type: String }
  };

  declare variant: 'default' | 'glass' | 'soft' | 'hero';

  constructor() {
    super();
    this.variant = 'default';
  }

  static styles = css`
    :host {
      display: block;
    }
    .card {
      border-radius: 18px;
      padding: 16px;
      animation: fadeIn 0.25s ease;
    }
    .glass {
      background: var(--surface);
      border: 1px solid var(--border);
      box-shadow: var(--shadow-soft);
      color: var(--text);
    }
    .soft {
      background: var(--surface-strong);
      border: 1px solid var(--border);
      box-shadow: none;
      color: var(--text);
    }
    .default {
      background: var(--surface);
      border: 1px solid var(--border);
      box-shadow: none;
      color: var(--text);
    }
    .hero {
      background: color-mix(in srgb, var(--accent) 10%, var(--surface) 90%);
      border: 1px solid color-mix(in srgb, var(--accent) 22%, var(--border) 78%);
      box-shadow: none;
      color: var(--text);
    }
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(6px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  render() {
    return html`<div class="card ${this.variant}"><slot></slot></div>`;
  }
}
