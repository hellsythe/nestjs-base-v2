---
name: create-controller
description: Crea el controller, DTOs y endpoints base del módulo.
---

# Cuándo usar esta skill
Usar esta skill cuando:
- El módulo necesita exponer endpoints HTTP.
- Se está creando la capa de presentación del módulo.
- `scaffold-module` la invoque como parte del flujo completo.

# Cuándo no usar esta skill
No usar esta skill cuando:
- El módulo no expone API HTTP.
- Solo se trabaja en dominio o persistencia.
- El cambio es exclusivo de base de datos o mappers.

# Objetivo
Exponer endpoints del módulo.

# Reglas
- Mantener el controller delgado.
- Validar entrada con DTOs usando `class-validator`.
- Documentar endpoints y DTOs con `@nestjs/swagger`.
- Definir rutas, handlers, DTOs y propiedades en ingles.
- En DTOs de request, usar decoradores de validación (`IsString`, `IsInt`, `IsOptional`, etc.) y `ApiProperty`/`ApiPropertyOptional`.
- Los DTOs de response HTTP deben vivir en `infrastructure/http/controllers/dto`.
- Delegar comportamiento a casos de uso.
- Mantener nombres de rutas y handlers consistentes.
- Mapear `entity -> response dto` mediante presenter (ej: `infrastructure/http/presenters/<modulo>.presenter.ts`).
- No usar el mapper de persistencia para transformar respuestas HTTP.
- No usar DTOs con decorators de Swagger dentro de `application`.
- En módulos CRUD, exponer como mínimo endpoints:
  - `POST /<modulo>`
  - `GET /<modulo>`
  - `GET /<modulo>/:id`
  - `PATCH /<modulo>/:id`
  - `DELETE /<modulo>/:id`

# Ejemplo mínimo
```ts
class CreateUserDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() lastname: string;
  @ApiProperty() @IsInt() age: number;
}

@Post()
async create(@Body() dto: CreateUserDto) { return this.createUserUseCase.execute(dto); }
```
