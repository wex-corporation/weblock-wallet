import { Core } from '@wefunding-dev/wallet-core'

export class CoreAdapter {
  private core: Core

  constructor(apiKey: string, env: string, orgHost?: string) {
    this.core = new Core('local', 'test-api-key', 'http://localhost:3000')
  }

  // TODO: Core와의 연결 메서드 추가
}
