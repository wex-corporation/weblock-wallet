# WeBlock SDK Sample

WeBlock SDK를 테스트하기 위한 샘플 프로젝트입니다.

## 프로젝트 구조

```
.
├── server/     # 백엔드 서버
├── client/     # SDK 코어
└── sample/     # 테스트용 Next.js 프로젝트
```

## 시작하기

### 1. 서버 실행

```bash
cd server
docker-compose down -v --rmi all  # 기존 컨테이너 정리 (필요시)
./run-wallet-script.sh           # 빌드 및 서버 실행
```

### 2. SDK 빌드 및 링크

```bash
cd ../client
npm install
npm run build
npm link
```

### 3. 샘플 프로젝트 실행

```bash
cd ../sample
npm install
npm link @weblock-wallet/sdk
npm run dev
```

---

# 사용예시

### 1. SDK 초기화

SDK 인스턴스를 생성하고 초기화합니다.

```typescript
import { WeBlockSDK } from "@weblock/sdk";

// SDK 인스턴스 생성
const sdk = new WeBlockSDK({
  environment: "local",
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  orgHost: process.env.NEXT_PUBLIC_API_HOST,
});

// 초기화 상태 확인
const isInitialized = await sdk.isInitialized();
if (!isInitialized) {
  throw new Error("SDK initialization failed");
}
```

### 2. 사용자 인증

#### SignInResponse

로그인 응답 인터페이스입니다.

```typescript
interface SignInResponse {
  status: SignInStatus; // 'NEW_USER' | 'NEEDS_PASSWORD' | 'WALLET_READY'
  email: string; // 사용자 이메일
  photoURL?: string; // 프로필 사진 URL
  wallet?: WalletInfo; // 지갑 정보 (WALLET_READY 상태일 때만)
}
```

Google 로그인을 통한 사용자 인증 예시

```typescript
// 로그인 핸들러
const handleSignIn = async () => {
  try {
    const result = await sdk.user.signIn("google.com");

    switch (result.status) {
      case SignInStatus.NEW_USER:
        // 신규 사용자: 지갑 생성 필요
        setStatus("NEW_USER");
        break;

      case SignInStatus.NEEDS_PASSWORD:
        // 기존 사용자: 지갑 복구 필요
        setStatus("NEEDS_PASSWORD");
        break;

      case SignInStatus.WALLET_READY:
        // 지갑 준비 완료
        setWalletAddress(result.wallet.address);
        setStatus("WALLET_READY");
        break;
    }

    // 사용자 정보 저장
    setUserEmail(result.email);
    setUserPhoto(result.photoURL);
  } catch (error) {
    console.error("Sign in failed:", error);
    setError(error instanceof Error ? error.message : "Unknown error");
  }
};

// UI 컴포넌트
{
  status === "INIT" && (
    <button
      onClick={handleSignIn}
      className="bg-blue-500 text-white px-4 py-2 rounded"
    >
      Sign in with Google
    </button>
  );
}
```
