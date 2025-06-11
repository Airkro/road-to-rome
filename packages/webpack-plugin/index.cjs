'use strict';

const slashToRegexp = require('slash-to-regexp');
const { validator } = require('./lib/validator.cjs');
const { mergeFilter } = require('./lib/merge-filter.cjs');

const name = 'RoadToRomePlugin';

class RoadToRomePlugin {
  constructor(options = {}) {
    validator(options, name);

    const {
      depth = 10,
      globs = 'src/pages/**/route.config.{ts,js}',
      filter,
      exclude,
      include,
    } = options;

    this.options = {
      globs,
      depth,
      filter: mergeFilter({ filter, include, exclude }),
    };
  }

  apply(compiler) {
    compiler.options.module.rules.push({
      include: slashToRegexp('/node_modules/@road-to-rome/routes/index.js'),
      use: [
        {
          loader: require.resolve('./lib/loader.cjs'),
          options: this.options,
        },
      ],
    });

    // compiler.hooks.done.tapAsync(name, ({ compilation: { errors } }) => {
    //   console.log(errors);
    // });
  }
}

module.exports = RoadToRomePlugin;
