import { PaginationMeta } from './pagination.meta';

export class PaginationResult<T> {
  data: T[];
  meta: PaginationMeta;
}
