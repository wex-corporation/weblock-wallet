import { ICryptoProvider } from '@wallet-sdk/core';
import * as crypto from 'crypto-browserify';
import { Buffer } from 'buffer';

export class BrowserCryptoProvider implements ICryptoProvider {
  generateKeyPairSync(options: {
    publicKeyEncoding: { type: string; format: string };
    privateKeyEncoding: { type: string; format: string };
  }): { publicKey: Buffer; privateKey: string } {
    throw new Error('generateKeyPairSync is not supported in browser');
  }

  createHash(algorithm: string) {
    return crypto.createHash(algorithm);
  }

  createHmac(algorithm: string, key: string | Buffer) {
    return crypto.createHmac(algorithm, key);
  }

  randomBytes(size: number): Buffer {
    return crypto.randomBytes(size);
  }

  pbkdf2Sync(
    password: string | Buffer,
    salt: string | Buffer,
    iterations: number,
    keylen: number,
    digest: string
  ): Buffer {
    return crypto.pbkdf2Sync(password, salt, iterations, keylen, digest);
  }
}
