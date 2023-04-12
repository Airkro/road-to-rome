'use strict';

const { dirname, basename } = require('node:path');
const { find, pathToFold, isRouteConfig } = require('./lib.cjs');

// const t = require('@babel/types');

function importSourceStatement(t, { name, file }) {
  return t.importDeclaration(
    [t.importNamespaceSpecifier(t.identifier(name))],
    t.stringLiteral(file),
  );
}

function exportChildStatement(t, names) {
  return t.exportNamedDeclaration(
    t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier('child'),
        t.arrayExpression(names.map((name) => t.identifier(name))),
      ),
    ]),
  );
}

function exportFoldStatement(t, { cwd, filename }) {
  return t.exportNamedDeclaration(
    t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier('fold'),
        t.arrayExpression(
          pathToFold({ cwd, filename }).map((item) => t.stringLiteral(item)),
        ),
      ),
    ]),
  );
}

function getConfig(entry) {
  const io = require.resolve(entry);

  const globs = basename(io);
  const cwd = dirname(io);

  return { globs, cwd };
}

function plugin({ types: t }) {
  return {
    visitor: {
      Program(path, { filename, opts: { entry } }) {
        if (entry && typeof entry === 'string') {
          const { globs, cwd } = getConfig(entry);

          if (isRouteConfig({ filename, globs, cwd })) {
            const sets = find({ filename, globs });

            const fold = exportFoldStatement(t, {
              cwd,
              filename,
            });

            if (sets.length > 0) {
              const imports = sets.map(({ name, file }) =>
                importSourceStatement(t, { name, file }),
              );

              const exporter = exportChildStatement(
                t,
                sets.map(({ name }) => name),
              );

              path.unshiftContainer('body', exporter);
              path.unshiftContainer('body', imports);
            }

            path.unshiftContainer('body', fold);
          }
        }
      },
    },
  };
}

module.exports = plugin;
