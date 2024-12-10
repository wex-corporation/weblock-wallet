import { Buffer } from 'buffer';

export interface ICryptoProvider {
  generateKeyPairSync(options: {
    publicKeyEncoding: {
      type: string;
      format: string;
    };
    privateKeyEncoding: {
      type: string;
      format: string;
    };
  }): {
    publicKey: Buffer;
    privateKey: string;
  };

  createHash(algorithm: string): {
    update(data: string): {
      digest(encoding: string): string;
    };
  };

  createHmac(
    algorithm: string,
    key: string | Buffer
  ): {
    update(data: string): {
      digest(encoding: string): string;
    };
  };

  randomBytes(size: number): Buffer;

  pbkdf2Sync(
    password: string | Buffer,
    salt: string | Buffer,
    iterations: number,
    keylen: number,
    digest: string
  ): Buffer;
}
