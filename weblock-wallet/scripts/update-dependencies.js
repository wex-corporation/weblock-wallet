const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const packageDirMap = {
  '@wefunding-dev/wallet-types': 'types',
  '@wefunding-dev/wallet-core': 'core',
  '@wefunding-dev/wallet-sdk': 'sdk'
}

const rootPath = path.resolve(__dirname, '..')

function updateDependencies(packageDir) {
  const packageJsonPath = path.join(rootPath, packageDir, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))

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

  const currentVersion = packageJson.version
  const [major, minor, patch] = currentVersion.split('.').map(Number)
  const newVersion = `${major}.${minor}.${patch + 1}`
  console.log(
    `Updating ${packageDir} version: ${currentVersion} -> ${newVersion}`
  )
  packageJson.version = newVersion

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
  console.log(`Updated dependencies and version in ${packageDir}/package.json`)
}

Object.values(packageDirMap).forEach(updateDependencies)
