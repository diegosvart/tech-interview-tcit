import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    reporters: ['default'],
    globals: true,
    include: ['tests/**/*.test.ts'],
    watchExclude: ['**/node_modules/**', '**/dist/**'],
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,
    pool: 'threads'
  }
});
