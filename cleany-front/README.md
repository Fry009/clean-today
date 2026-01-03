# Clean Today (Lit + Vite + Tailwind)

App mobile-first para operativa de limpieza en España. Hexagonal (Ports & Adapters), PWA lista para Capacitor, offline-first con IndexedDB/Dexie y cola de sync.

## Instalación
- Requisitos: Node 18+ y pnpm (o npm/yarn).
- Instala deps: `pnpm install`
- Dev: `pnpm dev`
- Build: `pnpm build`
- Preview: `pnpm preview`
- Lint: `pnpm lint`
- Tests: `pnpm test`
- Type-check: `pnpm typecheck`

## Arquitectura (hexagonal)
- `src/core`: dominio puro (entidades, reglas, puertos).
- `src/application`: casos de uso/comandos.
- `src/infrastructure`: adaptadores (Dexie local, fake API, PDF, feature flags, outbox).
- `src/presentation`: UI Lit, router vaadin, componentes, páginas, estado ligero.
- `src/shared`: config, logger, i18n, datos seed.

Adapters actuales: `Local*Repository`, `OutboxDexieRepository`, `FakeApiAdapter` (mock), `JsPdfExporter`.

## Estructura rápida
- Páginas: Home/Hoy, Jobs, Job Detail, Evidences, KPIs (Chart.js), Perfil, Leads.
- Componentes comunes: `ac-button`, `ac-card`, `ac-chip`, `ac-badge`, `ac-modal`, `ac-tabs`, `ac-progress`, `ac-toast`, `ac-kpi-tile`, `ac-photo-uploader`, `ac-checklist`, `ac-timer`.
- Estado: `presentation/state/store.ts` (observable simple) + use cases.
- Offline: Dexie en `infrastructure/storage/dexieClient.ts`, cola `OutboxDexieRepository`, sync `SyncPendingOperations`.
- PWA: `vite.config.ts` + `public/manifest.webmanifest`, icons png.
- Capacitor: `capacitor.config.ts` (`pnpm cap:sync` tras build).
- Temas: light/dark + acentos (ocean/forest/sunset) configurables en Perfil.

## Añadir un nuevo módulo
1) Define entidad/puertos en `src/core`.
2) Crea caso de uso en `src/application/usecases`.
3) Implementa adaptador en `src/infrastructure/repositories` o `adapters`.
4) Expón en `infrastructure/container.ts` y úsalo desde el store/UI.
5) Añade UI en `src/presentation/pages` o componente en `components`.
6) Tests en `__tests__` con Vitest.

## Modo demo / seeds
- Datos fake en `src/shared/demoData.ts` (empleado, 5 clientes, 10 jobs, evidencias, KPIs, leads).
- `seedDatabase()` carga Dexie al arrancar. Demo mode controlado por `VITE_DEMO_MODE` (por defecto true).

## Scripts clave
- `pnpm dev` -> dev server Vite.
- `pnpm build` -> build + PWA.
- `pnpm test` -> vitest (unit + integración simple).
- `pnpm lint` / `pnpm format`.
- `pnpm cap:sync` -> preparar assets web para Capacitor.

## Notas de UI/UX
- Mobile-first real, tabs inferiores, botones grandes (modo una mano).
- Tema light/dark (toggle en Perfil) + tailwind utilities.
- Paywall/premium modal y CTAs, indicadores de PRO en export PDF.
- KPIs con Chart.js, smart tips en Home, detección de tiempo muerto en Jobs, QR/Mapa stubs.

## Cómo activar modo demo
- Por defecto activo (`VITE_DEMO_MODE=true`).
- Cambia en `.env` o variables de entorno y reinicia `pnpm dev`.
