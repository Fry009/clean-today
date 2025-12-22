import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('ac-chip')
export class AcChip extends LitElement {
  static properties = {
    color: { type: String },
    selected: { type: Boolean }
  };

  declare color: 'blue' | 'green' | 'amber' | 'gray' | 'neutral';
  declare selected: boolean;

  constructor() {
    super();
    this.color = 'blue';
    this.selected = false;
  }

  static styles = css`
    :host {
      display: inline-block;
    }
    .chip {
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: 1px solid var(--border);
      cursor: pointer;
      background: var(--surface);
      color: var(--text);
    }
    .blue {
      background: color-mix(in srgb, var(--accent) 14%, var(--surface-strong) 86%);
      border-color: color-mix(in srgb, var(--accent) 28%, var(--border) 72%);
      color: var(--accent-strong);
    }
    .green {
      background: color-mix(in srgb, var(--success) 14%, var(--surface-strong) 86%);
      border-color: color-mix(in srgb, var(--success) 26%, var(--border) 74%);
      color: color-mix(in srgb, var(--success) 70%, black 30%);
    }
    .amber {
      background: color-mix(in srgb, var(--warning) 14%, var(--surface-strong) 86%);
      border-color: color-mix(in srgb, var(--warning) 26%, var(--border) 74%);
      color: color-mix(in srgb, var(--warning) 70%, black 30%);
    }
    .gray {
      background: var(--surface-strong);
      border-color: var(--border);
      color: var(--muted);
    }
    .neutral {
      background: var(--surface-strong);
      color: var(--muted);
      border-color: var(--border);
    }
    .selected {
      outline: 2px solid color-mix(in srgb, var(--accent) 70%, transparent 30%);
      color: var(--accent-strong);
    }
  `;

  render() {
    const classes = ['chip', this.color, this.selected ? 'selected' : ''].join(' ');
    return html`<span class=${classes}><slot></slot></span>`;
  }
}
