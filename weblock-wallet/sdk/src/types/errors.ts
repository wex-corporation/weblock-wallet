export class SDKError extends Error {
  constructor(message: string) {
    super(`[WalletSDK] ${message}`)
    this.name = 'SDKError'
  }
}

export class AuthError extends SDKError {
  constructor(message: string) {
    super(`Authentication Error: ${message}`)
    this.name = 'AuthError'
  }
}
