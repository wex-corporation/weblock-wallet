// core/src/utils/twoFactor.ts
import * as speakeasy from 'speakeasy'
import * as qrcode from 'qrcode'
import { ITwoFactor } from '@weblock-wallet/types'

export const TwoFactor: ITwoFactor = {
  generateSecret(): string {
    const secret = speakeasy.generateSecret({ length: 20 })
    return secret.base32
  },

  async createQRCode(secret: string): Promise<string> {
    return await qrcode.toDataURL('otpauth://totp/MyApp?secret=' + secret)
  },

  verifyToken(secret: string, userToken: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: userToken
    })
  }
}
