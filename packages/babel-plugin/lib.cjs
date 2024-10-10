'use strict';

const { join, relative, dirname } = require('node:path');
const globby = require('globby');
const { minimatch } = require('minimatch');
const slash = require('slash');

function normalize(path) {
  return slash(path).replace(/^[A-Z]+:/i, '');
}

exports.isRouteConfig = ({ filename, globs, cwd }) =>
  filename &&
  globs &&
  cwd &&
  minimatch(normalize(filename), normalize(join(cwd, '**', globs)), {
    dot: true,
  });

exports.find = ({ filename, globs }) => {
  const cwd = dirname(filename);

  return globby
    .sync(`*/${globs}`, { cwd })
    .sort()
    .map((file, index) => {
      const idx = index < 9 ? `0${index + 1}` : index + 1;

      return {
        name: `RouteConfig${idx}`,
        file: slash(`./${file}`),
      };
    });
};

exports.pathToFold = ({ cwd, filename }) =>
  slash(dirname(relative(cwd, filename)))
    .split('/')
    .map((item) => (item.includes('@') ? item.split('@')[1] : item));
