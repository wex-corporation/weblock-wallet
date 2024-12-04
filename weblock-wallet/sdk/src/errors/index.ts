/**
 * SDK 관련 기본 에러 클래스
 */
export class SDKError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SDKError'
  }
}

export class SDKNotInitializedError extends SDKError {
  constructor() {
    super('SDK must be initialized before use')
    this.name = 'SDKNotInitializedError'
  }
}

export class SDKAlreadyInitializedError extends SDKError {
  constructor() {
    super('SDK is already initialized')
    this.name = 'SDKAlreadyInitializedError'
  }
}
