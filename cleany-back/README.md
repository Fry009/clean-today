# InfoJobs Backend (Hexagonal, Spring Boot)

Backend listo para arrancar en IntelliJ con arquitectura hexagonal, puertos/adaptadores y pruebas E2E con Testcontainers + WireMock.

## Stack
- Java 17, Spring Boot 3.2, Gradle Kotlin DSL
- Hexagonal: dominio (modelos/puertos) + aplicación (servicios) + infraestructura (JPA, InfoJobs, HTTP)
- Persistencia: Postgres (prod), H2 en memoria (por defecto), Flyway migraciones
- Tests: JUnit 5, Testcontainers (Postgres), WireMock para simular InfoJobs

## Configuración
- `src/main/resources/application.yml`: H2 en memoria (dev rápido).
- `src/main/resources/application-postgres.yml`: Postgres real. Variables: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.
- Env OAuth InfoJobs: `INFOJOBS_CLIENT_ID`, `INFOJOBS_CLIENT_SECRET`, `INFOJOBS_SCOPE`, `INFOJOBS_REDIRECT_URI` (placeholders ahora).
- SOAP empleador: `infojobs.employer-base-url` (opcional, por defecto usa `infojobs.base-url`).

## Endpoints principales
- `POST /api/offers/sync` sincroniza ofertas desde InfoJobs (gateway configurado).
- `GET /api/offers` lista ofertas persistidas.
- `POST /api/applications` aplica a una oferta usando `externalOfferId` + datos de candidato.
- **Candidatos**: `GET /api/candidates/profile`, `GET /api/candidates/skill-categories`, `GET /api/candidates/skills?categoryId=...`, `GET /api/candidates/curriculums` (proxy a InfoJobs).
- **Empleador (SOAP)**: `GET /api/employers/offers`, `GET /api/employers/offers/{offerId}/applications` (proxy SOAP -> JSON).
- **Market (InfoJobs búsqueda)**: `GET /api/market/search?query=...&location=...` devuelve ofertas InfoJobs sin persistir.

## Ejecutar
```bash
./gradlew bootRun                      # usa H2
./gradlew bootRun --args='--spring.profiles.active=postgres'  # con Postgres
```

## Tests E2E
```bash
./gradlew test
```
Levanta Postgres en Testcontainers y WireMock para mockear InfoJobs; valida sync/apply y endpoints de candidato end-to-end.
