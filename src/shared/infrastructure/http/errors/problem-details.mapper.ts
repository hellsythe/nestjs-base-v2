import { DomainError } from '../../../domain/errors/domain-error';
import { ProblemDetails } from './problem-details';

export function mapDomainError(error: DomainError): ProblemDetails {
  return {
    type: error.type,
    title: error.name,
    status: 400,
    detail: error.message,
  };
}
