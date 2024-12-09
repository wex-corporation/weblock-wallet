import { CoreError } from '.';

export class WalletError extends CoreError {
  cause?: Error;

  constructor(message: string, options?: { cause: Error }) {
    super(message);
    this.name = 'WalletError';
    if (options?.cause) {
      this.cause = options.cause;
    }
  }
}
