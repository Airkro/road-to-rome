import generator from '@babel/generator';
import t from '@babel/types';
import { pascalCase } from 'pascal-case';

function variable(items) {
  return t.exportNamedDeclaration(
    t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier('routes'),
        t.objectExpression(
          items.map(({ to, path }) =>
            t.objectProperty(t.stringLiteral(path), t.identifier(to)),
          ),
        ),
      ),
    ]),
  );
}

function statement(items) {
  return items.map(({ from, source, to }) =>
    t.importDeclaration(
      [
        from
          ? t.importSpecifier(t.identifier(to), t.identifier(from))
          : t.importDefaultSpecifier(t.identifier(to)),
      ],
      t.stringLiteral(source),
    ),
  );
}

function logger(items) {
  return t.ifStatement(
    t.binaryExpression(
      '!==',
      t.memberExpression(
        t.memberExpression(t.identifier('process'), t.identifier('env')),
        t.identifier('NODE_ENV'),
      ),
      t.stringLiteral('production'),
    ),
    t.blockStatement([
      t.expressionStatement(
        t.callExpression(
          t.memberExpression(t.identifier('console'), t.identifier('log')),
          [
            t.stringLiteral(
              items.length > 0 ? `${items.length} Routes` : '0 routes',
            ),
            t.stringLiteral('generate by `road-to-rome`'),
            items.length > 0 ? t.identifier('routes') : undefined,
          ].filter(Boolean),
        ),
      ),
    ]),
  );
}

export function generate(list) {
  const items = list.map(({ source, to = source, path = source, ...rest }) => ({
    ...rest,
    source,
    path,
    to: pascalCase(to),
  }));
  const ast = t.file(
    t.program([...statement(items), variable(items), logger(items)]),
  );
  const { code } = generator.default(ast, {}, '');

  return list.length > 0
    ? code.replace('export const', '\nexport const')
    : code;
}
