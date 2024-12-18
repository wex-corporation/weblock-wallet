import * as crypto from 'crypto'
import * as ed from '@noble/ed25519'

export interface ApiKeyPair {
  apiKey: string
  secretKey: string
}

interface ICrypto {
  createEdDSAKeyPair(): Promise<ApiKeyPair>
  encryptShare(share: string, password: string, salt: string): string
  decryptShare(encryptedShare: string, password: string, salt: string): string
}

function urlEncode(pemKey: string) {
  const pemFormat =
    /-----(BEGIN|END) (RSA PRIVATE|EC PRIVATE|PRIVATE|PUBLIC) KEY-----/g
  const base64Key = pemKey.replace(pemFormat, '')
  return base64Key
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
    .replace(/ /g, '')
    .replace(/\r/g, '')
    .replace(/\n/g, '')
}

export const Crypto: ICrypto = {
  async createEdDSAKeyPair(): Promise<ApiKeyPair> {
    const privateKey = ed.utils.randomPrivateKey()
    const publicKey = ed.getPublicKey(privateKey)

    const apiKey = Buffer.from(publicKey).toString('base64url')
    const secretKey = urlEncode(Buffer.from(privateKey).toString('base64'))

    return { apiKey, secretKey }
  },

  encryptShare(share: string, password: string, salt: string): string {
    try {
      const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512')
      const iv: Buffer = crypto.randomBytes(16)
      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
      let encrypted = cipher.update(share, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      return `${iv.toString('hex')}:${encrypted}`
    } catch (e) {
      console.error('Error during encrypting share:', e)
      throw e
    }
  },

  decryptShare(encryptedShare: string, password: string, salt: string): string {
    try {
      const [ivHex, encrypted] = encryptedShare.split(':')
      const iv = Buffer.from(ivHex, 'hex')
      const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512')
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      return decrypted
    } catch (e: any) {
      console.error('Error during decrypting share:', e)
      if (e.message === 'unable to decrypt data') {
        throw new Error('Wrong password')
      }
      throw e
    }
  },
}
