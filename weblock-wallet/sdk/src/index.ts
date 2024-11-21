// Core 및 Types 패키지와의 연결
import { Core } from '@weblock-wallet/core'
import { Blockchain, Wallet } from '@weblock-wallet/types'

// SDK에서 Core를 래핑한 클래스
export class CoreAdapter {
  private coreInstance: Core

  constructor() {
    this.coreInstance = new Core()
  }

  // 간단한 예제 메서드
  getWallet(): Wallet | null {
    return this.coreInstance.getWallet()
  }

  getBlockchains(): Blockchain[] {
    return this.coreInstance.getBlockchains()
  }
}

// 주요 타입 export (의존성 연결만)
export { Blockchain, Wallet }
