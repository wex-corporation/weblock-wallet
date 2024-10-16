import { useEffect, useState } from 'react';
import { AlWalletSDK } from '@alwallet/sdk'; // SDK 임포트

function App() {
  const sdk = new AlWalletSDK({
    env: 'local', // 'local', 'dev', 'stage', 'prod' 중 선택
    apiKey: 'MCowBQYDK2VwAyEASXmv-39yF5Wx1vX9lPuP7_9qgWVeGXMdAWr-TKalKMw=', // 임시 API 키
    orgHost: 'http://localhost:3000' // 조직 호스트 설정
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userPassword, setUserPassword] = useState<string>(''); // 비밀번호 입력값
  const [walletRecovered, setWalletRecovered] = useState<boolean>(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 컴포넌트가 마운트될 때 로그인 상태를 확인합니다.
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const loggedIn = await sdk.auth.isLoggedIn();
        setIsLoggedIn(loggedIn);
      } catch (e) {
        setError(`로그인 상태 확인 오류: ${(e as Error).message}`);
      }
    };
    checkLoginStatus();
  }, [sdk]);

  // Google 로그인 핸들러
  const handleGoogleLogin = async () => {
    try {
      await sdk.auth.signInWithGoogle();
      setIsLoggedIn(true);
      setError(null); // 에러 초기화
      setIsPasswordModalOpen(true); // 비밀번호 모달 열기
    } catch (e) {
      setError(`로그인 실패: ${(e as Error).message}`);
    }
  };

  // 지갑 복구 핸들러
  const handleWalletRecovery = async () => {
    try {
      if (!userPassword) {
        setError('비밀번호를 입력해주세요');
        return;
      }
      await sdk.wallets.retrieveWallet(userPassword); // 비밀번호로 지갑 복구
      setWalletRecovered(true);
      setError(null); // 에러 초기화
      setIsPasswordModalOpen(false); // 비밀번호 모달 닫기
    } catch (e) {
      setError(`지갑 복구 실패: ${(e as Error).message}`);
    }
  };

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await sdk.auth.signOut();
      setIsLoggedIn(false);
      setWalletRecovered(false);
      setError(null); // 에러 초기화
    } catch (e) {
      setError(`로그아웃 실패: ${(e as Error).message}`);
    }
  };

  return (
    <div className="App">
      <h1>AlWallet SDK Example</h1>

      {/* 로그인 상태에 따라 UI 변경 */}
      {isLoggedIn === null ? (
        <p>로그인 상태 확인 중...</p>
      ) : isLoggedIn ? (
        <div>
          <p>로그인 되었습니다!</p>
          {walletRecovered ? (
            <p>지갑이 복구되었습니다! 🎉</p>
          ) : (
            <div>
              {isPasswordModalOpen && (
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
          )}
          <button onClick={handleLogout}>로그아웃</button>
        </div>
      ) : (
        <button onClick={handleGoogleLogin}>Google 로그인</button>
      )}

      {/* 에러가 발생한 경우 */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default App;
