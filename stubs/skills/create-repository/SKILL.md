---
name: create-repository
description: Define el contrato del repositorio y la implementación concreta de persistencia.
---

# Cuándo usar esta skill
Usar esta skill cuando:
- Se necesite persistir una nueva entidad.
- Se cree un módulo nuevo con acceso a base de datos.
- Se requiera una abstracción de repositorio alineada con arquitectura limpia.

# Cuándo no usar esta skill
No usar esta skill cuando:
- El módulo no tiene persistencia.
- Solo se agrega lógica de aplicación sin tocar acceso a datos.
- El cambio es únicamente de controller o DTOs.

# Objetivo
Crear:
- interfaz de repositorio en dominio o aplicación
- implementación en infraestructura

# Reglas
- El repositorio debe devolver entidades.
- No devolver DTOs ni schemas.
- La implementación concreta usa mappers para traducir datos.
- La implementación concreta debe ubicarse en `infrastructure/persistence/mongo/<entidad>.mongo.repository.ts`.
- No crear carpeta `infrastructure/repositories`.
- Definir el contrato del repositorio directamente en `domain/<entidad>.repository.ts` (sin carpeta `domain/repositories`).
- El nombre del repositorio, metodos y contratos debe estar en ingles.
- Definir token de inyección con `Symbol` en el archivo de contrato del repositorio, por ejemplo:
  - `export const USER_REPOSITORY = Symbol('USER_REPOSITORY');`
- El token debe inyectarse en casos de uso con `@Inject(USER_REPOSITORY)` y enlazarse en el módulo con `provide/useExisting`.
- En módulos CRUD, el contrato debe incluir como mínimo:
  - `save(entity)`
  - `findAll()`
  - `findById(id)`
  - `update(entity)` o `updateById(id, partial)`
  - `delete(id)` (soft delete cuando aplique)

# Ejemplo mínimo
```ts
// domain/user.repository.ts
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepository {
  save(user: User): Promise<User>;
  findAll(): Promise<User[]>;
}
```
