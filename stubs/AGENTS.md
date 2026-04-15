# AGENTS.md

## Contexto del proyecto
Este proyecto usa NestJS, TypeScript y MongoDB con Mongoose.
La arquitectura base es hexagonal / limpia.

## Reglas globales
- Respetar el scaffolding y nombres definidos por el proyecto.
- El dominio no depende de framework.
- El repositorio de dominio siempre devuelve entidades, nunca DTOs ni schemas.
- Los mappers convierten entre entity, schema y DTO.
- Toda integración externa se modela con puerto + adapter.
- El puerto de integración externa va en `application/ports` (ej: `meta.port.ts`).
- El adapter concreto va en infraestructura según protocolo:
  - HTTP: `infrastructure/http/adapters` (ej: `meta.adapter.ts`).
- Usar soft delete cuando el módulo lo requiera.
- Incluir campos de auditoría cuando aplique:
  - `created_at`
  - `updated_at`
  - `deleted_at`
  - `created_by`
  - `updated_by`

## Convención sugerida por módulo
- `domain/entities`
- `domain/repositories`
- `application/use-cases`
- `application/ports`
- `application/dto`
- `infrastructure/persistence/mongoose`
- `infrastructure/repositories`
- `infrastructure/http/controllers`
- `infrastructure/http/adapters`

## Reglas de generación
- No inventar estructuras alternativas.
- No mezclar responsabilidad de capas.
- Mantener consistencia entre singular/plural en nombres.
- Preferir casos de uso específicos antes que servicios genéricos inflados.
