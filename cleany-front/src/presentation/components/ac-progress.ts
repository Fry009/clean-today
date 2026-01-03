import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('ac-progress')
export class AcProgress extends LitElement {
  static properties = {
    value: { type: Number }
  };

  declare value: number;

  constructor() {
    super();
    this.value = 0;
  }

  static styles = css`
    :host {
      display: block;
    }
    .bar {
      background: color-mix(in srgb, var(--border) 40%, transparent 60%);
      height: 4px;
      border-radius: 999px;
      overflow: hidden;
    }
    .fill {
      height: 100%;
      background: var(--accent);
      transition: width 0.2s ease;
    }
  `;

  render() {
    const safe = Math.max(0, Math.min(100, this.value));
    return html`<div class="bar"><div class="fill" style="width:${safe}%"></div></div>`;
  }
}
