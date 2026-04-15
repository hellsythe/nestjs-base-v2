import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Rfc7807Filter } from './filters/rfc7807.filter';
import { ValidationError, BadRequestException } from '@nestjs/common';

export function configureHttp(app: any) {
  const collectValidationMessages = (
    errors: ValidationError[],
    parentPath = '',
  ): string[] => {
    const messages: string[] = [];

    for (const error of errors) {
      const path = parentPath
        ? `${parentPath}.${error.property}`
        : error.property;
      if (error.constraints) {
        for (const message of Object.values(error.constraints)) {
          messages.push(`${path}: ${message}`);
        }
      }
      if (error.children && error.children.length > 0) {
        messages.push(...collectValidationMessages(error.children, path));
      }
    }

    return messages;
  };

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      skipNullProperties: false,
      transform: true,
      validateCustomDecorators: true,
      whitelist: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = collectValidationMessages(errors);

        return new BadRequestException({
          type: 'https://errors.yourdomain.com/validation/invalid-parameter',
          title: 'Validation failed',
          status: 400,
          detail: 'One or more request parameters are invalid.',
          errors: messages,
        });
      },
    }),
  );

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      strategy: 'exposeAll',
    }),
  );

  app.useGlobalFilters(new Rfc7807Filter());
}
