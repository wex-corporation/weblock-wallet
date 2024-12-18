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
cd client
npm install
npm run build
npm link
```

### 3. 샘플 프로젝트 실행

```bash
cd sample
npm install
npm link @weblock-wallet/sdk
npm run dev
```

## 테스트

브라우저에서 http://localhost:3000 접속 후 "Sign in with Google" 버튼을 클릭하여 테스트할 수 있습니다. 콘솔 확인해주세요.
