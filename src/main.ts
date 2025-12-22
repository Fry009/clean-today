import './presentation/app-root';

import { registerSW } from 'virtual:pwa-register';

import { setupMockServer } from './infrastructure/http/mock/server';

if (import.meta.env.DEV) {
  setupMockServer();
}

document.querySelector('#app')!.innerHTML = '<app-root></app-root>';

registerSW({ immediate: true });
