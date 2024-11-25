const fs = require('fs')
const path = require('path')

// 대상 패키지 목록
const packages = ['types', 'core', 'sdk']

// 대체 작업: 버전을 다시 workspace:*로 변경
function revertDependencies(pkgDir) {
  const pkgPath = path.resolve(pkgDir, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))

  ;['dependencies', 'devDependencies'].forEach((depType) => {
    if (pkg[depType]) {
      Object.keys(pkg[depType]).forEach((dep) => {
        if (dep.startsWith('@wefunding-dev/')) {
          pkg[depType][dep] = 'workspace:*'
          console.log(`Reverted ${dep} to workspace:* in ${pkgDir}`)
        }
      })
    }
  })

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
  console.log(`Updated dependencies in ${pkgDir}/package.json`)
}

// 각 패키지 처리
packages.forEach((pkg) => {
  revertDependencies(path.resolve(__dirname, '../', pkg))
})
