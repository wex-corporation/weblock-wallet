import { CoreError } from './base';

export class SecretSharingError extends CoreError {
  cause?: Error;

  constructor(message: string, options?: { cause: Error }) {
    super(message);
    this.name = 'SecretSharingError';
    if (options?.cause) {
      this.cause = options.cause;
    }
  }
}
