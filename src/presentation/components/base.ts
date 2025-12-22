import { LitElement } from 'lit';

export class BaseComponent extends LitElement {
  // Use light DOM so Tailwind utility classes apply inside components
  protected createRenderRoot() {
    return this;
  }
}
