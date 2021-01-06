const { pascalCase } = require('pascal-case');
const { resolve, relative } = require('path');
const { utimes } = require('fs');
const { watch } = require('chokidar');
const debounce = require('lodash/debounce');
const globby = require('globby');
const slash = require('slash');
const readline = require('readline');

const placeholder = require.resolve('@road-to-rome/routes');

const touching = debounce(
  (logger) => {
    const time = new Date();
    utimes(placeholder, time, time, (error) => {
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

const from = resolve(placeholder, '../');

const mappers = {
  'flat-array': (data) => {
    const list = data.map(
      ({ route, index }) => `{path:"/${index.join('/')}",...${route}}`,
    );
    return `[${list.join(',')}]`;
  },
  'deep-map': (data) =>
    `new Map([${data
      .map(({ route, index }) => `[${JSON.stringify(index)}, ${route}]`)
      .join(',')}])`,
};

function pathParser({ paths, cwd, mapper, filter }) {
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

  const lists = filter ? data.filter((item) => filter(item[1])) : data;

  const result = Object.fromEntries(lists);

  return {
    length: lists.length,
    context: `${Object.keys(result).join('\r\n')}

export const routes = ${mapper(Object.values(result))};

if (process.env.NODE_ENV !== 'production') {
  console.log('Routes generate by \`road-to-rome\`', routes);
}`,
  };
}

function createRoutes({ cwd, deep, mapper, filter }, sync = false) {
  const options = { cwd, deep, onlyFiles: true, gitignore: true };

  if (sync) {
    return pathParser({
      paths: globby.sync(`**/route.config.js`, options),
      cwd,
      mapper,
      filter,
    });
  }

  return globby(`**/route.config.js`, options).then((paths) =>
    pathParser({ paths, cwd, mapper, filter }),
  );
}

function createCaller(sign = 'rtr') {
  const rl = readline.createInterface(process.stdin);

  return {
    setup(callback) {
      rl.on('line', (line) => {
        if (line.trim() === sign) {
          callback();
        }
      });
    },
    close() {
      rl.close();
    },
  };
}

module.exports = {
  createCaller,
  createRoutes,
  createWatcher,
  mappers,
  placeholder,
};
