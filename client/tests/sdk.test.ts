// tests/sdk.test.ts
import { describe, it, expect } from 'vitest'
import { WeBlockWallet } from '../src'

describe('WeBlockWallet', () => {
  const defaultOptions = {
    environment: 'local',
    apiKey: 'test-key',
    orgHost: 'localhost:3000',
  } as const

  it('should initialize with options', () => {
    const sdk = new WeBlockWallet(defaultOptions)

    expect(sdk).toBeInstanceOf(WeBlockWallet)
    expect(sdk.wallet).toBeDefined()
    expect(sdk.user).toBeDefined()
  })

  describe('WalletModule', () => {
    it('should have required methods', () => {
      const sdk = new WeBlockWallet(defaultOptions)

      expect(sdk.wallet.create).toBeDefined()
      expect(sdk.wallet.recover).toBeDefined()
      expect(sdk.wallet.getAddress).toBeDefined()
    })
  })

  describe('UserModule', () => {
    it('should have required methods', () => {
      const sdk = new WeBlockWallet(defaultOptions)

      expect(sdk.user.signIn).toBeDefined()
      expect(sdk.user.signOut).toBeDefined()
      expect(sdk.user.isLoggedIn).toBeDefined()
    })
  })
})
