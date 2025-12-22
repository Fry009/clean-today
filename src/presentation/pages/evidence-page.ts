import '../components/ac-card';

import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { BaseComponent } from '../components/base';
import { getEvidence } from '../state/store';

@customElement('evidence-page')
export class EvidencePage extends BaseComponent {
  @property({ type: String }) declare jobId: string;
  @state() declare beforePhotos: string[];
  @state() declare afterPhotos: string[];

  async connectedCallback() {
    super.connectedCallback();
    this.jobId = this.jobId || window.location.pathname.split('/').pop() || '';
    this.beforePhotos = [];
    this.afterPhotos = [];
    const evidence = await getEvidence(this.jobId);
    this.beforePhotos = evidence?.beforePhotos || [];
    this.afterPhotos = evidence?.afterPhotos || [];
  }

  render() {
    return html`
      <section class="space-y-3 fade-up max-w-[520px] mx-auto">
        <div class="px-1">
          <p class="text-sm text-muted">Job</p>
          <h2 class="text-2xl font-extrabold text-strong">Evidencias</h2>
        </div>

        <ac-card variant="glass">
          <h3 class="font-semibold mb-2">Antes</h3>
          <div class="grid grid-cols-3 gap-2">
            ${this.beforePhotos.map((src) => html`<img class="rounded-lg" src=${src} alt="Antes" />`)}
          </div>
        </ac-card>

        <ac-card variant="glass">
          <h3 class="font-semibold mb-2">Después</h3>
          <div class="grid grid-cols-3 gap-2">
            ${this.afterPhotos.map((src) => html`<img class="rounded-lg" src=${src} alt="Después" />`)}
          </div>
        </ac-card>
      </section>
    `;
  }
}

