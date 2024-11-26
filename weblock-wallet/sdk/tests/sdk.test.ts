import { WalletSDK } from '../src/sdk'

describe('WalletSDK', () => {
  let sdk: WalletSDK

  beforeEach(() => {
    sdk = new WalletSDK()
  })

  test('should initialize the SDK', () => {
    sdk.initialize({ apiKey: 'test-key', env: 'local' })
    expect(sdk.isInitialized()).toBe(true)
  })

  test('should throw an error if initialized twice', () => {
    sdk.initialize({ apiKey: 'test-key', env: 'local' })
    expect(() =>
      sdk.initialize({ apiKey: 'test-key', env: 'local' })
    ).toThrowError('SDK is already initialized.')
  })

  test('should not allow operations if SDK is not initialized', () => {
    expect(sdk.isInitialized()).toBe(false)
  })
})
