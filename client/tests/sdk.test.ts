// tests/sdk.test.ts
import { describe, it, expect } from 'vitest'
import { WeBlockWallet } from '../src'

describe('WeBlockWallet', () => {
  it('should initialize with options', () => {
    const sdk = new WeBlockWallet({
      environment: 'testnet',
      apiKey: 'test-key',
    })

    expect(sdk).toBeInstanceOf(WeBlockWallet)
    expect(sdk.wallet).toBeDefined()
  })
})
