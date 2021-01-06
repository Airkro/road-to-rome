const VirtualModulesPlugin = require('webpack-virtual-modules');
const { validate } = require('schema-utils');
const { resolve } = require('path');
const readline = require('readline');

const { createWatcher, createRoutes, mappers } = require('./lib.cjs');
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

const routePath = 'node_modules/@road-to-rome/routes/index.js';

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
      cwd: resolve(process.cwd(), pagePath),
    };

    const { context, length } = createRoutes(this.options, true);

    console.info('generate', length, 'routes automatically');

    this.plugin = new VirtualModulesPlugin(
      length ? { [routePath]: context } : undefined,
    );
  }

  inject(logger) {
    return createRoutes(this.options)
      .then(({ context, length }) => {
        logger.info('generate', length, 'routes automatically');
        if (context) {
          this.plugin.writeModule(routePath, context);
        }
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

  apply(compiler) {
    this.plugin.apply(compiler);

    if (compiler.options.watch) {
      const logger = getLogger() || compiler.getInfrastructureLogger(name);

      const rl = readline.createInterface(process.stdin);

      compiler.hooks.afterEnvironment.tap(name, () => {
        this.startWatch(this.options.cwd, () => {
          logger.info('Routes changing...');
          this.inject(logger);
        });

        rl.on('line', (line) => {
          if (line.trim() === 'rtr') {
            console.log('-------------------------');
            this.inject(logger);
          }
        });
      });

      compiler.hooks.watchClose.tap(name, () => {
        this.stopWatch();
        rl.close();
      });
    }
  }
};
