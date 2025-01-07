import fs from 'fs'

// 원본 package.json 읽기
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'))

// npm 배포용 설정
const npmConfig = {
  ...packageJson,
  name: '@weblock-wallet/sdk',
  publishConfig: {
    access: 'public',
  },
}

// repository 필드 제거
delete npmConfig.repository
delete npmConfig.publishConfig.registry

// 수정된 package.json 저장
fs.writeFileSync('./package.json', JSON.stringify(npmConfig, null, 2))
