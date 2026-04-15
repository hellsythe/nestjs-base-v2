---
name: create-module
description: Crea la estructura base de carpetas y archivos iniciales de un módulo.
---

# Cuándo usar esta skill
Usar esta skill cuando:
- Se esté creando un módulo nuevo.
- `scaffold-module` la invoque como parte del flujo principal.
- Se necesite preparar la estructura base antes de crear archivos internos.

# Cuándo no usar esta skill
No usar esta skill cuando:
- El módulo ya existe y solo se agregarán archivos puntuales.
- Solo se va a modificar lógica dentro de una capa existente.
- El cambio es una corrección menor dentro de archivos ya creados.

# Objetivo
Crear el esqueleto del módulo respetando la arquitectura del proyecto.

# Salida esperada
- Carpetas de domain, application e infrastructure.
- En `domain`, no crear subcarpetas `entities` ni `repositories`; usar archivos directos.
- Usar nombres en ingles para modulo, archivos y carpetas.
- En persistencia Mongo, usar `infrastructure/persistence/mongo`.
- El repositorio Mongo debe seguir el patron `<entidad>.mongo.repository.ts`.
- No crear `infrastructure/repositories`.
- Incluir `application/ports` para puertos de integraciones externas.
- Incluir `infrastructure/http/adapters` cuando el módulo consuma APIs HTTP externas.
- Archivo principal del módulo NestJS.
- Base mínima para continuar con las demás skills.
