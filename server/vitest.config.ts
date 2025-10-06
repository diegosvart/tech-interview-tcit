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
    // Ejecutamos en un único hilo para evitar condiciones de carrera con el truncado global del DB.
    threads: false,
    // Fuerza a vitest a ejecutar todo en un único proceso (no workers separados)
    singleThread: true,
    setupFiles: ['tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'lcov'],
      thresholds: {
        lines: 0.7,
        branches: 0.6,
        functions: 0.7,
        statements: 0.7
      }
    },
    // Ejecutar archivos de test en serie para que el truncado global no borre datos
    sequence: {
      concurrent: false
    }
  }
});
