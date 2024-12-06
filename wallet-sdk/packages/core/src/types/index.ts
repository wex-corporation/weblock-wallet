export * from './auth';
export * from './user';
export * from './blockchain';
export * from './coin';
export * from './client';

export interface CoreConfig {
  env: 'local' | 'dev' | 'stage' | 'prod';
  apiKey: string;
  orgHost: string;
}
