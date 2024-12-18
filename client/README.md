# 초기화

```typescript
import WeBlockSDK from '@weblock-wallet/sdk'
const sdk = new WeBlockSDK({
  environment: 'dev', // 'local' | 'dev' | 'stage' | 'prod'
  apiKey: 'YOUR_API_KEY',
  orgHost: 'YOUR_ORG_HOST',
})
```

# 기능명세

## 1. 사용자(sdk.user)

### 로그인

```typescript
const response = await sdk.user.signIn('google.com')
// response: SignInResponse
// {
// status: 'NEW_USER' | 'WALLET_READY' | 'NEEDS_PASSWORD'
// email: string
// photoURL: string | null
// wallet?: WalletInfo // WALLET_READY 상태일 때만
// }
```

### 지갑 생성

```typescript
const response = await sdk.user.createWallet('password')
// response: { wallet: WalletInfo }
```

### 지갑 복구

```typescript
const response = await sdk.user.recoverWallet('password')
// response: { wallet: WalletInfo }
```

### 로그아웃

```typescript
await sdk.user.signOut()
```

## 2. 지갑(sdk.wallet)

### 지갑 정보 조회

```typescript
const info = await sdk.wallet.getInfo()
// WalletInfo {
// address: string
// network: {
// current: NetworkInfo
// available: NetworkInfo[]
// }
// assets: {
// native: {
// symbol: string
// balance: string
// decimals: number
// usdValue?: string
// }
// tokens: TokenInfo[]
// nfts: NFTCollection[]
// }
// recentTransactions: Transaction[]
// }
```

### 네트워크 변경

```typescript
const response = await sdk.wallet.switchNetwork('ethereum-mainnet')
// response: {
// network: NetworkInfo
// assets: WalletInfo['assets']
// }
```

### 이벤트 구독

```typescript
// 지갑 정보 업데이트
const unsubscribe = sdk.wallet.onWalletUpdate((wallet: WalletInfo) => {
  console.log('지갑 업데이트:', wallet)
})
// 트랜잭션 업데이트
const unsubscribeTx = sdk.wallet.onTransactionUpdate((tx: Transaction) => {
  console.log('새로운 트랜잭션:', tx)
})
```

## 3. 자산(sdk.asset)

### 토큰 전송

```typescript
const response = await sdk.asset.transfer({
  networkId: 'ethereum-mainnet',
  tokenAddress: '0x...', // NATIVE인 경우 필요 없음
  to: '0x...',
  amount: '1.0',
  type: 'NATIVE' | 'ERC20' | 'NFT' | 'SECURITY',
})
// response: { transaction: Transaction }
```

### 토큰 추가

```typescript
await sdk.asset.addToken({
type: 'ERC20' | 'SECURITY',
networkId: 'ethereum-mainnet',
address: '0x...',
symbol?: 'TOKEN',
decimals?: 18,
name?: 'Token Name'
})
```

### NFT 컬렉션 추가

```typescript
await sdk.asset.addNFTCollection({
networkId: 'ethereum-mainnet',
address: '0x...',
name?: 'NFT Collection'
})
```

### 시큐리티 토큰 전송 가능 여부 확인

```typescript
const result = await sdk.asset.checkSecurityTokenCompliance({
  networkId: 'ethereum-mainnet',
  tokenAddress: '0x...',
  from: '0x...',
  to: '0x...',
  amount: '1.0',
})
// result: {
// canTransfer: boolean
// reasons?: string[]
// }
```
