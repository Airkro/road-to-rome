import slashToRegexp from 'slash-to-regexp';
import { validator } from './lib/validator.mjs';
import { mergeFilter } from './lib/merge-filter.mjs';
import { createRequire } from 'node:module';

const name = 'RoadToRomePlugin';

const require = createRequire(import.meta.url);

export class RoadToRomePlugin {
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
      filter: mergeFilter({
        filter,
        include,
        exclude,
      }),
    };
  }

  apply(compiler) {
    compiler.options.module.rules.push({
      include: slashToRegexp('/node_modules/@road-to-rome/routes/index.js'),
      use: [
        {
          loader: require.resolve('./lib/loader.mjs'),
          options: this.options,
        },
      ],
    });

    // compiler.hooks.done.tapAsync(name, ({ compilation: { errors } }) => {
    //   console.log(errors);
    // });
  }
}
