const VirtualModulesPlugin = require('webpack-virtual-modules');
const validateOptions = require('schema-utils');
const { resolve } = require('path');

const { createWatcher, createRoutes, maker } = require('./lib');

const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    pagePath: {
      type: 'string',
    },
    mapper: {
      instanceof: 'Function',
    },
    mode: {
      type: 'string',
      enum: Object.keys(maker),
    },
    depth: {
      type: 'number',
    },
  },
};

const name = 'RoadToRomePlugin';

module.exports = class RoadToRomePlugin {
  constructor(options = {}) {
    validateOptions(schema, options, { name });

    const {
      pagePath = 'src/pages',
      depth = 10,
      mode,
      mapper = maker[mode] || Object.values(maker)[0],
    } = options;

    this.pagePath = pagePath;
    this.depth = depth;
    this.mapper = mapper;

    this.plugin = new VirtualModulesPlugin();
  }

  inject({ cwd, globs, depth }) {
    const { mapper } = this;
    return createRoutes({ globs, cwd, depth, mapper })
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
      cwd: resolve(compiler.context, this.pagePath),
      globs: 'route.config.js',
      depth: this.depth,
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
