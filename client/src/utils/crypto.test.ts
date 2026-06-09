import { describe, it, expect } from 'vitest'
import { Crypto } from './crypto'

describe('Crypto', () => {
  it('createEdDSAKeyPair returns a fresh 32-byte (64-hex) Ed25519 keypair', () => {
    const kp = Crypto.createEdDSAKeyPair()
    expect(kp.privateKey).toMatch(/^[0-9a-f]{64}$/)
    expect(kp.publicKey).toMatch(/^[0-9a-f]{64}$/)
    expect(kp.privateKey).not.toEqual(kp.publicKey)
    // each call is independent (random private key)
    expect(Crypto.createEdDSAKeyPair().privateKey).not.toEqual(kp.privateKey)
  })

  it('encryptShare/decryptShare round-trips via the GCM format', () => {
    const share = 'deadbeefcafe0123456789abcdef'
    const enc = Crypto.encryptShare(share, 'pin1234', 'salt-value')
    expect(enc.startsWith('gcm:')).toBe(true)
    expect(Crypto.decryptShare(enc, 'pin1234', 'salt-value')).toEqual(share)
  })

  it('decryptShare rejects a wrong password', () => {
    const enc = Crypto.encryptShare('abcdef0123', 'right-pin', 'salt-value')
    expect(() => Crypto.decryptShare(enc, 'wrong-pin', 'salt-value')).toThrow()
  })
})
