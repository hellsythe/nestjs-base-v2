---
name: create-mapper
description: Crea mappers para convertir entre entity y schema de persistencia.
---

# Cuándo usar esta skill
Usar esta skill cuando:
- Existan conversiones entre capas.
- Se cree o modifique la persistencia del módulo.
- Se necesite transformar entity a schema de forma explícita.

# Cuándo no usar esta skill
No usar esta skill cuando:
- El módulo todavía no tiene entidad definida.
- No existen transformaciones entre capas.
- El cambio es puramente de rutas o validación superficial.

# Objetivo
Centralizar conversiones del módulo.

# Reglas
- `schema -> entity`
- `entity -> schema`
- Evitar lógica de negocio compleja en el mapper.
- No mapear `entity -> dto` en este mapper.
- La transformación `entity -> dto` debe implementarse en un presenter HTTP (ej: `infrastructure/http/presenters/<modulo>.presenter.ts`).

# Ejemplo mínimo
```ts
toDomain(doc: UserDocument): User
toPersistence(entity: User): UserPersistence
```
