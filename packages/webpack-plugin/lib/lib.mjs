import { resolve, relative } from 'node:path';
import slash from 'slash';
import { generate } from './generator.mjs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export const placeholder = require.resolve('@road-to-rome/routes');

export async function pathParser({ paths, globs, cwd, filter }) {
  const base = new RegExp(`^${globs.split('/*', 1)}`);
  const data = paths.map((filePath) => {
    const absolutePath = resolve(cwd, filePath);
    const path = filePath
      .replace(base, '')
      .split('/')
      .slice(0, -1)
      .map((item) => item.replace(/^(\d+)?@/, ''))
      .join('/');

    return {
      path,
      source: slash(relative(resolve(placeholder, '../'), absolutePath)),
    };
  });
  const lists = filter(data);
  const routes = lists.map(({ path }) => path);

  return {
    routes,
    result: generate(
      lists.map(({ path, ...rest }) => ({
        path,
        to: path,
        ...rest,
      })),
    ),
  };
}
