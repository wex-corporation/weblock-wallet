// common.ts
import { Blockchain } from './blockchain'

// HTTP 상태 코드와 오류 정의
export interface ErrorResponse {
  code: number
  message: string
  details?: string
}

export enum HttpStatus {
  SUCCESS = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500
}

export enum CustomErrorCode {
  INVALID_ARGUMENT = 4000,
  USER_REJECTED_REQUEST = 4001,
  NOT_IMPLEMENTED = 4002
}

// 공통 타입 정의
export type HexString = string

export interface CryptoBuffer {
  hex: HexString
  length: number
  toHex(): string
  toUInt8Array(): Uint8Array
  toBigNumber(): bigint
}

export interface User {
  id: string
  orgId: string
  email: string
  firebaseId: string
  provider: string
  blockchains: Blockchain[]
}
