const VirtualModulesPlugin = require('webpack-virtual-modules');
const validateOptions = require('schema-utils');
const { resolve } = require('path');
const readline = require('readline');

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

  inject(cwd) {
    const { mapper, filter, depth: deep } = this;
    return createRoutes({ cwd, deep, mapper, filter })
      .then((content) => {
        if (content) {
          this.writeModule(content);
        }
      })
      .catch(console.error);
  }

  startWatch(cwd) {
    this.stopWatch();

    if (!this.watcher) {
      this.watcher = createWatcher({
        cwd,
        depth: this.depth,
        callback: () => {
          this.inject(cwd);
        },
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

    const cwd = resolve(compiler.context, this.pagePath);

    compiler.hooks.entryOption.tap(name, () => {
      this.inject(cwd);
    });

    if (compiler.options.watch) {
      /* eslint-env node */
      const rl = readline.createInterface(process.stdin);

      rl.on('line', (line) => {
        if (line.trim() === 'rtr') {
          this.inject(cwd);
        }
      });

      compiler.hooks.entryOption.tap(name, () => {
        this.startWatch(cwd);
      });

      compiler.hooks.watchClose.tap(name, () => {
        this.stopWatch();
        rl.close();
      });
    }
  }
}

RoadToRomePlugin.mappers = mappers;

module.exports = RoadToRomePlugin;
