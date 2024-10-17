# AlWallet SDK

**AlWallet SDK**는 지갑 관리, 인증, 블록체인 및 토큰 관리를 위한 기능을 제공하는 TypeScript 기반 SDK입니다. 이 SDK는 `Auth`, `Wallets`, `Tokens`, `Blockchains` 모듈을 포함하며, 각 모듈은 해당 기능을 담당합니다.

## 주요 기능

- **Auth**: Google 인증을 통한 로그인 및 로그아웃 기능
- **Wallets**: 지갑 생성, 복구, 잔액 조회 및 트랜잭션 전송
- **Tokens**: ERC20 토큰 등록 및 관리
- **Blockchains**: 블록체인 네트워크 등록 및 관리

## 설치 및 초기화

이 섹션에서는 샘플 프로젝트에서 **AlWallet SDK**를 어떻게 설치하고 초기화할 수 있는지 설명합니다. pnpm을 사용해 SDK를 워크스페이스 형태로 설치한 후 초기화하는 과정을 설명합니다.

1. 패키지 의존성 설치
먼저, @alwallet/sdk 패키지를 프로젝트에 workspace로 추가합니다. 이를 위해 pnpm 패키지 매니저를 사용합니다.

프로젝트 루트 디렉토리에서 package.json 파일에 다음과 같이 dependencies를 설정하고, 설치해주세요.
```json
...
  "dependencies": {
    "@alwallet/sdk": "workspace:^"
  },
...

```
```bash
pnpm install
```

2. SDK 초기화
**AlWallet SDK**를 초기화하려면 다음 코드를 src/App.tsx에 추가하세요.
```tsx
import { useEffect, useState } from 'react';
import { AlWalletSDK } from '@alwallet/sdk';  // SDK 임포트

function App() {
  const [sdk, setSdk] = useState<AlWalletSDK | null>(null);

  // SDK 초기화
  useEffect(() => {
    const sdkInstance = new AlWalletSDK({
      env: 'local',  // 환경 설정: 'local', 'dev', 'stage', 'prod'
      apiKey: 'YOUR_API_KEY',  // 발급받은 API 키
      orgHost: 'http://localhost:3000'  // 조직 호스트 설정
    });

    setSdk(sdkInstance);
  }, []);

  return (
    <div>
      <h1>AlWallet SDK Example</h1>
      {sdk ? <p>SDK 초기화 성공!</p> : <p>SDK 초기화 중...</p>}
    </div>
  );
}

export default App;
```
---
이 코드에서는 **SDK 초기화**가 간단하게 이루어집니다. 초기화가 완료되면 **SDK 초기화 성공!** 메시지가 표시됩니다.

3. 개발 서버 실행
이제 프로젝트의 개발 서버를 실행하여 SDK 초기화 상태를 확인할 수 있습니다. 다음 명령어로 서버를 시작하세요:
```bash
pnpm dev
```
---

---
## 🔑 Auth 모듈 사용법

