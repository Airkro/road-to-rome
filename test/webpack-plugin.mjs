import { mergeFilter } from '@road-to-rome/webpack-plugin/lib/merge-filter.cjs';
import test from 'ava';

const sample = [{ path: '1' }, { path: '2' }, { path: '3' }, { path: '4' }];

test('filter', (t) => {
  t.snapshot(
    mergeFilter({
      filter: ({ path }) => path === '1',
    })(sample),
  );
});

test('include', (t) => {
  t.snapshot(
    mergeFilter({
      include: ['4', '3', '1'],
    })(sample),
  );
});

test('exclude', (t) => {
  t.snapshot(
    mergeFilter({
      exclude: ['3'],
    })(sample),
  );
});
