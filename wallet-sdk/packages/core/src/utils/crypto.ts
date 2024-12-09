import * as crypto from 'crypto';
import { CryptoError } from '../errors';

export class Crypto {
  private static instance: Crypto;

  private constructor() {}

  static getInstance(): Crypto {
    if (!Crypto.instance) {
      Crypto.instance = new Crypto();
    }
    return Crypto.instance;
  }

  /**
   * Ed25519 키 쌍 생성
   * @returns {ApiKeyPair} API 키 쌍 (apiKey, secretKey)
   * @throws {CryptoError} 키 생성 실패시
   */
  createEdDSAKeyPair(): { apiKey: string; secretKey: string } {
    try {
      const keyPair = crypto.generateKeyPairSync('ed25519', {
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
