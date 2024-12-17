import * as crypto from 'crypto'

export interface ApiKeyPair {
  apiKey: string
  secretKey: string
}

interface ICrypto {
  createEdDSAKeyPair(): ApiKeyPair
}

function urlEncode(pemKey: string) {
  const pemFormat =
    /-----(BEGIN|END) (RSA PRIVATE|EC PRIVATE|PRIVATE|PUBLIC) KEY-----/g
  const base64Key = pemKey.replace(pemFormat, '') // remove all whitespace characters from the key
  return base64Key
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
    .replace(/ /g, '')
    .replace(/\r/g, '')
    .replace(/\n/g, '')
}

export const Crypto: ICrypto = {
  createEdDSAKeyPair(): ApiKeyPair {
    const now = Date.now()
    const keyPair = crypto.generateKeyPairSync('ed25519', {
      publicKeyEncoding: {
        type: 'spki',
        format: 'der',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    })
    console.log('time: ' + (Date.now() - now) + 'ms')

    const apiKey = Buffer.from(keyPair.publicKey.subarray(12)).toString(
      'base64url'
    )
    const secretKey = urlEncode(keyPair.privateKey)

    return { apiKey, secretKey }
  },
}
