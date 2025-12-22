import { css, html,LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('ac-skeleton')
export class AcSkeleton extends LitElement {
  static properties = {
    width: { type: Number },
    height: { type: Number },
    radius: { type: Number }
  };

  declare width: number;
  declare height: number;
  declare radius: number;

  constructor() {
    super();
    this.width = 100;
    this.height = 16;
    this.radius = 12;
  }

  static styles = css`
    :host {
      display: inline-block;
    }
    .block {
      background: color-mix(in srgb, var(--surface-strong) 92%, black 8%);
      animation: pulse 1.25s ease-in-out infinite;
    }
    @keyframes pulse {
      0% {
        opacity: 0.65;
      }
      100% {
        opacity: 1;
      }
    }
  `;

  render() {
    return html`<div class="block" style=${`width:${this.width}px;height:${this.height}px;border-radius:${this.radius}px;`}></div>`;
  }
}
