import '../components/ac-badge';
import '../components/ac-button';
import '../components/ac-chip';
import '../components/ac-icon';

import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { v4 as uuid } from 'uuid';

import { BaseComponent } from '../components/base';
import { getState, startTrial, subscribe, upgrade } from '../state/store';

type CandidateProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  province: string;
};

type EmployerOffer = {
  id: string;
  title: string;
  applications: number;
};

@customElement('profile-page')
export class ProfilePage extends BaseComponent {
  @state() declare employee: ReturnType<typeof getState>['employee'];
  @state() declare flags: ReturnType<typeof getState>['flags'];
  @state() declare settings: ReturnType<typeof getState>['settings'];
  @state() declare referral: string;
  @state() declare candidateProfile?: CandidateProfile;
  @state() declare candidateError?: string;
  @state() declare employerOffers: EmployerOffer[] = [];
  @state() declare employerError?: string;

  private unsub?: () => void;

  connectedCallback(): void {
    super.connectedCallback();
    const state = getState();
    this.employee = state.employee;
    this.flags = state.flags;
    this.settings = state.settings;
    this.referral = this.settings.referralCode || uuid().slice(0, 6).toUpperCase();
    this.unsub = subscribe((s) => {
      this.employee = s.employee;
      this.flags = s.flags;
      this.settings = s.settings;
    });
  }

  async firstUpdated() {
    try {
      const res = await fetch('/api/candidates/profile');
      if (!res.ok) {
        throw new Error(`Perfil no disponible (${res.status})`);
      }
      const data = (await res.json()) as CandidateProfile;
      this.candidateProfile = data;
    } catch (error) {
      this.candidateError = (error as Error).message;
    }

    try {
      const res = await fetch('/api/employers/offers');
      if (!res.ok) {
        throw new Error(`Ofertas de empleador no disponibles (${res.status})`);
      }
      const data = (await res.json()) as EmployerOffer[];
      this.employerOffers = data;
    } catch (error) {
      this.employerError = (error as Error).message;
    }
  }

  disconnectedCallback(): void {
    this.unsub?.();
  }

  private badgeTone(color: string): 'green' | 'blue' | 'yellow' {
    if (color === 'blue' || color === 'yellow') return color;
    return 'green';
  }

  private go(path: string) {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  render() {
    const plan = this.flags?.plan ?? 'FREE';
    return html`
      <section class="space-y-3 fade-up max-w-[560px] mx-auto">
        <div class="rounded-2xl p-4" style="background: var(--surface); border: 1px solid var(--border);">
          <div class="flex items-center gap-3">
            <img class="w-14 h-14 rounded-full" style="border: 1px solid var(--border);" src=${this.employee?.avatar} alt="avatar" />
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-strong truncate">${this.employee?.name ?? '—'}</p>
              <p class="text-xs text-muted">
                Nivel ${this.employee?.level ?? '—'} · ${this.employee?.ratingAvg ?? '—'}
              </p>
            </div>
            <ac-chip color="blue">${plan}</ac-chip>
          </div>
          <div class="mt-3 flex gap-2 flex-wrap">
            ${this.employee?.badges.map(
              (badge) =>
                html`<ac-badge .label=${badge.label} .color=${this.badgeTone(badge.color)}></ac-badge>`
            )}
          </div>
        </div>

        <div class="rounded-2xl p-4" style="background: var(--surface); border: 1px solid var(--border);">
          <h3 class="font-semibold">Premium</h3>
          <p class="text-sm text-muted mt-1">
            Desbloquea exportar PDF, historial de clientes, KPIs avanzados y ranking.
          </p>
          <div class="grid grid-cols-2 gap-2 mt-3">
            <ac-button block @click=${() => upgrade('PRO_EMPLOYEE')}>Activar PRO</ac-button>
            <ac-button block variant="ghost" @click=${startTrial}>Probar 7 días</ac-button>
          </div>
        </div>

        <div class="rounded-2xl p-4" style="background: var(--surface); border: 1px solid var(--border);">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-semibold">Ajustes</p>
              <p class="text-sm text-muted">Tema y colores</p>
            </div>
            <button class="chip-btn" @click=${() => this.go('/settings')}>
              <span class="inline-flex items-center gap-2">
                <ac-icon name="shield" size="16"></ac-icon>
                Abrir
              </span>
            </button>
          </div>
        </div>

        <div class="rounded-2xl p-4" style="background: var(--surface); border: 1px solid var(--border);">
          <div class="flex items-center gap-3">
            <div class="icon-btn" aria-hidden="true">
              <ac-icon name="sparkle" size="18" color="var(--accent-strong)"></ac-icon>
            </div>
            <div class="flex-1">
              <p class="font-semibold">Invita amigos</p>
              <p class="text-sm text-muted">Comparte y consigue descuento en Premium.</p>
            </div>
          </div>
          <div class="mt-3 flex items-center gap-2">
            <code
              class="px-3 py-2 rounded-xl text-sm font-semibold"
              style="border: 1px solid var(--border); background: var(--surface-strong); color: var(--text);"
              >${this.referral}</code
            >
            <ac-button variant="secondary" @click=${() => navigator.clipboard.writeText(this.referral)}
              >Copiar</ac-button
            >
          </div>
        </div>

        <div class="rounded-2xl p-4" style="background: var(--surface); border: 1px solid var(--border);">
          <div class="flex items-center justify-between gap-2">
            <div>
              <p class="font-semibold">Perfil InfoJobs</p>
              <p class="text-sm text-muted">Datos básicos del candidato (API backend)</p>
            </div>
            <ac-chip color="blue">Candidato</ac-chip>
          </div>
          ${this.candidateError
            ? html`<p class="text-sm text-warning mt-2">${this.candidateError}</p>`
            : html`
                <div class="mt-3 space-y-2">
                  <p class="text-sm"><span class="text-muted">Nombre:</span> ${this.candidateProfile?.name ?? '...'}</p>
                  <p class="text-sm"><span class="text-muted">Email:</span> ${this.candidateProfile?.email ?? '...'}</p>
                  <p class="text-sm"><span class="text-muted">Teléfono:</span> ${this.candidateProfile?.phone ?? '...'}</p>
                  <p class="text-sm"><span class="text-muted">Provincia:</span> ${this.candidateProfile?.province ?? '...'}</p>
                  <p class="text-xs text-muted">Fuente: /api/candidates/profile</p>
                </div>
              `}
        </div>

        <div class="rounded-2xl p-4" style="background: var(--surface); border: 1px solid var(--border);">
          <div class="flex items-center justify-between gap-2">
            <div>
              <p class="font-semibold">Ofertas como empleador</p>
              <p class="text-sm text-muted">SOAP proxied por el backend</p>
            </div>
            <ac-chip color="green">Empresa</ac-chip>
          </div>
          ${this.employerError
            ? html`<p class="text-sm text-warning mt-2">${this.employerError}</p>`
            : html`
                <div class="mt-3 space-y-2">
                  ${this.employerOffers.length === 0
                    ? html`<p class="text-sm text-muted">Sin ofertas disponibles</p>`
                    : this.employerOffers.map(
                        (offer) => html`
                          <div class="p-3 rounded-xl" style="border: 1px solid var(--border);">
                            <p class="font-semibold">${offer.title}</p>
                            <p class="text-sm text-muted">ID: ${offer.id}</p>
                            <p class="text-sm text-muted">Candidaturas: ${offer.applications}</p>
                          </div>
                        `
                      )}
                </div>
              `}
        </div>
      </section>
    `;
  }
}

