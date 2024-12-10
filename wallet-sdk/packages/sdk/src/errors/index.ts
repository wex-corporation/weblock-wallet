export class SDKError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SDKError';
  }
}
export class SDKInitializationError extends SDKError {
  public readonly cause?: Error;

  constructor(message: string, options?: { cause?: Error }) {
    super(message);
    this.name = 'SDKInitializationError';
    if (options?.cause) {
      this.cause = options.cause;
    }
  }
}
