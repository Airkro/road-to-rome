const { pascalCase } = require('pascal-case');
const { resolve, relative } = require('path');
const { utimes } = require('fs');
const { watch } = require('chokidar');
const debounce = require('lodash/debounce');
const globby = require('globby');
const slash = require('slash');

const routes = require.resolve('@road-to-rome/routes');

const touching = debounce(
  (logger) => {
    const time = new Date();
    utimes(routes, time, time, (error) => {
      if (error) {
        logger.warn(error);
      }
    });
  },
  3000,
  { trailing: true },
);

function createWatcher({ cwd, depth, logger, callback }) {
  const action = debounce(callback, 1500, { trailing: true });

  return watch(`**/route.config.js`, {
    cwd,
    depth,
    ignoreInitial: true,
    atomic: false,
  })
    .on('add', () => {
      action();
      touching(logger);
    })
    .on('unlink', () => {
      action();
      touching(logger);
    });
}

const from = resolve(routes, '../');

const mappers = {
  'flat-array': (data) => {
    const list = data.map(
      ({ route, index }) => `{path:"/${index.join('/')}",...${route}}`,
    );
    return `[${list.join(',')}]`;
  },
  'deep-map': (data) => {
    return `new Map([${data
      .map(({ route, index }) => `[${JSON.stringify(index)}, ${route}]`)
      .join(',')}])`;
  },
};

function createRoutes({ cwd, deep, mapper, filter }) {
  return globby(`**/route.config.js`, {
    cwd,
    deep,
    onlyFiles: true,
    gitignore: true,
  }).then((paths) => {
    if (paths.length === 0) {
      return { length: 0 };
    }
    const data = paths.map((filePath) => {
      const index = filePath
        .split('/')
        .slice(0, -1)
        .map((item) => item.replace(/^(\d+)?@/, ''));

      const to = resolve(cwd, filePath);
      const path = slash(relative(from, to));
      const route = pascalCase(index.join('-'));

      return [`import ${route} from '${path}';`, { route, index }];
    });

    const result = Object.fromEntries(
      filter ? data.filter((item) => filter(item[1])) : data,
    );

    return {
      length: paths.length,
      context: `${Object.keys(result).join('\r\n')}

export const routes = ${mapper(Object.values(result))};

if (process.env.NODE_ENV !== 'production') {
  console.log('Routes generate by \`road-to-rome\`', routes);
}`,
    };
  });
}

module.exports = { createWatcher, createRoutes, mappers };
