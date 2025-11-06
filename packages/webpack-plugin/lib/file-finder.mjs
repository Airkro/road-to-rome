import { globby } from 'globby';

export function fileFinder({ cwd, globs, depth = 10 }) {
  return globby(globs, {
    cwd,
    deep: depth,
    onlyFiles: true,
    gitignore: true,
  });
}
