import * as speakeasy from 'speakeasy'
import * as qrcode from 'qrcode'
import { QRCode } from 'qrcode'

// WIP
interface ITwoFactor {
  generateSecret(): string
  createQRCode(secret: string): QRCode
  verifyToken(secret: string, userToken: string): boolean
}

export const TwoFactor: ITwoFactor = {
  generateSecret(): string {
    const secret = speakeasy.generateSecret({ length: 20 })
    return secret.base32
  },

  createQRCode(secret: string): QRCode {
    return qrcode.create('otpauth://totp/MyApp?secret=' + secret)
  },

  verifyToken(secret: string, userToken: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: userToken
    })
  }
}
