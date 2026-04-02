import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/tasks/setupTest.ts',

    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      exclude: [
        'node_modules/**',
        'src/tasks/**',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'generated/**',
        'mock-server/**'
      ]
    }
  }
});