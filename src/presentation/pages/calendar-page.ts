import '../components/ac-button';
import '../components/ac-icon';
import '../components/ac-skeleton';

import dayjs, { Dayjs } from 'dayjs';
import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { BaseComponent } from '../components/base';
import { getState, subscribe } from '../state/store';

type NotesByDay = Record<string, string>;

@customElement('calendar-page')
export class CalendarPage extends BaseComponent {
  @state() declare month: Dayjs;
  @state() declare selectedDate: Dayjs;
  @state() declare jobs: ReturnType<typeof getState>['jobs'];
  @state() declare ready: boolean;
  @state() declare notes: NotesByDay;
  @state() declare noteDraft: string;

  private unsub?: () => void;
  private readonly storageKey = 'clean-calendar-notes';

  constructor() {
    super();
    this.month = dayjs();
    this.selectedDate = dayjs();
    this.jobs = [];
    this.ready = false;
    this.notes = {};
    this.noteDraft = '';
  }

  connectedCallback(): void {
    super.connectedCallback();
    const state = getState();
    this.jobs = state.jobs;
    this.ready = state.ready;
    this.notes = this.loadNotes();
    this.noteDraft = this.notes[this.selectedKey()] ?? '';
    this.unsub = subscribe((s) => {
      this.jobs = s.jobs;
      this.ready = s.ready;
    });
  }

  disconnectedCallback(): void {
    this.unsub?.();
  }

  private selectedKey(date = this.selectedDate) {
    return date.format('YYYY-MM-DD');
  }

  private loadNotes(): NotesByDay {
    try {
      const raw = window.localStorage.getItem(this.storageKey);
      return raw ? (JSON.parse(raw) as NotesByDay) : {};
    } catch (_e) {
      return {};
    }
  }

