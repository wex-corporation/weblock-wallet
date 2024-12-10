import { ICryptoProvider } from '../providers/interfaces/crypto';
import { NodeCryptoProvider } from '../providers/node/crypto';
import { CryptoError } from '../errors';

export class Crypto {
  private static instance: Crypto;
  private provider: ICryptoProvider;

  private constructor() {
    this.provider = new NodeCryptoProvider();
  }

  static getInstance(): Crypto {
    if (!Crypto.instance) {
      Crypto.instance = new Crypto();
    }
    return Crypto.instance;
  }

  createEdDSAKeyPair(): { apiKey: string; secretKey: string } {
    try {
      const keyPair = this.provider.generateKeyPairSync({
        publicKeyEncoding: {
          type: 'spki',
          format: 'der',
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
        },
      });

      const apiKey = Buffer.from(keyPair.publicKey.subarray(12)).toString(
        'base64url'
      );
      const secretKey = this.urlEncode(keyPair.privateKey);

      return { apiKey, secretKey };
    } catch (error) {
      throw new CryptoError('Failed to create EdDSA key pair', {
        cause: error as Error,
      });
    }
  }

  private urlEncode(pemKey: string): string {
    const pemFormat =
      /-----(BEGIN|END) (RSA PRIVATE|EC PRIVATE|PRIVATE|PUBLIC) KEY-----/g;
    return pemKey
      .replace(pemFormat, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '')
      .replace(/\s/g, '');
  }
}
