/* eslint-env node */
const { pascalCase } = require('pascal-case');
const { resolve, relative } = require('path');
const { watch } = require('chokidar');
const debounce = require('lodash/debounce');
const globby = require('globby');
const slash = require('slash');
const { utimes } = require('fs');

const routes = require.resolve('@road-to-rome/routes');

function touch() {
  const time = new Date();

  utimes(routes, time, time, (error) => {
    if (error) {
      console.error(error);
    }
  });
}

function createWatcher({ cwd, depth, callback }) {
  const action = debounce(callback, 1500, { trailing: true });
  const touching = debounce(touch, 3000, { trailing: true });

  return watch(`**/route.config.js`, {
    cwd,
    depth,
    ignoreInitial: true,
    atomic: false,
  })
    .on('add', action)
    .on('unlink', () => {
      action();
      touching();
    });
}

const from = resolve(require.resolve('@road-to-rome/routes'), '../');

const mappers = {
  'flat-array': (data) => {
    return `[${data.map(([config]) => config).join(',')}]`;
  },
  'deep-map': (data) => {
    return `new Map([${data
      .map(([config, index]) => `[${JSON.stringify(index)}, ${config}]`)
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
    const data = paths.map((filePath) => {
      const index = filePath
        .split('/')
        .slice(0, -1)
        .map((item) => item.replace(/^(\d+)?@/, ''));

      const to = resolve(cwd, filePath);
      const path = slash(relative(from, to));
      const name = pascalCase(index.join('-'));

      return [name, index, `import ${name} from '${path}';`];
    });

    const result = filter ? filter(data) : data;

    return `${result.map((item) => item[2]).join('\r\n')}

export const routes = ${mapper(result)};

if (process.env.NODE_ENV !== 'production') {
  console.log('Routes generate by \`road-to-rome\`', routes);
}`;
  });
}

module.exports = { createWatcher, createRoutes, mappers };
