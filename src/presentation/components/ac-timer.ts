import dayjs from 'dayjs';
import { css, html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('ac-timer')
export class AcTimer extends LitElement {
  static properties = {
    start: { type: String },
    running: { type: Boolean }
  };

  declare start: string;
  declare running: boolean;
  @state() declare now: number;
  private interval?: number;

  constructor() {
    super();
    this.start = '';
    this.running = false;
    this.now = Date.now();
  }

  static styles = css`
    .timer {
      font-variant-numeric: tabular-nums;
      font-size: 24px;
      font-weight: 800;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.tick();
    this.interval = window.setInterval(() => this.tick(), 1000);
  }

  disconnectedCallback(): void {
    if (this.interval) window.clearInterval(this.interval);
  }

  private tick() {
    this.now = Date.now();
  }

  render() {
    const diff = this.running && this.start ? dayjs(this.now).diff(dayjs(this.start), 'second') : 0;
    const mins = Math.floor(diff / 60)
      .toString()
      .padStart(2, '0');
    const secs = (diff % 60).toString().padStart(2, '0');
    return html`<div class="timer">${mins}:${secs}</div>`;
  }
}
