// utils.ts
export type HexString = string

export interface CryptoBuffer {
  hex: HexString
  length: number
  toHex(): string
  toUInt8Array(): Uint8Array
  toBigNumber(): bigint
}

export interface INumbers {
  hexToDecimal(hexString: string): string
  weiToEth(wei: string): string
}

export interface ISecrets {
  split(secret: string, total: number, threshold: number): Promise<string[]>
  combine(shares: string[]): Promise<string>
}

export interface ITwoFactor {
  generateSecret(): string
  createQRCode(secret: string): Promise<string>
  verifyToken(secret: string, userToken: string): boolean
}
