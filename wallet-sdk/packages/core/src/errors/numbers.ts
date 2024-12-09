import { CoreError } from '.';

export class NumbersError extends CoreError {
  cause?: Error;

  constructor(message: string, options?: { cause: Error }) {
    super(message);
    this.name = 'NumbersError';
    if (options?.cause) {
      this.cause = options.cause;
    }
  }
}
