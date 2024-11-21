# Weblock Wallet SDK

Weblock Wallet SDK는 Web3 애플리케이션을 손쉽게 구축할 수 있도록 지원하는 TypeScript 기반 SDK입니다. 이 SDK는 사용자 인증, 블록체인 및 토큰 관리, 지갑 생성 및 관리 등의 기능을 제공합니다.

## 시작하기

### 설치

Weblock Wallet SDK를 설치하려면, `@weblock-wallet/sdk` 패키지와 해당 타입 패키지를 설치합니다.

```bash
# SDK 및 타입 패키지 설치
pnpm install @weblock-wallet/sdk @weblock-wallet/types
```

### 초기화

SDK를 사용하려면 우선 Core 인스턴스를 초기화해야 합니다. 이를 통해 Weblock Wallet SDK의 기능을 사용할 수 있습니다.

```typescript
import { CoreAdapter } from '@weblock-wallet/sdk'

const core = new CoreAdapter({
  env: 'dev', // 사용 환경: 'dev', 'stage', 'prod' 중 하나
  apiKey: 'YOUR_API_KEY', // 발급받은 API Key
  orgHost: 'your-org-host' // 조직 호스트 이름
})
```

## 주요 기능

Weblock Wallet SDK는 다음과 같은 주요 기능을 제공합니다.

### 사용자 인증

- Google OAuth를 통한 로그인/로그아웃 기능을 제공합니다.

```typescript
await core.signInWithGoogle()
await core.signOut()
```

### 지갑 관리

- 지갑의 잔액 조회, 거래 전송 등의 기능을 제공합니다.

```typescript
// 잔액 조회
const balance = await core.getBalance(chainId)

// 거래 전송
await core.sendTransaction(chainId, {
  amount: '0.1',
  to: '0xRecipientAddress',
  coin: { symbol: 'ETH', decimals: 18 }
})
```

## 문서 개요

추가적인 사용법 및 API에 대한 상세한 정보는 아래 문서에서 확인할 수 있습니다.

- **[빠른 시작](getting-started.md)**: 설치 및 기본 설정 가이드.
- **[API 참조](api-reference.md)**: 각 함수와 메서드에 대한 상세한 API 참조 문서.

## 도움말

더 많은 정보가 필요하거나, 문의 사항이 있는 경우, 공식 문서와 지원 팀을 참고하십시오.
