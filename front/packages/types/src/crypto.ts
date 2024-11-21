// src/crypto.ts
export interface ApiKeyPair {
  apiKey: string
  secretKey: string
}

export interface ICrypto {
  createEdDSAKeyPair(): ApiKeyPair
}
