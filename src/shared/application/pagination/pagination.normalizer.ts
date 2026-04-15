import { PaginationOptions } from './pagination.options';

export interface NormalizedPagination {
  page: number;
  perPage: number;
  offset: number;
  limit: number;
}

export class PaginationNormalizer {
  private static readonly DEFAULT_PAGE = 1;
  private static readonly DEFAULT_PER_PAGE = 10;
  private static readonly MAX_PER_PAGE = 100;

  static normalize(options?: PaginationOptions): NormalizedPagination {
    const page =
      options?.page && options.page > 0
        ? Math.floor(options.page)
        : this.DEFAULT_PAGE;

    const perPage =
      options?.perPage && options.perPage > 0
        ? Math.min(Math.floor(options.perPage), this.MAX_PER_PAGE)
        : this.DEFAULT_PER_PAGE;

    return {
      page,
      perPage,
      offset: (page - 1) * perPage,
      limit: perPage,
    };
  }
}
