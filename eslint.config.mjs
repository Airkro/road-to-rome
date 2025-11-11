import base from '@nice-move/all-in-base/eslint';

export default [
  ...base,
  {
    files: ['test/fixture/**'],
    rules: {
      'unicorn/no-empty-file': 'off',
    },
  },
];
