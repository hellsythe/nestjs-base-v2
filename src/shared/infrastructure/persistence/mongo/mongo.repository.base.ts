import { FilterQuery, Model, UpdateQuery } from 'mongoose';

export interface MongoPaginationParams {
  offset: number;
  limit: number;
}

export interface MongoSortParams {
  [field: string]: 1 | -1;
}

export type MongoWriteResult = {
  acknowledged: boolean;
  matchedCount: number;
  modifiedCount: number;
};

export interface MongoUpdateOptions {
  touchUpdatedAt?: boolean;
  updatedBy?: string | null;
}

/**
 * Base repository de Mongo
 * - SOLO infraestructura
 * - NO expone contratos de dominio
 * - Reutiliza CRUD técnico
 */
export abstract class MongoRepositoryBase<TSchema, TPersistence> {
  protected constructor(protected readonly model: Model<TSchema>) {}

  private toMongoWriteResult(result: {
    acknowledged: boolean;
    matchedCount: number;
    modifiedCount: number;
  }): MongoWriteResult {
    return {
      acknowledged: result.acknowledged,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    };
  }

  private buildSetPayload(
    document: Partial<TSchema>,
    options?: MongoUpdateOptions,
  ): Record<string, unknown> {
    const payload: Record<string, unknown> = {
      ...(document as Record<string, unknown>),
    };

    if (options?.touchUpdatedAt !== false) {
      payload.updatedAt = new Date();
    }

    if (options && 'updatedBy' in options) {
      payload.updatedBy = options.updatedBy;
    }

    return payload;
  }

  /* =====================================================
   * READ
   * ===================================================== */

  protected async findOneRaw(
    filter: FilterQuery<TSchema>,
  ): Promise<TPersistence | null> {
    return this.model
      .findOne({ ...filter, deletedAt: null })
      .lean<TPersistence>()
      .exec();
  }

  protected async findManyRaw(
    filter: FilterQuery<TSchema>,
  ): Promise<TPersistence[]> {
    return this.model
      .find({ ...filter, deletedAt: null })
      .lean<TPersistence[]>()
      .exec();
  }

  protected async findPaginatedRaw(
    filter: FilterQuery<TSchema>,
    pagination: MongoPaginationParams,
    sort?: MongoSortParams,
  ): Promise<{ data: TPersistence[]; total: number }> {
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

    const data = await query.lean<TPersistence[]>().exec();

    return { data, total };
  }

  /* =====================================================
   * WRITE
   * ===================================================== */

  protected async insertRaw(document: Partial<TSchema>): Promise<TPersistence> {
    const created = await this.model.create(document);

    return created.toObject<TPersistence>();
  }

  protected async updateByIdRaw(
    id: string,
    document: Partial<TSchema>,
    options?: MongoUpdateOptions,
  ): Promise<MongoWriteResult> {
    return this.updateOneRaw({ _id: id } as FilterQuery<TSchema>, document, options);
  }

  protected async updateOneRaw(
    filter: FilterQuery<TSchema>,
    document: Partial<TSchema>,
    options?: MongoUpdateOptions,
  ): Promise<MongoWriteResult> {
    const payload = this.buildSetPayload(document, options);

    const result = await this.model.updateOne(
      { ...filter, deletedAt: null },
      { $set: payload as UpdateQuery<TSchema> },
    );

    return this.toMongoWriteResult(result);
  }

  protected async updateManyRaw(
    filter: FilterQuery<TSchema>,
    document: Partial<TSchema>,
    options?: MongoUpdateOptions,
  ): Promise<MongoWriteResult> {
    const payload = this.buildSetPayload(document, options);

    const result = await this.model.updateMany(
      { ...filter, deletedAt: null },
      { $set: payload as UpdateQuery<TSchema> },
    );

    return this.toMongoWriteResult(result);
  }

  protected async softDeleteRaw(
    id: string,
    updatedBy?: string | null,
  ): Promise<MongoWriteResult> {
    const payload: Record<string, unknown> = {
      deletedAt: new Date(),
      updatedAt: new Date(),
    };

    if (updatedBy !== undefined) {
      payload.updatedBy = updatedBy;
    }

    const result = await this.model.updateOne(
      { _id: id, deletedAt: null },
      { $set: payload as UpdateQuery<TSchema> },
    );

    return this.toMongoWriteResult(result);
  }
}
