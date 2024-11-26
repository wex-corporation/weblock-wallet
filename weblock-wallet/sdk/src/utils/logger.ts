export class Logger {
  static log(message: string, ...optionalParams: any[]): void {
    console.log(`[WalletSDK] ${message}`, ...optionalParams)
  }
}
