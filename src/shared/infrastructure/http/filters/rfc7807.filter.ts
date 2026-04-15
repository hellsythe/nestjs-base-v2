import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainError } from '../../../domain/errors/domain-error';
import { mapDomainError } from '../errors/problem-details.mapper';

@Catch(DomainError)
export class Rfc7807Filter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const problem = mapDomainError(exception);
    problem.instance = request.originalUrl;

    response
      .status(problem.status ?? HttpStatus.BAD_REQUEST)
      .type('application/problem+json')
      .json(problem);
  }
}
