import { defineConfig } from 'vitest/config';

// Target coverage for this package: 70 percent per ARCHITECTURE.md section 7.4.
// Thresholds bumped from the Prompt 0 bootstrap value of 0 now that real code lands.
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'src/**/*.{test,spec}.ts',
      '__tests__/**/*.{test,spec}.ts',
      'scripts/**/*.{test,spec}.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts', 'scripts/**/*.ts'],
      exclude: [
        'src/**/*.{test,spec}.ts',
        'src/index.ts',
        'scripts/import-hpo.ts',
        'scripts/seed-drift-measurements.ts',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
});
