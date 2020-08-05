/* eslint-env node */
const { pascalCase } = require('pascal-case');
const { resolve, relative } = require('path');
const { watch } = require('chokidar');
const debounce = require('lodash/debounce');
const globby = require('globby');
const slash = require('slash');

function createWatcher({ globs, cwd, callback }) {
  const action = debounce(callback, 1000, {
    trailing: true,
  });

  return watch(`*/${globs}`, {
    awaitWriteFinish: true,
    cwd,
    ignoreInitial: true,
  })
    .on('add', action)
    .on('unlink', action)
    .on('change', action);
}

function createRoutes({ globs, cwd, filter = () => true }) {
  return globby(`*/${globs}`, { cwd }).then((paths) => {
    const data = Object.fromEntries(
      paths
        .map((filePath) => {
          const name = pascalCase(filePath.split('/')[0]);

          const from = resolve(__dirname, '../routes');
          const to = resolve(cwd, filePath);
          const path = slash(relative(from, to));

          return [name, `import ${name} from '${path}';`];
        })
        .filter(([name]) => filter(name)),
    );

    return `// timestamp:${new Date().getTime()}
${Object.values(data).join('\r\n')}
export const routes = [${Object.keys(data).join(',')}];

if (process.env.NODE_ENV !== 'production') {
  console.log('Routes generate by \`road-to-rome\`', routes);
}
`;
  });
}

module.exports = { createWatcher, createRoutes };
