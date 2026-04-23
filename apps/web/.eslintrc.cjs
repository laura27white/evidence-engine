/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['../../.eslintrc.cjs', 'next/core-web-vitals'],
  rules: {
    // Next.js Link handles href typing; keep default a11y rules in place.
  },
};
