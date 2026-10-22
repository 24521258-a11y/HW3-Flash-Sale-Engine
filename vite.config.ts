
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],

  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(
          new URL('./index.html', import.meta.url)
        ),
        stressTest: fileURLToPath(
          new URL('./stress-test.html', import.meta.url)
        ),
        unitTests: fileURLToPath(
          new URL('./unit-tests.html', import.meta.url)
        ),
      },
    },
  },
})
