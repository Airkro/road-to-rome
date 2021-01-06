import { constantCase } from 'constant-case';
import { unflatten } from 'flat';
import { nanoid } from 'nanoid';

function toTreeData(data) {
  return Object.values(data).map(
    ({ key: value = nanoid(5), title = nanoid(5), ...child }) => {
      const children = toTreeData(child);
      return children.length > 0
        ? { value, title, children }
        : { value, title };
    },
  );
}

export function TreeMapper(configs, includes = []) {
  const map = Object.fromEntries(
    (includes.length > 0
      ? Object.entries(configs).filter(([key]) => includes.includes(key))
      : Object.entries(configs)
    )
      // eslint-disable-next-line no-unused-vars
      .filter(([key, { hideInMenu = false }]) => !hideInMenu)
      .map(([key, { meta: { title } = {} }]) => [
        key,
        { key: constantCase(key), title },
      ]),
  );

  const tree = unflatten(map, {
    safe: true,
    delimiter: '/',
  })[0];

  return toTreeData(tree);
}
