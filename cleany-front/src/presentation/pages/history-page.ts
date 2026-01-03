import '../components/ac-card';

import { html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { BaseComponent } from '../components/base';

@customElement('history-page')
export class HistoryPage extends BaseComponent {
  render() {
    return html`
      <section class="space-y-3">
        <ac-card>
          <h2 class="text-xl font-bold">Historial</h2>
          <p class="text-sm text-slate-600">Próximamente: historial de clientes y notas.</p>
        </ac-card>
      </section>
    `;
  }
}
