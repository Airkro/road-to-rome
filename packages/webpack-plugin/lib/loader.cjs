'use strict';

const { pathParser } = require('./lib.cjs');
const { fileFinder } = require('./file-finder.mjs');

module.exports = function loader(_, map, meta) {
  this.cacheable(false);

  const logger = this._compiler.getInfrastructureLogger('road-to-rome');

  const { globs, depth, filter } = this.getOptions();

  const cwd = this.rootContext;

  const callback = this.async();

  fileFinder({ cwd, globs, depth })
    .then((paths) => pathParser({ cwd, globs, paths, filter }))
    .then(({ result, routes }) => {
      logger.info('Generate', routes.length, 'routes automatically');

      callback(null, result, map, meta);
    })
    .catch((error) => {
      callback(error);
    });
};
