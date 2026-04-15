export type FilterOperator = 'equals' | 'like' | 'in' | 'gte' | 'lte' | 'range';

export interface FieldFilterConfig {
  operator: FilterOperator;
  fieldName?: string;
  options?: {
    matchType?: 'contains' | 'startsWith' | 'endsWith';
    caseSensitive?: boolean;
  };
}

export type CriteriaFilterMap<TCriteria> = {
  [K in keyof TCriteria]?: FieldFilterConfig;
};
