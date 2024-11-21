// errors.ts
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
