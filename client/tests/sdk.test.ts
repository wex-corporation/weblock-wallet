// tests/sdk.test.ts
import { describe, it, expect } from 'vitest'
import WeBlockSDK, { WeBlockSDK as NamedSDK } from '../src'

const defaultOptions = {
  environment: 'local',
  apiKey: 'test-key',
  orgHost: 'localhost:3000',
} as const

describe('WeBlockSDK', () => {
  it('exports the class as both the default and a named export', () => {
    expect(typeof WeBlockSDK).toBe('function')
    expect(NamedSDK).toBe(WeBlockSDK)
  })

  it('initializes and exposes the module facades', () => {
    const sdk = new WeBlockSDK(defaultOptions)
    expect(sdk.isInitialized()).toBe(true)
    expect(sdk.user).toBeDefined()
    expect(sdk.wallet).toBeDefined()
    expect(sdk.asset).toBeDefined()
    expect(sdk.network).toBeDefined()
    expect(sdk.investment).toBeDefined()
  })

  it('exposes the documented user / wallet / investment methods', () => {
    const sdk = new WeBlockSDK(defaultOptions)
    expect(sdk.user.signIn).toBeTypeOf('function')
    expect(sdk.user.createWallet).toBeTypeOf('function')
    expect(sdk.user.retrieveWallet).toBeTypeOf('function')
    expect(sdk.user.signOut).toBeTypeOf('function')
    expect(sdk.wallet.getInfo).toBeTypeOf('function')
    expect(sdk.wallet.getBalance).toBeTypeOf('function')
    expect(sdk.investment.investRbtWithUsdr).toBeTypeOf('function')
    expect(sdk.investment.claimRbtRevenue).toBeTypeOf('function')
  })

  it('rejects invalid options (empty apiKey)', () => {
    expect(() => new WeBlockSDK({ ...defaultOptions, apiKey: '' })).toThrow()
  })
})
