import { split, combine } from 'shamir-secret-sharing'
import { ISecrets } from '@weblock-wallet/types'

export const Secrets: ISecrets = {
  async split(
    secret: string,
    total: number,
    threshold: number
  ): Promise<string[]> {
    if (secret.startsWith('0x')) {
      secret = secret.substring(2)
    }
    const array = await split(
      new Uint8Array(Buffer.from(secret, 'hex')),
      total,
      threshold
    )
    return array.map((item) => Buffer.from(item).toString('hex'))
  },
  async combine(shares: string[]): Promise<string> {
    const array = shares.map((item) => new Uint8Array(Buffer.from(item, 'hex')))
    return `0x${Buffer.from(await combine(array)).toString('hex')}`
  }
}
