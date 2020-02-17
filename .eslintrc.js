const { overrides, ...all } = require('@nice-move/eslint-config-react');

overrides[0].files = 'packages/**/*.jsx';
overrides[1].files = 'packages/**';

module.exports = {
  root: true,
  ...all,
  overrides
};
