export * from './auth';
export * from './user';
export * from './wallet';

export interface CoreConfig {
  env: 'local' | 'dev' | 'stage' | 'prod';
  apiKey: string;
  orgHost: string;
}
