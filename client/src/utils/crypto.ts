// rwx-wallet/client/src/utils/crypto.ts
import * as crypto from 'crypto'
import * as ed from '@noble/ed25519'

export const Crypto = {
  async createEdDSAKeyPair() {
    /* unchanged */
  },

  encryptShare(share: string, password: string, salt: string): string {
    // New format (authenticated): gcm:<ivHex>:<tagHex>:<cipherHex>
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512')
    const iv = crypto.randomBytes(12) // GCM recommended IV length
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)

    let encrypted = cipher.update(share, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    const tag = cipher.getAuthTag()

    return `gcm:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`
  },

  decryptShare(encryptedShare: string, password: string, salt: string): string {
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512')

    try {
      // New format
      if (encryptedShare.startsWith('gcm:')) {
        const [, ivHex, tagHex, cipherHex] = encryptedShare.split(':')
        const iv = Buffer.from(ivHex, 'hex')
        const tag = Buffer.from(tagHex, 'hex')

        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
        decipher.setAuthTag(tag)

        let decrypted = decipher.update(cipherHex, 'hex', 'utf8')
        decrypted += decipher.final('utf8')
        return decrypted
      }

      // Legacy format (unauthenticated): <ivHex>:<cipherHex>
      const [ivHex, cipherHex] = encryptedShare.split(':')
      const iv = Buffer.from(ivHex, 'hex')
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)

      let decrypted = decipher.update(cipherHex, 'hex', 'utf8')
      decrypted += decipher.final('utf8')

      // Validate expected format: Shamir share is a hex string.
      // If PIN/salt is wrong, CBC may "decrypt" into garbage; reject it here.
      if (!/^[0-9a-fA-F]+$/.test(decrypted) || decrypted.length % 2 !== 0) {
        throw new Error('Wrong password')
      }

      return decrypted
    } catch (e: any) {
      // Normalize wrong-pin error
      throw new Error('Wrong password')
    }
  },
}
