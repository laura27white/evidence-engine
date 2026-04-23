import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.{test,spec}.ts',
        'src/**/__tests__/**',
        'src/index.ts',
        'src/pda-client.ts',
      ],
      thresholds: { lines: 70, functions: 70, branches: 60, statements: 70 },
    },
  },
});
