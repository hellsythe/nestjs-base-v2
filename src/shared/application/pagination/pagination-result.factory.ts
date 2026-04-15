import { PaginationMeta } from './pagination.meta';
import { NormalizedPagination } from './pagination.normalizer';
import { PaginationResult } from './pagination.result';

export class PaginationResultFactory {
  static create<T>(
    items: T[],
    total: number,
    pagination: NormalizedPagination,
  ): PaginationResult<T> {
    const meta: PaginationMeta = {
      current_page: pagination.page,
      per_page: pagination.perPage,
      total,
      last_page: Math.ceil(total / pagination.perPage),
      from: total === 0 ? 0 : pagination.offset + 1,
      to: Math.min(pagination.offset + pagination.limit, total),
    };

    return { data: items, meta };
  }
}
