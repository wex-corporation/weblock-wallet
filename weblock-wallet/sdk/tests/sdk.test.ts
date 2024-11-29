import { WalletSDK } from '../src/sdk'
import { AvailableProviders } from '../src/types'

// Core의 동작을 모킹
jest.mock('@wefunding-dev/wallet-core', () => ({
  Core: class {
    async signInWithProvider() {
      return Promise.resolve()
    }
    async signOut() {
      return Promise.resolve()
    }
    async isLoggedIn() {
      return Promise.resolve(true)
    }
  }
}))

describe('WalletSDK', () => {
  let sdk: WalletSDK

  beforeEach(() => {
    sdk = new WalletSDK()
  })

  test('should initialize the SDK', () => {
    sdk.initialize({ apiKey: 'test-key', env: 'local' })
    expect(sdk.isInitialized()).toBe(true)
  })

  test('should sign in with a provider', async () => {
    sdk.initialize({ apiKey: 'test-key', env: 'local' })
    await expect(
      sdk.signInWithProvider(AvailableProviders.Google)
    ).resolves.not.toThrow()
  })

  test('should sign out without errors', async () => {
    sdk.initialize({ apiKey: 'test-key', env: 'local' })
    await expect(sdk.signOut()).resolves.not.toThrow()
  })

  test('should check login status', async () => {
    sdk.initialize({ apiKey: 'test-key', env: 'local' })
    const isLoggedIn = await sdk.isLoggedIn()
    expect(isLoggedIn).toBe(true)
  })
})
