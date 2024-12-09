import { CoreError } from '.';

export class CryptoError extends CoreError {
  cause?: Error;

  constructor(message: string, options?: { cause: Error }) {
    super(message);
    this.name = 'CryptoError';
    if (options?.cause) {
      this.cause = options.cause;
    }
  }
}
