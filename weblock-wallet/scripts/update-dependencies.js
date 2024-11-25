const fs = require('fs')
const path = require('path')

// 패키지 이름과 디렉토리 이름의 매핑
const packageDirMap = {
  '@wefunding-dev/wallet-types': 'types',
  '@wefunding-dev/wallet-core': 'core',
  '@wefunding-dev/wallet-sdk': 'sdk'
}

const rootPath = path.resolve(__dirname, '..')

// 의존성 업데이트 함수
function updateDependencies(packageDir) {
  const packageJsonPath = path.join(rootPath, packageDir, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))

  const updateFields = ['dependencies', 'devDependencies']
  updateFields.forEach((field) => {
    if (packageJson[field]) {
      for (const [key, value] of Object.entries(packageJson[field])) {
        if (value.startsWith('workspace:*')) {
          // 매핑된 디렉토리로 이동
          const dependencyDir = packageDirMap[key]
          if (!dependencyDir) {
            console.error(`Error: No directory mapping for ${key}`)
            continue
          }

          const dependencyPackagePath = path.join(
            rootPath,
            dependencyDir,
            'package.json'
          )
          const dependencyPackageJson = JSON.parse(
            fs.readFileSync(dependencyPackagePath, 'utf-8')
          )
          const dependencyVersion = dependencyPackageJson.version

          console.log(
            `Updating ${key} in ${packageDir}: workspace:* -> ${dependencyVersion}`
          )
          packageJson[field][key] = dependencyVersion
        }
      }
    }
  })

  // 변경된 package.json 저장
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
  console.log(`Updated dependencies in ${packageDir}/package.json`)
}

// 각 패키지의 의존성을 업데이트
Object.values(packageDirMap).forEach(updateDependencies)
