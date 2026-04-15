import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';


export function setupSwagger(app: any) {
  const config = new DocumentBuilder()
    .setTitle('Templates admin')
    .setDescription('Administrador de plantillas meta')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer(process.env.BASE_URL || '')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);
}
