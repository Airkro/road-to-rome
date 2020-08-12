/* eslint-env node */
const { pascalCase } = require('pascal-case');
const { resolve, relative } = require('path');
const { watch } = require('chokidar');
const debounce = require('lodash/debounce');
const globby = require('globby');
const slash = require('slash');

function createWatcher({ cwd, depth, callback }) {
  const action = debounce(callback, 1000, { trailing: true });

  return watch(`**/route.config.js`, {
    awaitWriteFinish: true,
    cwd,
    depth,
    ignoreInitial: true,
  })
    .on('add', action)
    .on('unlink', action)
    .on('change', action);
}

const from = resolve(require.resolve('@road-to-rome/routes'), '../');

const maker = {
  'flat-array': (data) => {
    return `[${data.map(([config]) => config).join(',')}]`;
  },
  'deep-map': (data) => {
    return `new Map([${data
      .map(([config, index]) => `[${JSON.stringify(index)}, ${config}]`)
      .join(',')}])`;
  },
};

function createRoutes({ cwd, depth: deep, mapper }) {
  return globby(`**/route.config.js`, { cwd, deep, onlyFiles: true }).then(
    (paths) => {
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

      return `// timestamp: ${new Date().getTime()}

${data.map((item) => item[2]).join('\r\n')}

export const routes = ${mapper(data)};

if (process.env.NODE_ENV !== 'production') {
  console.log('Routes generate by \`road-to-rome\`', routes);
}`;
    },
  );
}

module.exports = { createWatcher, createRoutes, maker };
