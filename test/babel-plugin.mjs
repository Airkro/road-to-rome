import { fileURLToPath } from 'node:url';

import { transformFileAsync } from '@babel/core';
import test from 'ava';

function url(path) {
  return fileURLToPath(new URL(path, import.meta.url).href);
}

const entry = url('fixture/route.config.js');

const file1 = url('fixture/abc/route.config.js');
const file2 = url('fixture/abc/efg/route.config.js');

const plugin = '@road-to-rome/babel-plugin';

async function marco(t, filename) {
  const { code } = await transformFileAsync(filename, {
    configFile: false,
    babelrc: false,
    overrides: [
      {
        test: '**/route.config.js',
        plugins: [[plugin, { root: url('fixture') }]],
      },
    ],
  });

  t.snapshot(code);
}

test('entry', marco, entry);

test('file1', marco, file1);

test('file2', marco, file2);
