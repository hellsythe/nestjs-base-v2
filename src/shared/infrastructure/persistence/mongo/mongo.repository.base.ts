import { Model, FilterQuery } from 'mongoose';

export interface MongoPaginationParams {
  offset: number;
  limit: number;
}

export interface MongoSortParams {
  [field: string]: 1 | -1;
}

/**
 * Base repository de Mongo
 * - SOLO infraestructura
 * - NO expone contratos de dominio
 * - Reutiliza CRUD técnico
 */
export abstract class MongoRepositoryBase<TDocument> {
  protected constructor(protected readonly model: Model<TDocument>) {}

  /* =====================================================
   * READ
   * ===================================================== */

  protected async findOneRaw(
    filter: FilterQuery<TDocument>,
  ): Promise<TDocument | null> {
    return this.model
      .findOne({ ...filter, deletedAt: null })
      .lean() as Promise<TDocument | null>;
  }

  protected async findManyRaw(
    filter: FilterQuery<TDocument>,
  ): Promise<TDocument[]> {
    return this.model.find({ ...filter, deletedAt: null }).lean() as Promise<
      TDocument[]
    >;
  }

  protected async findPaginatedRaw(
    filter: FilterQuery<TDocument>,
    pagination: MongoPaginationParams,
    sort?: MongoSortParams,
  ): Promise<{ data: TDocument[]; total: number }> {
    const total = await this.model.countDocuments({
      ...filter,
      deletedAt: null,
    });

    const query = this.model
      .find({ ...filter, deletedAt: null })
      .skip(pagination.offset)
      .limit(pagination.limit);

    if (sort) {
      query.sort(sort);
    }

    const data = await query.lean<TDocument[]>();

    return { data, total };
  }

  /* =====================================================
   * WRITE
   * ===================================================== */

  protected async insertRaw(document: TDocument): Promise<void> {
    await this.model.create(document);
  }

  protected async upsertRaw(
    id: string,
    document: Partial<TDocument>,
  ): Promise<void> {
    await this.model.updateOne(
      { _id: id },
      { $set: document },
      { upsert: true },
    );
  }

  protected async softDeleteRaw(id: string): Promise<void> {
    await this.model.updateOne(
      { _id: id },
      { $set: { deletedAt: new Date() } },
    );
  }
}
