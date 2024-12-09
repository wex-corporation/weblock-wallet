export class CoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CoreError';
  }
}

export * from './http';
export * from './secrets';
export * from './crypto';
export * from './numbers';
export * from './jwt';
export * from './wallet';
export * from './storage';
