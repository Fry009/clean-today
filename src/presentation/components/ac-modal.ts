import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('ac-modal')
export class AcModal extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    title: { type: String }
  };

  declare open: boolean;
  declare title: string;

  constructor() {
    super();
    this.open = false;
    this.title = '';
  }

  static styles = css`
    :host {
      position: fixed;
      inset: 0;
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 40;
    }
    :host([open]) {
      display: flex;
      background: rgba(15, 23, 42, 0.32);
    }
    .modal {
      background: var(--surface);
      padding: 16px;
      border-radius: 16px;
      width: min(480px, 92vw);
      max-height: 90vh;
      overflow: auto;
      box-shadow: var(--shadow-strong);
      border: 1px solid var(--border);
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    button {
      border: none;
      background: transparent;
      font-size: 18px;
      cursor: pointer;
      padding: 4px;
    }
  `;

  private close() {
    this.dispatchEvent(new CustomEvent('close'));
    this.open = false;
  }

  render() {
    return html`
      <div class="modal">
        <header>
          <h3>${this.title}</h3>
          <button aria-label="Cerrar" @click=${this.close}>
            <ac-icon name="close"></ac-icon>
          </button>
        </header>
        <slot></slot>
      </div>
    `;
  }
}
