import sodium from 'libsodium-wrappers'
import { ApiKeyPair } from '@weblock-wallet/types'

export const Crypto = {
  async createEdDSAKeyPair(): Promise<ApiKeyPair> {
    // 1. 라이브러리 초기화
    await sodium.ready

    // 2. ed25519 키 쌍 생성
    const keyPair = sodium.crypto_sign_keypair()

    // 3. 공개 키와 비밀 키를 Base64 URL-safe 형식으로 변환
    const apiKey = urlEncode(
      sodium.to_base64(
        keyPair.publicKey,
        sodium.base64_variants.URLSAFE_NO_PADDING
      )
    )
    const secretKey = urlEncode(
      sodium.to_base64(
        keyPair.privateKey,
        sodium.base64_variants.URLSAFE_NO_PADDING
      )
    )

    return { apiKey, secretKey }
  }
}

// URL-safe Base64 변환
function urlEncode(base64Key: string): string {
  return base64Key.replace(/=+$/g, '') // '=' 제거
}
