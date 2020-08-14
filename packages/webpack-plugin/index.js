const VirtualModulesPlugin = require('webpack-virtual-modules');
const validateOptions = require('schema-utils');
const { resolve } = require('path');

const { createWatcher, createRoutes, mappers } = require('./lib');

const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    pagePath: {
      type: 'string',
    },
    depth: {
      type: 'number',
    },
    mode: {
      type: 'string',
      enum: Object.keys(mappers),
    },
    mapper: {
      instanceof: 'Function',
    },
    filter: {
      instanceof: 'Function',
    },
  },
};

const name = 'RoadToRomePlugin';

class RoadToRomePlugin {
  constructor(options = {}) {
    validateOptions(schema, options, { name });

    const {
      depth = 10,
      filter,
      mode = Object.keys(mappers)[0],
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

  inject(cwd) {
    const { mapper, filter, depth } = this;
    return createRoutes({ cwd, depth, mapper, filter })
      .then(this.writeModule)
      .catch(console.error);
  }

  apply(compiler) {
    this.plugin.apply(compiler);

    const cwd = resolve(compiler.context, this.pagePath);

    compiler.hooks.entryOption.tap(name, () => {
      this.inject(cwd);
    });

    if (compiler.options.watch) {
      compiler.hooks.watchRun.tap(name, () => {
        if (!this.watcher) {
          this.watcher = createWatcher({
            cwd,
            deep: this.depth,
            callback: () => {
              this.inject(cwd);
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
}

RoadToRomePlugin.mappers = mappers;

module.exports = RoadToRomePlugin;
