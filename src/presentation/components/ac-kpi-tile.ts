import './ac-icon';

import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import type { IconName } from './ac-icon';

@customElement('ac-kpi-tile')
export class AcKpiTile extends LitElement {
  static properties = {
    label: { type: String },
    value: { type: String },
    trend: { type: String }
  };

  declare label: string;
  declare value: string;
  declare trend: 'up' | 'down' | 'flat';

  constructor() {
    super();
    this.label = '';
    this.value = '';
    this.trend = 'flat';
  }

  static styles = css`
    .tile {
      padding: 14px;
      border-radius: 14px;
      background: var(--surface);
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px solid var(--border);
      box-shadow: none;
    }
    .label {
      font-size: 12px;
      color: var(--muted);
      font-weight: 600;
    }
    .value {
      font-size: 22px;
      font-weight: 650;
    }
    .trend {
      font-size: 12px;
      color: var(--accent);
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
  `;

  render() {
    const trendIcon: IconName = this.trend === 'up' ? 'check' : this.trend === 'down' ? 'x' : 'minus';
    return html`<div class="tile">
      <div>
        <p class="label">${this.label}</p>
        <p class="value">${this.value}</p>
      </div>
      <span class="trend">
        <ac-icon .name=${trendIcon} size="18"></ac-icon>
      </span>
    </div>`;
  }
}
