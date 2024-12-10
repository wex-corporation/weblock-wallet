import { ICryptoProvider } from '../providers/interfaces/crypto';
import { IHttpProvider } from '../providers/interfaces/http';
import { IStorageProvider } from '../providers/interfaces/storage';

export * from './auth';
export * from './user';
export * from './blockchain';
export * from './coin';
export * from './client';

/**
 * Core 초기화를 위한 환경 설정 타입
 */
export type Environment = 'local' | 'dev' | 'stage' | 'prod';

export interface CoreOptions {
  apiKey: string;
  env: Environment;
  orgHost: string;
  baseURL?: string;
  providers?: {
    http?: IHttpProvider;
    crypto?: ICryptoProvider;
    storage?: IStorageProvider;
  };
}
