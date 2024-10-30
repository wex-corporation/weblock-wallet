import { split, combine } from 'shamir-secret-sharing'

interface ISecrets {
  split(secret: string, total: number, threshold: number): Promise<string[]>
  combine(shares: string[]): Promise<string>
}

export const Secrets: ISecrets = {
  async split(
    secret: string,
    total: number,
    threshold: number
  ): Promise<string[]> {
    if (secret.startsWith('0x')) {
      secret = secret.substring(2)
    }
    const byteArray = Uint8Array.from(Buffer.from(secret, 'hex')) // Hex를 Uint8Array로 변환
    const shares = await split(byteArray, total, threshold)
    return shares.map((share) => Buffer.from(share).toString('hex'))
  },

  async combine(shares: string[]): Promise<string> {
    const byteShares = shares.map((share) =>
      Uint8Array.from(Buffer.from(share, 'hex'))
    )
    const combined = await combine(byteShares)
    return `0x${Buffer.from(combined).toString('hex')}`
  }
}
