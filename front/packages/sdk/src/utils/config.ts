// src/utils/config.ts
import { WalletServerHttpClient } from '@alwallet/core/src/utils/httpClient'
import { getBaseUrls, getFirebaseConfig } from './env' // 환경별 설정 가져오기
import { FirebaseConfig } from '@alwallet/core/src/auth/firebase'

/**
 * 환경별 HttpClient와 Firebase 설정을 생성하는 함수
 * @param env 'local' | 'dev' | 'stage' | 'prod'
 * @param apiKey API 키
 * @param orgHost 조직 호스트 주소
 */
export const createHttpClient = (
  env: string,
  apiKey: string,
  orgHost: string
): { client: WalletServerHttpClient; firebaseConfig: FirebaseConfig } => {
  const baseUrl = getBaseUrls(env)
  const firebaseConfig = getFirebaseConfig(env)

  const client = new WalletServerHttpClient({ baseUrl }, apiKey, orgHost) // WalletServerHttpClient 생성

  return { client, firebaseConfig }
}
