import '../components/ac-button';
import '../components/ac-checklist';
import '../components/ac-icon';
import '../components/ac-modal';
import '../components/ac-photo-uploader';
import '../components/ac-skeleton';
import '../components/ac-timer';

import { ChecklistItem, ServiceJob } from '@core/entities/types';
import { sanitizeText } from '@shared/sanitize';
import dayjs from 'dayjs';
import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { BaseComponent } from '../components/base';
import {
  addEvidence,
  exportPdf,
  getClient,
  getEvidence,
  startCheckIn,
  startTrial,
  stopCheckOut,
  subscribe,
  updateChecklist
} from '../state/store';

@customElement('job-detail-page')
export class JobDetailPage extends BaseComponent {
  @property({ type: String }) declare jobId: string;
  @state() declare job?: ServiceJob;
  @state() declare evidenceChecklist: ChecklistItem[];
  @state() declare timerStart: string;
  @state() declare clientName: string;
  @state() declare showPremium: boolean;

  private unsub?: () => void;
  private loadedClientId?: string;

  async connectedCallback() {
    super.connectedCallback();
    this.jobId = this.jobId || window.location.pathname.split('/').pop() || '';
    this.evidenceChecklist = [];
    this.timerStart = '';
    this.clientName = '';
    this.showPremium = false;

    this.unsub = subscribe((s) => {
      this.job = s.jobs.find((j) => j.id === this.jobId);
      if (this.job?.clientId) this.ensureClientName(this.job.clientId);
    });

    const evidence = await getEvidence(this.jobId);
    if (evidence) this.evidenceChecklist = evidence.checklist;
  }

  disconnectedCallback(): void {
    this.unsub?.();
  }

  private async ensureClientName(clientId: string) {
    if (this.loadedClientId === clientId) return;
    this.loadedClientId = clientId;
    const client = await getClient(clientId);
    this.clientName = client?.name || '';
  }

  private go(path: string) {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  private onChecklistChange(items: ChecklistItem[]) {
    this.evidenceChecklist = [...items];
    updateChecklist(this.jobId, this.evidenceChecklist);
  }

  private async onAddPhoto(detail: string, type: 'before' | 'after') {
    await addEvidence(this.jobId, detail, type);
  }

  private async onStart() {
    await startCheckIn(this.jobId);
    this.timerStart = new Date().toISOString();
  }

  private async onStop() {
    await stopCheckOut(this.jobId);
  }

  private renderBody(job: ServiceJob) {
    const when = dayjs(job.scheduledAt).format('DD MMM · HH:mm');
    return html`
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-xs text-muted">${when}</p>
          <h2 class="text-xl font-semibold">${this.clientName || job.clientId}</h2>
          <p class="text-sm text-muted capitalize">${job.type}</p>
        </div>
        <button class="icon-btn" aria-label="Cerrar" @click=${() => this.go('/jobs')}>
          <ac-icon name="close" size="18" color="var(--text)"></ac-icon>
        </button>
      </div>

      <div class="mt-4 space-y-3">
        <div class="rounded-2xl p-4" style="background: var(--surface); border: 1px solid var(--border);">
          <div class="flex items-center justify-between gap-3">
            <ac-timer start=${this.timerStart} .running=${true}></ac-timer>
            <div class="grid gap-2">
              <ac-button @click=${this.onStart} style="width: 160px;">Iniciar</ac-button>
              <ac-button variant="ghost" @click=${this.onStop} style="width: 160px;">Cerrar</ac-button>
            </div>
          </div>
          <p class="mt-2 text-xs text-muted">Botones grandes, modo una mano.</p>
        </div>

        <div class="rounded-2xl p-4" style="background: var(--surface); border: 1px solid var(--border);">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">Checklist</h3>
            <button class="chip-btn" @click=${() => (this.showPremium = true)}>Premium</button>
          </div>
          <div class="mt-3">
            <ac-checklist
              .items=${this.evidenceChecklist}
              @change=${(e: CustomEvent<ChecklistItem[]>) => this.onChecklistChange(e.detail)}
            ></ac-checklist>
          </div>
        </div>

        <div class="rounded-2xl p-4" style="background: var(--surface); border: 1px solid var(--border);">
          <h3 class="font-semibold">Evidencias</h3>
          <div class="mt-3 flex gap-2 flex-wrap">
            <ac-photo-uploader
              label="Foto antes"
              @photo=${(e: CustomEvent<string>) => this.onAddPhoto(e.detail, 'before')}
            ></ac-photo-uploader>
            <ac-photo-uploader
              label="Foto después"
              @photo=${(e: CustomEvent<string>) => this.onAddPhoto(e.detail, 'after')}
            ></ac-photo-uploader>
          </div>
          <textarea
            class="w-full mt-3 px-3 py-2 rounded-xl outline-none"
            style="background: var(--surface); border: 1px solid var(--border);"
            placeholder="Notas"
            @change=${(e: Event) => (job.notes = sanitizeText((e.target as HTMLTextAreaElement).value))}
          ></textarea>
          <div class="mt-3">
            <ac-button variant="secondary" @click=${() => exportPdf(this.jobId)}
              >Exportar PDF</ac-button
            >
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const isDesktop = window.matchMedia('(min-width: 900px)').matches;
    if (!this.job) {
      return html`
        <section class="max-w-[560px] mx-auto space-y-3 fade-up">
          <div class="flex items-center justify-between">
            <ac-skeleton width="220" height="22"></ac-skeleton>
            <ac-skeleton width="40" height="40" radius="999"></ac-skeleton>
          </div>
          <ac-skeleton width="520" height="120" radius="18"></ac-skeleton>
          <ac-skeleton width="520" height="180" radius="18"></ac-skeleton>
        </section>
      `;
    }

    const content = html`<section class="max-w-[560px] mx-auto fade-up">
      ${this.renderBody(this.job)}
    </section>`;

    return html`
      ${isDesktop
        ? html`
            <div class="fixed inset-0 z-40" style="background: rgba(15, 23, 42, 0.22);" @click=${() =>
              this.go('/jobs')}></div>
            <div
              class="fixed z-50 right-0 bottom-0 top-0 w-full max-w-[560px] p-4 overflow-auto"
              style="background: var(--bg1); border-left: 1px solid var(--border);"
              @click=${(e: Event) => e.stopPropagation()}
            >
              ${this.renderBody(this.job)}
            </div>
          `
        : content}

      <ac-modal .open=${this.showPremium} title="Premium" @close=${() => (this.showPremium = false)}>
        <div class="space-y-2">
          <p>Desbloquea exportar PDF, checklist avanzado y tips.</p>
          <ul class="text-sm space-y-1" style="color: var(--text);">
            <li class="flex items-center gap-2"><ac-icon name="check" size="16"></ac-icon> KPIs avanzados</li>
            <li class="flex items-center gap-2"><ac-icon name="check" size="16"></ac-icon> Informe PDF firmado</li>
            <li class="flex items-center gap-2"><ac-icon name="check" size="16"></ac-icon> Prioridad en Mercado</li>
          </ul>
          <div class="grid grid-cols-2 gap-2 mt-3">
            <ac-button block @click=${startTrial}>Probar 7 días</ac-button>
            <ac-button block variant="ghost" @click=${() => (this.showPremium = false)}>Luego</ac-button>
          </div>
        </div>
      </ac-modal>
    `;
  }
}

