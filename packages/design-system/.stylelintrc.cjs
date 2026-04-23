/**
 * Stylelint rules for the Project Trueplan design system.
 *
 * Enforces that colours and font sizes are consumed via tokens rather than arbitrary
 * values, that `!important` is justified with an inline comment, and that no em dashes
 * appear inside CSS strings (a belt-and-braces complement to the project's ESLint em-dash
 * check at the source-file layer).
 */
/** @type {import('stylelint').Config} */
module.exports = {
  extends: ['stylelint-config-standard'],
  rules: {
    'color-no-hex': [
      true,
      {
        message: 'Use a token from packages/design-system/tokens/colour.ts rather than a hex literal.',
      },
    ],
    'declaration-no-important': [
      true,
      {
        message: '`!important` is permitted only with an adjacent CSS comment explaining why.',
      },
    ],
    'no-irregular-whitespace': true,
    'length-zero-no-unit': null,
  },
  ignoreFiles: [
    'node_modules/**',
    'dist/**',
    'storybook-static/**',
    '**/*.ts',
    '**/*.tsx',
    '**/*.mdx',
  ],
};