**Auth** 모듈은 **사용자 인증** 및 **로그인**/**로그아웃** 기능을 제공합니다. 이를 통해 사용자 인증을 관리할 수 있으며, 다양한 인증 공급자를 통해 손쉽게 로그인할 수 있습니다.

### 1. Google 로그인 예제

구글 로그인을 사용하는 방법을 아래와 같이 설명할 수 있습니다.

```tsx
import { useState } from 'react';
import { AlWalletSDK } from '@alwallet/sdk'; // SDK 임포트

function App() {
  const sdk = new AlWalletSDK({
    env: 'local',  // 환경 설정
    apiKey: 'YOUR_API_KEY',  // API 키
    orgHost: 'http://localhost:3000'  // 조직 호스트 설정
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Google 로그인 핸들러
  const handleGoogleLogin = async () => {
    try {
      await sdk.auth.signInWithGoogle();
      setIsLoggedIn(true);
    } catch (e) {
      console.error('로그인 실패:', e);
    }
  };

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await sdk.auth.signOut();
      setIsLoggedIn(false);
    } catch (e) {
      console.error('로그아웃 실패:', e);
    }
  };

  return (
    <div>
      <h1>Auth Example</h1>
      {isLoggedIn ? (
        <div>
          <p>로그인 완료</p>
          <button onClick={handleLogout}>로그아웃</button>
        </div>
      ) : (
        <button onClick={handleGoogleLogin}>Google 로그인</button>
      )}
    </div>
  );
}

export default App;
```
### 주요 메서드
* `signInWithGoogle()` 
  * Google OAuth 인증을 통해 로그인을 처리합니다.
* `signOut()`
  * 현재 로그인한 사용자를 로그아웃 합니다드

### 2. 로그인 상태 확인
사용자가 현재 로그인 상태인지 확인하는 방법도 제공됩니다. `isLoggedIn()` 메서드를 호출하여 이를 쉽게 체크할 수 있습니다.
```tsx
useEffect(() => {
  const checkLoginStatus = async () => {
    const isLoggedIn = await sdk.auth.isLoggedIn();
    setIsLoggedIn(isLoggedIn);
  };

  checkLoginStatus();
}, []);
```

---
---
## 💼 Wallets 모듈 사용법

**Wallets** 모듈은 **지갑 생성**, **지갑 복구** 및 **잔액 조회** 기능을 제공합니다.

### 1. 지갑 생성 및 복구

사용자가 비밀번호를 입력하여 새로운 지갑을 생성하거나 복구할 수 있습니다.

```tsx
import { useState } from 'react';
import { AlWalletSDK } from '@alwallet/sdk'; // SDK 임포트

function App() {
    const sdk = new AlWalletSDK({
        env: 'local',  // 환경 설정
        apiKey: 'YOUR_API_KEY',  // API 키
        orgHost: 'http://localhost:3000'  // 조직 호스트 설정
    });

    const [userPassword, setUserPassword] = useState<string>('');  // 사용자 비밀번호
    const [walletRecovered, setWalletRecovered] = useState<boolean>(false);  // 지갑 복구 여부

    // 지갑 생성 핸들러
    const handleCreateWallet = async () => {
        try {
            await sdk.wallets.createWallet(userPassword);
            alert('지갑이 성공적으로 생성되었습니다!');
        } catch (e) {
            console.error('지갑 생성 실패:', e);
        }
    };

    // 지갑 복구 핸들러
    const handleRetrieveWallet = async () => {
        try {
            await sdk.wallets.retrieveWallet(userPassword);
            setWalletRecovered(true);
            alert('지갑이 성공적으로 복구되었습니다!');
        } catch (e) {
            console.error('지갑 복구 실패:', e);
        }
    };

    return (
        <div>
            <h1>Wallets Example</h1>
            <input
                type="password"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                placeholder="비밀번호 입력"
            />
            <button onClick={handleCreateWallet}>지갑 생성</button>
            <button onClick={handleRetrieveWallet}>지갑 복구</button>

            {walletRecovered && <p>지갑 복구 완료!</p>}
        </div>
    );
}

export default App;
```
### 주요 메서드
* `createWallet(userPassword: string)` 
  * 사용자가 입력한 비밀번호를 이용하여 새 지갑을 생성합니다.
* `retrieveWallet(userPassword: string)`
  * 사용자가 입력한 비밀번호를 이용하여 기존 지갑을 복구합니다.

### 2. 잔액 조회
지갑을 복구한 후, 특정 블록체인의 잔액을 조회할 수 있습니다.
```tsx
useEffect(() => {
    const checkBalance = async () => {
        try {
            const balance = await sdk.wallets.getBalance(1);  // 예시로 Chain ID 1 (Ethereum Mainnet)
            console.log(`잔액: ${balance}`);
        } catch (e) {
            console.error('잔액 조회 실패:', e);
        }
    };

    checkBalance();
}, []);
```
---
---
