import { fileURLToPath } from 'node:url';

import { transformFileAsync } from '@babel/core';
import test from 'ava';

function url(path) {
  return fileURLToPath(new URL(path, import.meta.url).href);
}

const entry1 = url('fixture/route.config.js');
const entry2 = url('fixture/route.config.ts');

const file1 = url('fixture/abc/route.config.js');
const file2 = url('fixture/abc/efg/route.config.js');

const plugin = '@road-to-rome/babel-plugin';

async function marco(t, filename) {
  const { code } = await transformFileAsync(filename, {
    configFile: false,
    babelrc: false,
    overrides: [
      {
        include: ['**/route.config.js', '**/route.config.ts'],
        plugins: [
          '@babel/plugin-syntax-typescript',
          [plugin, { root: url('fixture') }],
        ],
      },
    ],
  });

  t.snapshot(code);
}

test('entry1', marco, entry1);

test('entry2', marco, entry2);

test('file1', marco, file1);

test('file2', marco, file2);
