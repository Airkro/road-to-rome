const VirtualModulesPlugin = require('webpack-virtual-modules');
const { validate } = require('schema-utils');
const { resolve } = require('path');
const readline = require('readline');

const { createWatcher, createRoutes, mappers } = require('./lib');
const schema = require('./schema');

const name = 'RoadToRomePlugin';

// eslint-disable-next-line consistent-return
function getLogger() {
  if (process.env.WEBPACK_DEV_SERVER) {
    try {
      // eslint-disable-next-line global-require,import/no-unresolved
      return require('webpack-log')({ name: 'rtr' });
      // eslint-disable-next-line no-empty
    } catch {}
  }
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

    this.pagePath = pagePath;
    this.depth = depth;
    this.mapper = mapper;
    this.filter = filter;

    this.plugin = new VirtualModulesPlugin();
  }

  writeModule(content) {
    this.plugin.writeModule(
      `node_modules/@road-to-rome/routes/index.js`,
      content,
    );
  }

  inject(cwd, logger) {
    const { mapper, filter, depth: deep } = this;
    return createRoutes({ cwd, deep, mapper, filter })
      .then(({ context, length }) => {
        logger.info('generate', length, 'routes automatically');
        if (context) {
          this.writeModule(context);
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

    const logger = getLogger() || compiler.getInfrastructureLogger(name);

    const cwd = resolve(compiler.context, this.pagePath);

    compiler.hooks.afterEnvironment.tap(name, () => {
      this.inject(cwd, logger);
    });

    if (compiler.options.watch) {
      /* eslint-env node */
      const rl = readline.createInterface(process.stdin);
      /* eslint-env */
      compiler.hooks.afterEnvironment.tap(name, () => {
        this.startWatch(cwd, () => {
          logger.info('Routes changing...');
          this.inject(cwd, logger);
        });

        rl.on('line', (line) => {
          if (line.trim() === 'rtr') {
            console.log('-------------------------');
            this.inject(cwd, logger);
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
