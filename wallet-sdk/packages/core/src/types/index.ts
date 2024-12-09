export * from './auth';
export * from './user';
export * from './blockchain';
export * from './coin';
export * from './client';

/**
 * Core 초기화를 위한 환경 설정 타입
 */
export type Environment = 'local' | 'dev' | 'stage' | 'prod';

/**
 * Core 초기화 옵션
 */
export interface CoreOptions {
  /** API 키 */
  apiKey: string;
  /** 환경 설정 */
  env: Environment;
  /** 조직 호스트 URL */
  orgHost: string;
  /** 기본 URL (선택적, env 기반으로 자동 설정) */
  baseURL?: string;
}
