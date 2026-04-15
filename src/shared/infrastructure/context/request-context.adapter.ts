import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { RequestContextPort } from '../../application/ports/request-context.port';

@Injectable()
export class RequestContextAdapter implements RequestContextPort {
  private readonly storage = new AsyncLocalStorage<Map<string, unknown>>();

  runWithRequestId(requestId: string, callback: () => void): void {
    const store = new Map<string, unknown>();
    store.set('requestId', requestId);
    this.storage.run(store, callback);
  }

  getRequestId(): string | undefined {
    return this.get<string>('requestId');
  }

  get<T = any>(key: string): T | undefined {
    return this.storage.getStore()?.get(key) as T | undefined;
  }
}
