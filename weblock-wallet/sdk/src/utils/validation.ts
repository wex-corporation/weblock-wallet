import { WalletSDKConfig } from '../types'
import { Logger } from './logger'

/**
 * SDK 설정 유효성 검사 에러
 * @internal
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * SDK 관련 유효성 검사 유틸리티
 * @internal
 */
export class Validation {
  /**
   * SDK 설정 유효성 검사
   */
  static validateConfig(config: WalletSDKConfig): void {
    Logger.debug('Validating SDK config', config)

    if (!config.apiKey) {
      throw new ValidationError('API key is required')
    }

    if (!config.env) {
      throw new ValidationError('Environment is required')
    }

    const validEnvs = ['local', 'dev', 'stage', 'prod']
    if (!validEnvs.includes(config.env)) {
      throw new ValidationError(
        `Invalid environment. Must be one of: ${validEnvs.join(', ')}`
      )
    }

    if (config.orgHost && !this.isValidUrl(config.orgHost)) {
      throw new ValidationError('Invalid organization host URL')
    }

    Logger.debug('SDK config validation passed')
  }

  /**
   * URL 유효성 검사
   */
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * 이더리움 주소 유효성 검사
   */
  static isValidEthereumAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  /**
   * 트랜잭션 해시 유효성 검사
   */
  static isValidTransactionHash(hash: string): boolean {
    return /^0x[a-fA-F0-9]{64}$/.test(hash)
  }
}
