import { ApplicationError } from '../../../application/errors/application-error';
import { ProblemDetails } from './problem-details';

export function mapApplicationError(error: ApplicationError): ProblemDetails {
  return {
    type: error.type,
    title: error.title,
    status: error.status,
    detail: error.message,
  };
}
