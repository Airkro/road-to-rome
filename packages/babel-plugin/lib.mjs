import { dirname, join, relative } from 'node:path';

import { globbySync } from 'globby';
import picomatch from 'picomatch';
import slash from 'slash';

function normalize(path) {
  return slash(path).replace(/^[A-Z]+:/i, '');
}

export const isRouteConfig = ({ filename, globs, cwd }) =>
  filename &&
  globs &&
  cwd &&
  picomatch(normalize(filename), normalize(join(cwd, '**', globs)), {
    dot: true,
  });

export const find = ({ filename, globs }) => {
  const cwd = dirname(filename);

  return globbySync(`*/${globs}`, { cwd })
    .toSorted()
    .map((file, index) => {
      const idx = index < 9 ? `0${index + 1}` : index + 1;

      return {
        name: `RouteConfig${idx}`,
        file: slash(`./${file}`),
      };
    });
};

export const pathToFold = ({ cwd, filename }) =>
  slash(dirname(relative(cwd, filename)))
    .split('/')
    .map((item) => (item.includes('@') ? item.split('@')[1] : item));
