/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,           // Allows us to use describe/it/expect without importing them in every file
    environment: 'jsdom',    // Tells Vitest to use the simulated browser environment
    setupFiles: './src/setupTests.ts', // A file that runs before our tests start
  },
})

