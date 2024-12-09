import { CoreError } from './base';

export class StorageError extends CoreError {
  cause?: Error;

  constructor(message: string, options?: { cause: Error }) {
    super(message);
    this.name = 'StorageError';
    if (options?.cause) {
      this.cause = options.cause;
    }
  }
}
