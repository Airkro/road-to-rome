const VirtualModulesPlugin = require('webpack-virtual-modules');
const { validate } = require('schema-utils');
const { resolve } = require('path');

const {
  createCaller,
  createRoutes,
  createWatcher,
  mappers,
  placeholder,
} = require('./lib.cjs');
const schema = require('./schema.cjs');

const name = 'RoadToRomePlugin';

// eslint-disable-next-line consistent-return
function getLogger() {
  try {
    // eslint-disable-next-line import/no-unresolved
    return require('webpack-log')({ name: 'rtr' });
    // eslint-disable-next-line no-empty
  } catch {}
}

module.exports = class RoadToRomePlugin {
  constructor(options = {}) {
    validate(schema, options, { name });

    const {
      depth = 10,
      filter,
      mode = schema.properties.mode.enum[0],
      mapper = mappers[mode] || Object.values(mappers)[0],
      pagePath = 'src/pages',
    } = options;

    this.options = {
      deep: depth,
      mapper,
      filter,
      pagePath,
    };
  }

  inject(logger) {
    return createRoutes(this.options)
      .then(({ context, length }) => {
        logger.info('generate', length, 'routes automatically');
        this.plugin.writeModule(placeholder, context);
      })
      .catch((error) => {
        logger.error(error.message);
      });
  }

  startWatch(cwd, callback) {
    this.stopWatch();

    if (!this.watcher) {
      this.watcher = createWatcher({
        cwd,
        depth: this.depth,
        callback,
      });
    }
  }

  stopWatch() {
    if (this.watcher) {
      this.watcher.close();
    }
  }

  runOnWatching(logger, compiler) {
    const { setup, close } = createCaller();

    compiler.hooks.afterEnvironment.tap(name, () => {
      this.startWatch(this.options.cwd, () => {
        logger.info('Routes changing...');
        this.inject(logger);
      });

      setup(() => {
        console.log('-------------------------');
        this.inject(logger);
      });
    });

    compiler.hooks.watchClose.tap(name, () => {
      this.stopWatch();
      close();
    });
  }

  apply(compiler) {
    this.options.cwd = resolve(compiler.context, this.options.pagePath);

    const logger = getLogger() || compiler.getInfrastructureLogger(name);

    if (compiler.options.watch) {
      this.plugin = new VirtualModulesPlugin();
      this.plugin.apply(compiler);
      this.runOnWatching(logger, compiler);
    } else {
      const { context, length } = createRoutes(this.options, true);
      if (length) {
        const plugin = new VirtualModulesPlugin({
          [placeholder]: context,
        });
        plugin.apply(compiler);
        logger.info('generate', length, 'routes automatically');
      }
    }
  }
};
