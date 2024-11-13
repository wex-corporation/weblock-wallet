# Weblock Wallet SDK

`@weblock-wallet/sdk`는 Weblock Wallet을 활용해 DApp을 쉽게 개발할 수 있도록 지원하는 SDK입니다. 블록체인 관리, 인증, 트랜잭션 처리 등의 기능을 제공합니다.

## 설치

```bash
npm install @weblock-wallet/sdk
```

## 초기화

```typescript
import CoreAdapter from '@weblock-wallet/sdk'

const config = {
  env: 'dev',
  apiKey: 'YOUR_API_KEY',
  orgHost: 'https://your-organization-host.com'
}

const core = new CoreAdapter(config)
```

## 주요 기능

### 1. 인증 (Auth)

- **Google 로그인**: `signInWithGoogle`
- **로그아웃**: `signOut`

```typescript
await core.signInWithGoogle()
await core.signOut()
```

### 2. 블록체인 관리 (Blockchain)

- **블록체인 등록**: `registerBlockchain`
- **블록체인 조회**: `getBlockchainInfo`

```typescript
await core.registerBlockchain({ name: 'Ethereum', ... });
const blockchainInfo = await core.getBlockchainInfo(chainId);
```

### 3. 지갑 관리 (Wallet)

- **지갑 생성**: `createWallet`
- **잔액 조회**: `getBalance`

```typescript
await core.createWallet(password)
const balance = await core.getBalance(chainId)
```
