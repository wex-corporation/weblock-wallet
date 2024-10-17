import { useState, useEffect } from 'react';
import { AlWalletSDK } from '@alwallet/sdk';  // SDK 임포트

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);  // 로그인 상태
  const [userPassword, setUserPassword] = useState<string>('');  // 사용자 비밀번호 입력값
  const [walletRecovered, setWalletRecovered] = useState<boolean>(false);  // 지갑 복구 여부
  const [balance, setBalance] = useState<string | null>(null);  // 잔액 상태
  const [error, setError] = useState<string | null>(null);  // 에러 상태
  const [sdk, setSdk] = useState<AlWalletSDK | null>(null);  // SDK 인스턴스

  useEffect(() => {
    // SDK 초기화 및 로그인 상태 확인
    const initializeSDK = async () => {
      try {
        const alWalletSdk = new AlWalletSDK({
          env: 'local',  // 환경 설정 (local, dev, stage, prod)
          apiKey: 'MCowBQYDK2VwAyEASXmv-39yF5Wx1vX9lPuP7_9qgWVeGXMdAWr-TKalKMw=',  // 임시 API 키
          orgHost: 'http://localhost:3000',  // 조직 호스트 설정
        });
        setSdk(alWalletSdk);
        console.log(`🚀 AlWalletSDK 초기화: local 환경`);

        // 로그인 상태 확인
        const loggedIn = await alWalletSdk.auth.isLoggedIn();
        setIsLoggedIn(loggedIn);
      } catch (e) {
        setError(`SDK 초기화 중 오류가 발생했습니다: ${(e as Error).message}`);
      }
    };

    initializeSDK();
  }, []);

  // Google 로그인 핸들러
  const handleGoogleLogin = async () => {
    if (!sdk) return;

    try {
      await sdk.auth.signInWithGoogle();
      setIsLoggedIn(true);
      setError(null);  // 에러 초기화
    } catch (e) {
      setError(`로그인 실패: ${(e as Error).message}`);
    }
  };

  // 지갑 복구 핸들러
  const handleWalletRecovery = async () => {
    if (!sdk || !userPassword) {
      setError('비밀번호를 입력해주세요');
      return;
    }

    try {
      await sdk.wallets.retrieveWallet(userPassword);  // 비밀번호로 지갑 복구
      setWalletRecovered(true);
      setError(null);  // 에러 초기화

      // 복구된 지갑의 잔액을 조회
      const chainId = 1;  // 예시로 Ethereum 메인넷(1) 체인 아이디 사용
      const balance = await sdk.wallets.getBalance(chainId);
      setBalance(balance);
    } catch (e) {
      setError(`지갑 복구 실패: ${(e as Error).message}`);
    }
  };

  // 잔액 조회 핸들러
  const handleCheckBalance = async () => {
    if (!sdk) return;

    try {
      const chainId = 1;  // 예시로 Ethereum 메인넷 체인 ID
      const balance = await sdk.wallets.getBalance(chainId);
      setBalance(balance);
      setError(null);
    } catch (e) {
      setError(`잔액 조회 실패: ${(e as Error).message}`);
    }
  };

  // 로그아웃 핸들러
  const handleLogout = async () => {
    if (!sdk) return;

    try {
      await sdk.auth.signOut();
      setIsLoggedIn(false);
      setWalletRecovered(false);
      setError(null);  // 에러 초기화
    } catch (e) {
      setError(`로그아웃 실패: ${(e as Error).message}`);
    }
  };

  return (
    <div className="App">
      <h1>AlWallet SDK Example</h1>

      {/* 로그인 상태에 따른 UI */}
      {isLoggedIn === null ? (
        <p>로그인 상태 확인 중...</p>
      ) : isLoggedIn ? (
        <div>
          <p>로그인 되었습니다!</p>

          {/* 지갑 복구 여부에 따른 UI */}
          {walletRecovered ? (
            <div>
              <p>지갑이 복구되었습니다! 🎉</p>
              <p>잔액: {balance} ETH</p>
              <button onClick={handleCheckBalance}>잔액 다시 조회</button>
              <button onClick={handleLogout}>로그아웃</button>
            </div>
          ) : (
            <div>
              <label>
                비밀번호: {' '}
                <input
                  type="password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                />
              </label>
              <button onClick={handleWalletRecovery}>지갑 복구</button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <button onClick={handleGoogleLogin}>Google 로그인</button>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default App;
