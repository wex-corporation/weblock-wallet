/**
 * 로그 레벨 타입
 * @internal
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/**
 * SDK 로깅을 위한 유틸리티 클래스
 * @internal
 */
export class Logger {
  private static currentLevel: LogLevel = 'info'

  private static readonly levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  }

  /**
   * 로깅 레벨 설정
   * @param level - 설정할 로그 레벨
   */
  static setLogLevel(level: LogLevel): void {
    if (this.levels[level] !== undefined) {
      this.currentLevel = level
      this.info(`Log level set to '${level}'`)
    }
  }

  /**
   * 로그 출력 처리
   */
  private static log(
    level: LogLevel,
    message: string,
    ...args: unknown[]
  ): void {
    if (this.levels[level] >= this.levels[this.currentLevel]) {
      const prefix = `[WeblockSDK][${level.toUpperCase()}]`
      const style =
        level === 'error'
          ? 'color: red'
          : level === 'warn'
          ? 'color: orange'
          : level === 'info'
          ? 'color: blue'
          : 'color: gray'

      console[level === 'debug' ? 'log' : level](
        `%c${prefix}`,
        style,
        message,
        ...args
      )
    }
  }

  static debug(message: string, ...args: unknown[]): void {
    this.log('debug', message, ...args)
  }

  static info(message: string, ...args: unknown[]): void {
    this.log('info', message, ...args)
  }

  static warn(message: string, ...args: unknown[]): void {
    this.log('warn', message, ...args)
  }

  static error(message: string, ...args: unknown[]): void {
    this.log('error', message, ...args)
  }
}
