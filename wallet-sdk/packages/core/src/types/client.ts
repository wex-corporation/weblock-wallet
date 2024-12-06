import { HttpError, NetworkError, TimeoutError } from '../errors/http';

/**
 * HTTP 클라이언트 초기화 옵션
 */
export interface ClientOptions {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  apiKey: string;
  orgHost: string;
}

/**
 * HTTP 요청 설정
 */
export interface RequestConfig {
  headers?: Record<string, string>;
  needsAccessToken?: boolean;
  timeout?: number;
  retry?: number;
  params?: Record<string, string | number>;
}

/**
 * API 응답 기본 구조
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

/**
 * API 에러 정보
 */
export interface ApiError {
  code: ApiErrorCode;
  message: string;
  details?: Record<string, any>;
}

/**
 * API 에러 코드
 */
export enum ApiErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
}

/**
 * API 에러를 HTTP 에러로 변환하는 유틸리티 타입
 */
export type ApiErrorMapping = {
  [key in ApiErrorCode]:
    | typeof HttpError
    | typeof NetworkError
    | typeof TimeoutError;
};
