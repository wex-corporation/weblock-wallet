import * as crypto from 'crypto';
import { Buffer } from 'buffer';
import { ICryptoProvider } from '../interfaces/crypto';

export class NodeCryptoProvider implements ICryptoProvider {
  generateKeyPairSync(options: {
    publicKeyEncoding: { type: string; format: string };
    privateKeyEncoding: { type: string; format: string };
  }) {
    const keyPair = crypto.generateKeyPairSync('ed25519', options);
    return {
      publicKey: Buffer.from(keyPair.publicKey as any),
      privateKey: keyPair.privateKey as unknown as string,
    };
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
