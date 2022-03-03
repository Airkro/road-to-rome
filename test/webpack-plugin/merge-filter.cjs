'use strict';

// eslint-disable-next-line import/no-unresolved
const test = require('ava').default;
const {
  mergeFilter,
} = require('@road-to-rome/webpack-plugin/lib/merge-filter.cjs');

const sample = [{ path: '1' }, { path: '2' }, { path: '3' }, { path: '4' }];

test('filter', (t) => {
  t.deepEqual(
    mergeFilter({
      filter: ({ path }) => path === '1',
    })(sample),
    [{ path: '1' }],
  );
});

test('include', (t) => {
  t.deepEqual(
    mergeFilter({
      include: ['4', '3', '1'],
    })(sample),
    [{ path: '1' }, { path: '3' }, { path: '4' }],
  );
});

test('exclude', (t) => {
  t.deepEqual(
    mergeFilter({
      exclude: ['3'],
    })(sample),
    [{ path: '1' }, { path: '2' }, { path: '4' }],
  );
});
