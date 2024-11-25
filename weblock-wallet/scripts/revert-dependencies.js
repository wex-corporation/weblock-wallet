const fs = require('fs')
const path = require('path')

// 대상 패키지 목록
const packages = ['types', 'core', 'sdk']

// 의존성 되돌리기 함수
function revertDependencies(pkgDir) {
  const pkgPath = path.resolve(pkgDir, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))

  let isReverted = false // 변경 여부 확인
  ;['dependencies', 'devDependencies'].forEach((depType) => {
    if (pkg[depType]) {
      Object.keys(pkg[depType]).forEach((dep) => {
        if (dep.startsWith('@wefunding-dev/')) {
          if (pkg[depType][dep] !== 'workspace:*') {
            pkg[depType][dep] = 'workspace:*'
            console.log(`Reverted ${dep} to workspace:* in ${pkgDir}`)
            isReverted = true
          }
        }
      })
    }
  })

  if (isReverted) {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
    console.log(`Updated dependencies in ${pkgDir}/package.json`)
  } else {
    console.log(`No changes made to ${pkgDir}/package.json`)
  }
}

// 각 패키지 처리
packages.forEach((pkg) => {
  revertDependencies(path.resolve(__dirname, '../', pkg))
})
