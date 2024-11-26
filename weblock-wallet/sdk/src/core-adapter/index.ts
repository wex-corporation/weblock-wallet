import { Core } from '@wefunding-dev/wallet-core'

export class CoreAdapter {
  private core: Core

  constructor(apiKey: string, env: string, orgHost?: string) {
    this.core = new Core()
  }

  // TODO: Core와의 연결 메서드 추가
}
