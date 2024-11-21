// 의존성 모듈 import
import { Blockchain, Wallet } from '@weblock-wallet/types'

// 주요 클래스 및 설정 export
export class Core {
  private readonly blockchains: Blockchain[] = []
  private readonly wallet: Wallet | null = null

  // 간단한 예제 메서드
  getWallet(): Wallet | null {
    return this.wallet
  }

  getBlockchains(): Blockchain[] {
    return this.blockchains
  }
}

// 주요 타입 재정의 export (의존성 연결만)
export { Blockchain, Wallet }
