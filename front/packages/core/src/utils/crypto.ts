import * as crypto from 'crypto'
import { ApiKeyPair } from '@weblock-wallet/types'

export const Crypto = {
  createEdDSAKeyPair(): ApiKeyPair {
    const keyPair = crypto.generateKeyPairSync('ed25519', {
      publicKeyEncoding: { type: 'spki', format: 'der' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    })

    const apiKey = Buffer.from(keyPair.publicKey.subarray(12)).toString(
      'base64url'
    )
    const secretKey = urlEncode(keyPair.privateKey)

    return { apiKey, secretKey }
  }
}

function urlEncode(pemKey: string): string {
  const base64Key = pemKey.replace(/-----(BEGIN|END) .+ KEY-----/g, '')
  return base64Key
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
    .replace(/\s+/g, '')
}
