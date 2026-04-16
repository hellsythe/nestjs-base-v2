import type { FilterQuery } from 'mongoose';
import type {
  LikeFilterOptions,
  RangeFilterValue,
  FieldFilterConfig,
  CriteriaFilterMap,
} from '../../../application/criteria/filter-operator';

/**
 * Builder que traduce criteria genéricos a filtros de MongoDB
 */
export class MongoCriteriaBuilder {
  /**
   * Construye un filtro de Mongo a partir de un criteria genérico
   * @param criteria - Objeto con los valores a filtrar
   * @param filterMap - Mapa que define qué operador usar para cada campo
   */
  static build<
    TCriteria extends Record<string, any>,
    TPersistence extends object = object,
  >(
    criteria: Partial<TCriteria>,
    filterMap: CriteriaFilterMap<TCriteria, TPersistence>,
  ): FilterQuery<any> {
    const filters: FilterQuery<any>[] = [];

    for (const [key, value] of Object.entries(criteria)) {
      // Si el valor es undefined o null, skip
      if (value === undefined || value === null) {
        continue;
      }

      // Obtener configuración del filtro para este campo
      const config = filterMap[key as keyof TCriteria];
      if (!config) {
        // Si no hay configuración, usar igualdad por defecto
        filters.push({ [key]: value });
        continue;
      }

      // Usar alias si está configurado, sino usar el nombre del campo del criteria
      const fieldName = config.fieldName || key;

      // Aplicar el operador configurado
      const filter = this.applyOperator(fieldName, value, config);
      if (filter && Object.keys(filter).length > 0) {
        filters.push(filter);
      }
    }

    // Si no hay filtros, retornar filtro vacío
    if (filters.length === 0) {
      return {};
    }

    // Si hay un solo filtro, retornarlo directamente
    if (filters.length === 1) {
      return filters[0];
    }

    // Si hay múltiples filtros, usar $and
    return { $and: filters };
  }

  private static applyOperator(
    field: string,
    value: any,
    config: FieldFilterConfig<any>,
  ): FilterQuery<any> {
    switch (config.operator) {
      case 'like':
        return this.buildLikeFilter(field, value, config.options);

      case 'in':
        return Array.isArray(value) && value.length > 0
          ? { [field]: { $in: value } }
          : {};

      case 'neq':
        return { [field]: { $ne: value } };

      case 'gt':
        return { [field]: { $gt: value } };

      case 'gte':
        return { [field]: { $gte: value } };

      case 'lt':
        return { [field]: { $lt: value } };

      case 'lte':
        return { [field]: { $lte: value } };

      case 'range':
        return this.buildRangeFilter(field, value as RangeFilterValue);

      case 'equals':
      default:
        return { [field]: value };
    }
  }

  private static buildLikeFilter(
    field: string,
    value: unknown,
    options?: LikeFilterOptions,
  ): FilterQuery<any> {
    if (typeof value !== 'string' || value.trim() === '') {
      return {};
    }

    const matchType = options?.matchType || 'contains';
    const caseSensitive = options?.caseSensitive || false;

    let pattern: string;
    switch (matchType) {
      case 'startsWith':
        pattern = `^${this.escapeRegex(value)}`;
        break;
      case 'endsWith':
        pattern = `${this.escapeRegex(value)}$`;
        break;
      case 'contains':
      default:
        pattern = this.escapeRegex(value);
        break;
    }

    const regex = new RegExp(pattern, caseSensitive ? '' : 'i');

    return { [field]: regex };
  }

  private static buildRangeFilter(
    field: string,
    value: RangeFilterValue,
  ): FilterQuery<any> {
    if (!value || typeof value !== 'object') {
      return {};
    }

    const hasFrom = value.from !== undefined && value.from !== null;
    const hasTo = value.to !== undefined && value.to !== null;

    if (!hasFrom && !hasTo) {
      return {};
    }

    const range: Record<string, unknown> = {};

    if (hasFrom) {
      range.$gte = value.from;
    }

    if (hasTo) {
      range.$lte = value.to;
    }

    return { [field]: range };
  }

  private static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
