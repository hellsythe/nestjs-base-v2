---
name: add-audit-fields
description: Agrega campos de auditoría y soft delete cuando el estándar del proyecto lo requiere.
---

# Cuándo usar esta skill
Usar esta skill cuando:
- El proyecto requiera auditoría estándar.
- Se esté creando una nueva entidad persistible.
- `scaffold-module` la invoque para alinear entity, schema y mapper.

# Cuándo no usar esta skill
No usar esta skill cuando:
- El recurso no debe tener auditoría por una excepción explícita del proyecto.
- Se trate de objetos efímeros o DTOs temporales sin persistencia.
- Solo se está haciendo un cambio de presentación.

# Objetivo
Agregar los campos estándar de auditoría.

# Campos de auditoría
- created_at
- updated_at
- deleted_at
- created_by
- updated_by

# Reglas
- Aplicar estos campos en entity, schema y mappers cuando corresponda.
- Mantener tipos consistentes.

# Ejemplo mínimo
```ts
// entity
created_at?: Date; updated_at?: Date; deleted_at?: Date | null;
created_by?: string | null; updated_by?: string | null;

// schema (mongo)
timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
```
