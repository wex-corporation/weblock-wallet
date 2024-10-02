import * as crypto from 'crypto'

// WIP
export function generateEncryptionKey(data: string): string {
  const hash = crypto.createHash('sha256')
  hash.update(data)
  return hash.digest('hex')
}

export function createZKP(data: string): string {
  return generateEncryptionKey(data)
}

export function verifyZKP(data: string, proof: string): boolean {
  return generateEncryptionKey(data) === proof
}
