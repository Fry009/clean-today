import '../components/ac-card';

import { html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { BaseComponent } from '../components/base';

@customElement('help-page')
export class HelpPage extends BaseComponent {
  render() {
    return html`
      <section class="space-y-3">
        <ac-card>
          <h2 class="text-xl font-bold">Ayuda</h2>
          <p class="text-sm text-slate-600">Contacta soporte o revisa FAQs. Próximamente chat.</p>
        </ac-card>
      </section>
    `;
  }
}
