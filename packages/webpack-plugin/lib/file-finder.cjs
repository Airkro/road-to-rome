'use strict';

const globby = require('globby');

module.exports = {
  fileFinder({ cwd, globs, depth = 10 }) {
    return globby(globs, {
      cwd,
      deep: depth,
      onlyFiles: true,
      gitignore: true,
    });
  },
};
