const VirtualModulesPlugin = require('webpack-virtual-modules');
const validateOptions = require('schema-utils');
const { join } = require('path');

const { createWatcher, createRoutes } = require('./lib');

const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    pagePath: {
      type: 'string',
    },
    filter: {
      instanceof: 'Function',
    },
  },
};

const name = 'RoadToRomePlugin';

module.exports = class RoadToRomePlugin {
  constructor(options = {}) {
    validateOptions(schema, options, { name });

    const { pagePath = 'src/pages', filter } = options;

    this.pagePath = pagePath;
    this.filter = filter;

    this.plugin = new VirtualModulesPlugin();
  }

  inject({ cwd, globs }) {
    const { filter } = this;
    return createRoutes({ globs, cwd, filter })
      .then((content) => {
        this.plugin.writeModule(
          `node_modules/@road-to-rome/routes/index.js`,
          content,
        );
      })
      .catch(console.error);
  }

  apply(compiler) {
    this.plugin.apply(compiler);

    const options = {
      cwd: join(compiler.context, this.pagePath),
      globs: 'route.config.js',
    };

    compiler.hooks.entryOption.tap(name, () => {
      this.inject(options);
    });

    if (compiler.options.watch) {
      compiler.hooks.watchRun.tap(name, () => {
        if (!this.watcher) {
          this.watcher = createWatcher({
            ...options,
            callback: () => {
              this.inject(options);
            },
          });
        }
      });

      compiler.hooks.watchClose.tap(name, () => {
        if (this.watcher) {
          this.watcher.close();
        }
      });
    }
  }
};
