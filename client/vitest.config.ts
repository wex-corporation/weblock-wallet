import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Mirror the tsconfig "@/*" -> "src/*" path mapping so vitest can resolve the
// alias the same way tsup/tsc do. Without this, any test that transitively
// imports a module using "@/..." fails to load.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
