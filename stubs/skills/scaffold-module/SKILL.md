---
name: scaffold-module
description: Orquesta la creación completa de un module NestJS usando las skills internas del proyecto.
---

# Cuándo usar esta skill
Usar esta skill cuando:
- El usuario pida crear un módulo completo desde cero.
- Se requiera scaffolding completo de un recurso nuevo.
- Se necesite generar varias partes del module en una sola tarea.
- Se invoque el comando `/module`.

# Cuándo no usar esta skill
No usar esta skill cuando:
- Solo se necesita agregar un endpoint puntual.
- Solo se necesita modificar la entidad.
- Solo se necesita agregar un filtro o un caso de uso específico.
- El trabajo afecta una sola capa y no requiere scaffolding completo.

# Objetivo
Crear un módulo completo siguiendo la arquitectura del proyecto.

# Proceso obligatorio
1. Usar `create-module`.
2. Usar `create-entity`.
3. Usar `add-audit-fields`.
4. Usar `create-repository`.
5. Usar `create-mongoose-schema`.
6. Usar `create-mapper`.
7. Usar `create-use-cases`.
8. Usar `create-controller`.
9. Usar `create-unit-tests`.

# Alcance mínimo de CRUD
- El scaffolding debe incluir como mínimo:
  - `create`
  - `findAll`
  - `findById`
  - `update`
  - `delete` (soft delete cuando aplique)

# Reglas
- No omitir pasos.
- Mantener consistencia de nombres.
- Usar inglés en nombres de módulos, clases, archivos, rutas y propiedades (ej: `students`, `enrollment`, `updatedBy`).
- No generar nombres en español.
- Respetar `AGENTS.md`.
- No crear archivos fuera del scaffolding del proyecto.
- Si hay integración externa, crear puerto en `application/ports` y adapter en infraestructura según protocolo.
- Los controllers y DTOs generados deben incluir validación con `class-validator` y documentación con `@nestjs/swagger`.
- Las respuestas HTTP deben mapearse con presenter en `infrastructure/http/presenters`.
- Los casos de uso generados deben exponer método público `execute`.
- Escrituras usan `Command` tipado y lecturas usan `Query` tipada.
- Los DTOs de response con Swagger viven en `infrastructure/http/controllers/dto` y no en `application`.
- El repositorio debe exponer token de inyección con `Symbol` (ej. `STUDENT_REPOSITORY`) y usarse en `@Inject(...)` dentro de los casos de uso.
- En `domain`, los archivos van directos (ej: `domain/student.entity.ts`, `domain/student.repository.ts`) sin carpetas `entities` ni `repositories`.
- Definir criteria por módulo en `domain/<entity>.criteria.ts` y mapearlos en `infrastructure/persistence/mongo/<entity>.filter-map.ts`.
- La persistencia Mongo debe vivir en `infrastructure/persistence/mongo` (schema y repository).
- El nombre del repository Mongo debe seguir `<entity>.mongo.repository.ts`.
- No crear carpeta `infrastructure/repositories`.
- La capa HTTP debe seguir esta estructura:
  - `infrastructure/http/controllers/<module>.controller.ts`
  - `infrastructure/http/controllers/dto/*.dto.ts`
  - `infrastructure/http/presenters/<entity>.presenter.ts`
- Para filtros de listado, usar Query DTO dedicado en `infrastructure/http/controllers/dto/find-<module>-query.dto.ts`.

# Validación obligatoria al finalizar
- Ejecutar una revisión final de naming en archivos generados.
- Confirmar que nombres de módulos, clases, funciones, rutas, DTOs y propiedades estén en inglés.
- Si se detecta español, renombrar y corregir referencias antes de finalizar.
- Validar que el repositorio concreto herede de `MongoRepositoryBase` y use `MongoCriteriaBuilder` para `findByCriteria`.
- Validar que al menos use-cases y controller tengan tests unitarios.
- Validar que se cumpla el checklist mínimo de `create-unit-tests` o documentar excepciones explícitas.

# Ejemplo mínimo
- Módulo `users` con escritura y lectura básica:
  1. `create-module`
  2. `create-entity`
  3. `add-audit-fields`
  4. `create-repository`
  5. `create-mongoose-schema` (si persiste en Mongo)
  6. `create-mapper`
  7. `create-use-cases` (`CreateUserCommand`, `GetUsersQuery`)
  8. `create-controller` (`POST /users`, `GET /users`)

# Arbol esperado final
```txt
<module>/
  <module>.module.ts
  domain/
    <entity>.entity.ts
    <entity>.criteria.ts
    <entity>.repository.ts
  application/
    use-cases/
      create-<entity>/
      get-<module>/
      get-<entity>-by-id/
      update-<entity>/
      delete-<entity>/
    ports/
  infrastructure/
    mappers/
    persistence/
      mongo/
        <entity>.schema.ts
        <entity>.filter-map.ts
        <entity>.mongo.repository.ts
    http/
      controllers/
        <module>.controller.ts
        dto/
          find-<module>-query.dto.ts
      presenters/
        <entity>.presenter.ts
```
