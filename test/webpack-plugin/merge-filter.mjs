import { mergeFilter } from '@road-to-rome/webpack-plugin/lib/merge-filter.cjs';
import test from 'ava';

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
