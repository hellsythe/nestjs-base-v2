import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

export function setupSwagger(app: any) {
  const configService = app.get(ConfigService) as ConfigService;

  const builder = new DocumentBuilder()
    .setTitle('Templates admin')
    .setDescription('Administrador de plantillas meta')
    .setVersion('1.0')
    .addBearerAuth();

  const baseUrl = configService.get<string>('BASE_URL')?.trim();
  if (baseUrl) {
    builder.addServer(baseUrl);
  }

  const config = builder.build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);
}
