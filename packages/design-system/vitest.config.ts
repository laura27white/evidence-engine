import { defineConfig } from 'vitest/config';

/**
 * Coverage target for this package: 60 percent per ARCHITECTURE.md section 7.4.
 * Visual regression via Chromatic is the primary guarantee for rendered output; unit
 * tests focus on behaviour and accessibility affordances.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}', 'tokens/**/*.ts'],
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/**/__tests__/**',
        'src/**/*.stories.tsx',
        'src/**/*.mdx',
        'src/index.ts',
        'src/**/index.ts',
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 60,
        statements: 60,
      },
    },
  },
});
