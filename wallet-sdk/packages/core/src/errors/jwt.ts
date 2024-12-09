import { CoreError } from '.';

export class JwtError extends CoreError {
  cause?: Error;

  constructor(message: string, options?: { cause: Error }) {
    super(message);
    this.name = 'JwtError';
    if (options?.cause) {
      this.cause = options.cause;
    }
  }
}
