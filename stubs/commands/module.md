Crea un módulo completo usando la skill `scaffold-module`.

Argumentos recibidos:
$ARGUMENTS

Tareas:
1. Interpretar el primer argumento como nombre del módulo.
2. Interpretar el resto como lista de campos, por ejemplo:
   - `name:string`
   - `email:string`
   - `work:string`
3. Usar la skill `scaffold-module`.
4. Respetar `AGENTS.md`.
5. Usar NestJS + Mongoose + arquitectura hexagonal.
6. Seguir las secciones de "Cuándo usar esta skill" y "Cuándo no usar esta skill" de cada skill involucrada.
7. Normalizar el nombre del módulo y los atributos a ingles antes de generar código.
8. Si el usuario pasa nombres en español, traducirlos a un equivalente natural en ingles y usar ese resultado en archivos, clases, rutas y propiedades.
