type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export class Logger {
  // 현재 활성화된 로깅 수준 (기본값: info)
  private static currentLevel: LogLevel = 'info'

  // 로깅 수준의 우선순위 정의
  private static levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  }

  /**
   * 로깅 수준 설정
   * @param level - 활성화할 로깅 수준
   */
  static setLogLevel(level: LogLevel): void {
    if (Logger.levels[level] !== undefined) {
      Logger.currentLevel = level
      Logger.info(`로깅 수준이 '${level}'(으)로 설정되었습니다.`)
    } else {
      console.warn(`[Logger] 잘못된 로그 수준: ${level}`)
    }
  }

  /**
   * 브라우저 환경에 적합한 출력 메서드
   * @param level - 로깅 수준
   * @param message - 출력할 메시지
   * @param optionalParams - 추가 정보
   */
  private static logMessage(
    level: LogLevel,
    message: string,
    ...optionalParams: unknown[]
  ): void {
    if (Logger.levels[level] >= Logger.levels[Logger.currentLevel]) {
      const prefix = `%c[WalletSDK][${level.toUpperCase()}]`
      const styles =
        level === 'debug'
          ? 'color: gray'
          : level === 'info'
          ? 'color: blue'
          : level === 'warn'
          ? 'color: orange'
          : 'color: red'
      console[level === 'debug' ? 'log' : level](
        prefix,
        styles,
        message,
        ...optionalParams
      )
    }
  }

  /**
   * 디버그 메시지 출력
   */
  static debug(message: string, ...optionalParams: unknown[]): void {
    Logger.logMessage('debug', message, ...optionalParams)
  }

  /**
   * 정보 메시지 출력
   */
  static info(message: string, ...optionalParams: unknown[]): void {
    Logger.logMessage('info', message, ...optionalParams)
  }

  /**
   * 경고 메시지 출력
   */
  static warn(message: string, ...optionalParams: unknown[]): void {
    Logger.logMessage('warn', message, ...optionalParams)
  }

  /**
   * 에러 메시지 출력
   */
  static error(message: string, ...optionalParams: unknown[]): void {
    Logger.logMessage('error', message, ...optionalParams)
  }
}
