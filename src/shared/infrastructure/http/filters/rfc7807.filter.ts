import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainError } from '../../../domain/errors/domain-error';
import { ApplicationError } from '../../../application/errors/application-error';
import { mapApplicationError } from '../errors/application-error.mapper';
import { mapDomainError } from '../errors/problem-details.mapper';
import { ProblemDetails } from '../errors/problem-details';

@Catch()
export class Rfc7807Filter implements ExceptionFilter {
  private statusToType(status: number): string {
    if (status >= 500) {
      return 'about:blank/internal-server-error';
    }

    if (status === HttpStatus.NOT_FOUND) {
      return 'about:blank/not-found';
    }

    if (status === HttpStatus.BAD_REQUEST) {
      return 'about:blank/invalid-request';
    }

    if (status === HttpStatus.UNAUTHORIZED) {
      return 'about:blank/unauthorized';
    }

    if (status === HttpStatus.FORBIDDEN) {
      return 'about:blank/forbidden';
    }

    if (status === HttpStatus.CONFLICT) {
      return 'about:blank/conflict';
    }

    return 'about:blank';
  }

  private normalizeHttpException(exception: HttpException): ProblemDetails {
    const status = exception.getStatus();
    const response = exception.getResponse();

    if (typeof response === 'string') {
      return {
        type: this.statusToType(status),
        title: HttpStatus[status] ?? 'HTTP Error',
        status,
        detail: response,
      };
    }

    if (response && typeof response === 'object') {
      const payload = response as Record<string, unknown>;
      const detailFromMessage = Array.isArray(payload.message)
        ? payload.message.join(', ')
        : typeof payload.message === 'string'
          ? payload.message
          : undefined;

      return {
        type:
          typeof payload.type === 'string'
            ? payload.type
            : this.statusToType(status),
        title:
          typeof payload.title === 'string'
            ? payload.title
            : typeof payload.error === 'string'
              ? payload.error
              : (HttpStatus[status] ?? 'HTTP Error'),
        status,
        detail:
          typeof payload.detail === 'string'
            ? payload.detail
            : (detailFromMessage ?? 'Request failed.'),
        errors: Array.isArray(payload.errors)
          ? payload.errors.filter((item): item is string => typeof item === 'string')
          : undefined,
      };
    }

    return {
      type: this.statusToType(status),
      title: HttpStatus[status] ?? 'HTTP Error',
      status,
      detail: exception.message || 'Request failed.',
    };
  }

  private normalizeUnknownError(exception: unknown): ProblemDetails {
    if (exception instanceof Error) {
      return {
        type: 'about:blank/internal-server-error',
        title: 'Internal Server Error',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        detail: exception.message || 'Unexpected error',
      };
    }

    return {
      type: 'about:blank/internal-server-error',
      title: 'Internal Server Error',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      detail: 'Unexpected error',
    };
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const problem =
      exception instanceof DomainError
        ? mapDomainError(exception)
        : exception instanceof ApplicationError
          ? mapApplicationError(exception)
        : exception instanceof HttpException
          ? this.normalizeHttpException(exception)
          : this.normalizeUnknownError(exception);

    problem.instance = request.originalUrl;
    problem.transactionId = request.headers['x-request-id']?.toString();

    response
      .status(problem.status ?? HttpStatus.BAD_REQUEST)
      .type('application/problem+json')
      .json(problem);
  }
}
