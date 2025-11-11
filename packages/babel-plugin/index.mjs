import { basename, dirname, extname } from 'node:path';

// import t from '@babel/types';

import { find, isRouteConfig, pathToFold } from './lib.mjs';

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

function replaceOrInsertExport(programPath, exporter, exportName) {
  const bodyPaths = programPath.get('body') || [];

  for (const stmtPath of bodyPaths) {
    if (
      typeof stmtPath.isExportNamedDeclaration === 'function' &&
      stmtPath.isExportNamedDeclaration()
    ) {
      const { node } = stmtPath;
      // case: export const <name> = ...
      const decl = node.declaration;

      if (decl && decl.type === 'VariableDeclaration') {
        for (const d of decl.declarations) {
          // identifier or pattern
          if (d.id && d.id.name === exportName) {
            stmtPath.replaceWith(exporter);

            return;
          }
        }
      }

      // case: export { name } or export { name as something }
      if (
        node.specifiers &&
        node.specifiers.some(
          (s) =>
            (s.exported && s.exported.name === exportName) ||
            (s.local && s.local.name === exportName),
        )
      ) {
        stmtPath.replaceWith(exporter);

        return;
      }
    }
  }

  // not found -> insert at top
  programPath.unshiftContainer('body', exporter);
}

function exportFoldStatement(t, { root, filename }) {
  return t.exportNamedDeclaration(
    t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier('fold'),
        t.arrayExpression(
          pathToFold({
            cwd: root,
            filename,
          }).map((item) => t.stringLiteral(item)),
        ),
      ),
    ]),
  );
}

function getConfig(filename) {
  const globs = basename(filename);
  const ext = extname(filename);
  const cwd = dirname(filename);

  return {
    globs: globs.replace(ext, '.{js,jsx,ts,tsx}'),
    cwd,
  };
}

export default function plugin({ types: t }) {
  return {
    visitor: {
      Program(path, { filename, opts: { root } }) {
        if (filename && typeof filename === 'string') {
          const { globs, cwd } = getConfig(filename);

          if (
            isRouteConfig({
              filename,
              globs,
              cwd,
            })
          ) {
            const sets = find({
              filename,
              globs,
            });
            const fold = exportFoldStatement(t, {
              root,
              filename,
            });

            if (sets.length > 0) {
              const imports = sets.map(({ name, file }) =>
                importSourceStatement(t, {
                  name,
                  file,
                }),
              );
              const exporter = exportChildStatement(
                t,
                sets.map(({ name }) => name),
              );
              // replace existing `export ... child` if present, otherwise insert
              replaceOrInsertExport(path, exporter, 'child');
              path.unshiftContainer('body', imports);
            }

            // replace or insert `export const fold`
            replaceOrInsertExport(path, fold, 'fold');
          }
        }
      },
    },
  };
}
