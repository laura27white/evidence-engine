import { defineConfig } from 'vitest/config';

// Target coverage for this package: 70 percent.
// Thresholds start at 0 so the empty bootstrap coverage run passes.
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['app/**/*.{test,spec}.{ts,tsx}', 'lib/**/*.{test,spec}.ts'],
    exclude: ['node_modules', '.next', 'e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['app/**/*.{ts,tsx}', 'lib/**/*.ts'],
      exclude: [
        '**/*.{test,spec}.{ts,tsx}',
        'app/**/layout.tsx',
        'app/**/page.tsx',
        'lib/observability.ts',
      ],
      thresholds: {
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0,
      },
    },
  },
});