  private persistNotes(notes: NotesByDay) {
    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(notes));
    } catch (_e) {
      // ignore storage errors
    }
  }

  private buildCalendarDays() {
    const start = this.month.startOf('month').startOf('week');
    const end = this.month.endOf('month').endOf('week');
    const days: Dayjs[] = [];
    let current = start;
    while (current.isBefore(end) || current.isSame(end, 'day')) {
      days.push(current);
      current = current.add(1, 'day');
    }
    return days;
  }

  private statusesForDay(day: Dayjs) {
    const jobsToday = this.jobs.filter((job) => dayjs(job.scheduledAt).isSame(day, 'day'));
    return {
      reserved: jobsToday.some((j) => j.status === 'pending' || j.status === 'in_progress'),
      done: jobsToday.some((j) => j.status === 'done'),
      error: jobsToday.some((j) => j.status === 'canceled'),
      jobs: jobsToday
    };
  }

  private changeMonth(delta: number) {
    this.month = this.month.add(delta, 'month');
  }

  private selectDay(day: Dayjs) {
    this.selectedDate = day;
    this.noteDraft = this.notes[this.selectedKey(day)] ?? '';
  }

  private saveNote() {
    const key = this.selectedKey();
    const notes = { ...this.notes, [key]: this.noteDraft.trim() };
    this.notes = notes;
    this.persistNotes(notes);
  }

  render() {
    const days = this.buildCalendarDays();
    const selectedStatuses = this.statusesForDay(this.selectedDate);

    return html`
      <section class="fade-up max-w-[1100px] mx-auto space-y-4 px-1">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted">Planificacion</p>
            <h1 class="text-2xl font-extrabold text-strong">Calendario de reservas</h1>
            <p class="text-sm text-muted">
              Revisa que dias hay reservas, cuales se completaron y donde hubo errores. Anade notas rapidas.
            </p>
          </div>
          <div class="flex gap-2">
            <ac-button variant="secondary" @click=${() => this.changeMonth(-1)}>
              <ac-icon name="chevron-right" size="14" style="transform: rotate(180deg);"></ac-icon>
              Mes anterior
            </ac-button>
            <ac-button variant="secondary" @click=${() => this.changeMonth(1)}>
              Siguiente mes
              <ac-icon name="chevron-right" size="14"></ac-icon>
            </ac-button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <div class="lg:col-span-2 rounded-2xl p-4 space-y-3" style="background: var(--surface); border: 1px solid var(--border);">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-strong">${this.month.format('MMMM YYYY')}</h2>
              <div class="flex gap-3 text-xs text-muted">
                <span class="inline-flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full" style="background: var(--accent);"></span> Reservado
                </span>
                <span class="inline-flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full" style="background: #10b981;"></span> Concluido
                </span>
                <span class="inline-flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full" style="background: #f97316;"></span> Error
                </span>
                <span class="inline-flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full" style="background: #6366f1;"></span> Nota
                </span>
              </div>
            </div>

            <div class="grid grid-cols-7 text-xs font-semibold text-muted px-1">
              ${['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => html`<div class="text-center py-2">${d}</div>`)}
            </div>

            <div class="grid grid-cols-7 gap-2">
              ${days.map((day) => {
                const statuses = this.statusesForDay(day);
                const isCurrentMonth = day.isSame(this.month, 'month');
                const isToday = day.isSame(dayjs(), 'day');
                const isSelected = day.isSame(this.selectedDate, 'day');
                const hasNote = Boolean(this.notes[day.format('YYYY-MM-DD')]);
                const bg = isSelected
                  ? 'color-mix(in srgb, var(--accent) 18%, var(--surface) 82%)'
                  : 'var(--surface)';
                const border = isToday ? '2px solid var(--accent)' : '1px solid var(--border)';
                return html`
                  <button
                    class="rounded-xl p-3 text-left space-y-2 hover:bg-black/5 dark:hover:bg-white/5 transition"
                    style=${`background:${bg}; border:${border}; opacity:${isCurrentMonth ? 1 : 0.55};`}
                    @click=${() => this.selectDay(day)}
                  >
                    <div class="flex items-center justify-between text-sm">
                      <span class="font-semibold text-strong">${day.date()}</span>
                      ${hasNote
                        ? html`<span class="w-2 h-2 rounded-full" style="background:#6366f1;" title="Nota guardada"></span>`
                        : null}
                    </div>
                    <div class="flex gap-1 flex-wrap">
                      ${statuses.reserved
                        ? html`<span class="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold"
                            style="background: color-mix(in srgb, var(--accent) 18%, transparent); color: var(--accent-strong);"
                          >
                            Reservado
                          </span>`
                        : null}
                      ${statuses.done
                        ? html`<span class="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold"
                            style="background: color-mix(in srgb, #10b981 18%, transparent); color: #0f9f6e;"
                          >
                            Concluido
                          </span>`
                        : null}
                      ${statuses.error
                        ? html`<span class="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold"
                            style="background: color-mix(in srgb, #f97316 18%, transparent); color: #c2410c;"
                          >
                            Error
                          </span>`
                        : null}
                    </div>
                  </button>
                `;
              })}
            </div>
          </div>

          <div class="rounded-2xl p-4 space-y-3" style="background: var(--surface); border: 1px solid var(--border);">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-muted">Detalle de dia</p>
                <h3 class="text-lg font-semibold text-strong">${this.selectedDate.format('DD MMMM')}</h3>
              </div>
              <button class="chip-btn" @click=${() => this.selectDay(dayjs())}>Hoy</button>
            </div>

            ${!this.ready
              ? html`<div class="space-y-2">
                  <ac-skeleton width="100%" height="14"></ac-skeleton>
                  <ac-skeleton width="96%" height="14"></ac-skeleton>
                  <ac-skeleton width="92%" height="14"></ac-skeleton>
                </div>`
              : selectedStatuses.jobs.length === 0
                ? html`<p class="text-sm text-muted">Sin reservas en esta fecha.</p>`
                : html`
                    <div class="space-y-2">
                      ${selectedStatuses.jobs.map((job) => {
                        const statusLabel =
                          job.status === 'done'
                            ? 'Concluido'
                            : job.status === 'canceled'
                              ? 'Error'
                              : 'Reservado';
                        const statusColor =
                          job.status === 'done'
                            ? '#10b981'
                            : job.status === 'canceled'
                              ? '#f97316'
                              : 'var(--accent)';
                        return html`
                          <div
                            class="rounded-xl px-3 py-2 border"
                            style="border-color: ${statusColor}; background: color-mix(in srgb, ${statusColor} 10%, transparent);"
                          >
                            <div class="flex items-center justify-between text-sm">
                              <span class="font-semibold text-strong capitalize">${job.type}</span>
                              <span
                                class="px-2 py-1 rounded-full text-[11px] font-semibold"
                                style="background: color-mix(in srgb, ${statusColor} 20%, transparent); color: ${statusColor};"
                              >
                                ${statusLabel}
                              </span>
                            </div>
                            <p class="text-xs text-muted">
                              ${dayjs(job.scheduledAt).format('HH:mm')} · ${job.durationEstimate} min · ${job.price.amount}€
                            </p>
                          </div>
                        `;
                      })}
                    </div>
                  `}

            <div class="space-y-2">
              <p class="text-sm font-semibold text-strong">Nota rapida</p>
              <textarea
                class="w-full rounded-xl border px-3 py-2 text-sm"
                style="border-color: var(--border); background: var(--surface);"
                rows="4"
                .value=${this.noteDraft}
                placeholder="Apunta detalles o incidencias de este dia"
                @input=${(e: Event) => (this.noteDraft = (e.target as HTMLTextAreaElement).value)}
              ></textarea>
              <div class="flex items-center justify-between">
                <span class="text-xs text-muted">
                  ${this.notes[this.selectedKey()] ? 'Nota guardada' : 'Sin nota guardada'}
                </span>
                <ac-button variant="secondary" @click=${() => this.saveNote()}>
                  <ac-icon name="sparkle" size="14"></ac-icon>
                  Guardar nota
                </ac-button>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }
}
