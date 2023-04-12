'use strict';

const { join, relative, dirname } = require('node:path');
const globby = require('globby');
const { minimatch } = require('minimatch');
const slash = require('slash');

function normalize(path) {
  return slash(path).replace(/^[A-Za-z]+:/, '');
}

exports.isRouteConfig = ({ filename, globs, cwd }) =>
  filename &&
  globs &&
  cwd &&
  minimatch(normalize(filename), normalize(join(cwd, '**', globs)));

exports.find = ({ filename, globs }) => {
  const cwd = dirname(filename);

  return globby
    .sync(`*/${globs}`, { cwd })
    .sort()
    .map((file, index) => ({
      name: `RouteConfig${index}`,
      file: slash(`./${file}`),
    }));
};

exports.pathToFold = ({ cwd, filename }) =>
  slash(dirname(relative(cwd, filename)))
    .split('/')
    .map((item) => (item.includes('@') ? item.split('@')[1] : item));
