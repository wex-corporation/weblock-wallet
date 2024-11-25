const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const packageDirMap = {
  '@wefunding-dev/wallet-types': 'types',
  '@wefunding-dev/wallet-core': 'core',
  '@wefunding-dev/wallet-sdk': 'sdk'
}

const rootPath = path.resolve(__dirname, '..')

function updateDependenciesAndVersion(packageDir) {
  const packageJsonPath = path.join(rootPath, packageDir, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))

  // 최신 버전 의존성 업데이트
  const updateFields = ['dependencies', 'devDependencies']
  updateFields.forEach((field) => {
    if (packageJson[field]) {
      for (const [key, value] of Object.entries(packageJson[field])) {
        if (value.startsWith('workspace:*')) {
          const latestVersion = execSync(`npm show ${key} version`, {
            encoding: 'utf-8'
          }).trim()
          console.log(
            `Updating ${key} in ${packageDir}: workspace:* -> ^${latestVersion}`
          )
          packageJson[field][key] = `^${latestVersion}`
        }
      }
    }
  })

  // 패키지 버전 업데이트
  const currentVersion = packageJson.version
  const [major, minor, patch] = currentVersion.split('.').map(Number)
  const newVersion = `${major}.${minor}.${patch + 1}`
  console.log(
    `Updating ${packageDir} version: ${currentVersion} -> ${newVersion}`
  )
  packageJson.version = newVersion

  // 변경된 package.json 저장
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
  console.log(`Updated dependencies and version in ${packageDir}/package.json`)
}

// 각 패키지의 의존성과 버전 업데이트
Object.values(packageDirMap).forEach(updateDependenciesAndVersion)
