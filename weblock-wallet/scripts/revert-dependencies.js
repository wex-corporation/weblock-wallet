const fs = require('fs')
const path = require('path')

const packages = ['types', 'core', 'sdk']

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
  console.log(`Reverted dependencies in ${pkgDir}/package.json`)
}

packages.forEach((pkg) => {
  revertDependencies(path.resolve(__dirname, '../', pkg))
})
