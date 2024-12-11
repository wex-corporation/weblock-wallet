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

export interface CoreOptions {
  /**
   * API 서버 기본 URL (선택적)
   * 제공되지 않으면 env에 따른 기본값 사용
   */
  baseURL?: string;

  /**
   * API 키
   */
  apiKey: string;

  /**
   * 조직 호스트 URL
   */
  orgHost: string;

  /**
   * 환경 설정 ('local' | 'dev' | 'stage' | 'prod')
   */
  env: keyof typeof import('../config').defaultConfig.baseUrls;
}
