import { css,html, LitElement, svg } from 'lit';
import { customElement } from 'lit/decorators.js';

export type IconName =
  | 'home'
  | 'briefcase'
  | 'graph'
  | 'user'
  | 'bell'
  | 'menu'
  | 'close'
  | 'star'
  | 'sparkle'
  | 'sync'
  | 'chevron-right'
  | 'filter'
  | 'search'
  | 'plus'
  | 'shield'
  | 'trophy'
  | 'check'
  | 'x'
  | 'bookmark'
  | 'bolt'
  | 'info'
  | 'map-pin'
  | 'minus'
  | 'more-vertical';

const paths: Record<IconName, ReturnType<typeof svg>> = {
  home: svg`<path stroke-linecap="round" stroke-linejoin="round" d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>`,
  briefcase: svg`<path stroke-linecap="round" stroke-linejoin="round" d="M4 8h16a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a1 1 0 0 1 1-1Zm5-4h6a1 1 0 0 1 1 1v3H8V5a1 1 0 0 1 1-1Z"/>`,
  graph: svg`<path stroke-linecap="round" stroke-linejoin="round" d="M5 12h3v8H5zm6-5h3v13h-3zm6 8h3v5h-3z"/>`,
  user: svg`<path stroke-linecap="round" stroke-linejoin="round" d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 7a7 7 0 0 1 14 0"/>`,
  bell: svg`<path stroke-linecap="round" stroke-linejoin="round" d="M6 15.5V11a6 6 0 0 1 12 0v4.5l1.5 1.5H4.5z"/><path d="M10 19a2 2 0 0 0 4 0"/>`,
  menu: svg`<path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M4 12h16M4 17h16"/>`,
  close: svg`<path stroke-linecap="round" stroke-linejoin="round" d="m6 6 12 12M6 18 18 6"/>`,
  star: svg`<path stroke-linecap="round" stroke-linejoin="round" d="m12 3 2.4 5.6 6.1.6-4.7 4.1 1.3 6.3L12 16l-5.1 3.6 1.3-6.3-4.7-4.1 6.1-.6Z"/>`,
  sparkle: svg`<path stroke-linecap="round" stroke-linejoin="round" d="M12 2.5 13.2 6l3.3 1.2L13.2 8.5 12 12l-1.2-3.5L7.5 7.2 10.8 6 12 2.5ZM6.5 13 7 15l2 .5-2 .5-.5 2-.5-2-2-.5 2-.5Zm10 1 1 3 3 1-3 1-1 3-1-3-3-1 3-1Z"/>`,
  sync: svg`<path stroke-linecap="round" stroke-linejoin="round" d="M5 14a7 7 0 0 0 12 2m2-4a7 7 0 0 0-12-2"/><path stroke-linecap="round" stroke-linejoin="round" d="M16 16h1v-4h-4v1m-4-5H8v4h4V10"/>`,
  'chevron-right': svg`<path stroke-linecap="round" stroke-linejoin="round" d="m9 5 6 7-6 7"/>`,
  filter: svg`<path stroke-linecap="round" stroke-linejoin="round" d="M5 7h14M8 12h8m-5 5h2"/>`,
  search: svg`<path stroke-linecap="round" stroke-linejoin="round" d="m20 20-4.5-4.5"/><circle cx="11" cy="11" r="6.5"/>`,
  plus: svg`<path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14"/>`,
  shield: svg`<path stroke-linecap="round" stroke-linejoin="round" d="M12 3 5 6v6.5c0 4 3 6.9 7 8.5 4-1.6 7-4.5 7-8.5V6z"/>`,
  trophy: svg`<path stroke-linecap="round" stroke-linejoin="round" d="M8 4h8v2h3v2a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5V6h3z"/><path stroke-linecap="round" stroke-linejoin="round" d="M10 13v3.5l-2 1.5h8l-2-1.5V13"/>`,
  check: svg`<path stroke-linecap="round" stroke-linejoin="round" d="m5 13 4 4 10-10"/>`,
  x: svg`<path stroke-linecap="round" stroke-linejoin="round" d="m6 6 12 12M6 18 18 6"/>`,
  bookmark: svg`<path stroke-linecap="round" stroke-linejoin="round" d="M7 4h10v16l-5-3.5L7 20z"/>`,
  bolt: svg`<path stroke-linecap="round" stroke-linejoin="round" d="M12 3 6 13h4v8l6-10h-4z"/>`,
  info: svg`<circle cx="12" cy="12" r="9"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 16v-5m0-3h.01"/>`,
  'map-pin': svg`<path stroke-linecap="round" stroke-linejoin="round" d="M12 21s7-6.2 7-11.2A7 7 0 0 0 5 9.8C5 14.8 12 21 12 21Z"/><circle cx="12" cy="10" r="3"/>`,
  minus: svg`<path stroke-linecap="round" stroke-linejoin="round" d="M6 12h12"/>`,
  'more-vertical': svg`<circle cx="12" cy="5.5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="18.5" r="1.5"/>`
};

@customElement('ac-icon')
export class AcIcon extends LitElement {
  // Declarative properties without class field initializers to avoid shadowing
  static properties = {
    name: { type: String },
    size: { type: Number },
    color: { type: String }
  };

  declare name: IconName;
  declare size: number;
  declare color: string;

  constructor() {
    super();
    this.name = 'home';
    this.size = 20;
    this.color = 'currentColor';
  }

  static styles = css`
    :host {
      display: inline-flex;
      line-height: 0;
      vertical-align: middle;
    }
    svg {
      display: block;
    }
  `;

  render() {
    const path = paths[this.name] ?? paths.home;
    return html`<svg
      aria-hidden="true"
      width="${this.size}"
      height="${this.size}"
      viewBox="0 0 24 24"
      fill="none"
      stroke=${this.color}
      stroke-width="1.7"
    >
      ${path}
    </svg>`;
  }
}
