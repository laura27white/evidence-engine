/**
 * Vitest setup.
 *
 * Adds @testing-library/jest-dom matchers to expect() and ensures the DOM is cleaned up
 * between tests.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
afterEach(() => {
    cleanup();
});
//# sourceMappingURL=setup.js.map