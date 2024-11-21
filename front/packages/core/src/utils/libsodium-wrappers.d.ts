declare module 'libsodium-wrappers' {
  export const ready: Promise<void>
  export const crypto_sign_keypair: () => {
    publicKey: Uint8Array
    privateKey: Uint8Array
  }
  export const to_base64: (input: Uint8Array, variant: number) => string
  export const base64_variants: {
    ORIGINAL: number
    ORIGINAL_NO_PADDING: number
    URLSAFE: number
    URLSAFE_NO_PADDING: number
  }
}
