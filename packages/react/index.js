import nanoID from 'nanoid';
import { unflatten } from 'flat';
import { constantCase } from 'constant-case';
import { contextMapper, routeMerge } from './lib';

export function ModuleMapper({ lazy, sync, onError = () => null }) {
  return Object.fromEntries([
    ...contextMapper(sync),
    ...contextMapper(lazy, onError)
  ]);
}

export function ConfigMapper({ config }) {
  return Object.fromEntries(contextMapper(config));
}

export function RouteMapper({ Page403, Page404, components, configs }) {
  return routeMerge(components, configs)
    .concat(
      Page403 && {
        key: '403',
        path: '/403',
        exact: true,
        component: Page403
      },
      Page404 && {
        key: '404',
        exact: true,
        component: Page404
      }
    )
    .filter(Boolean);
}

function toTreeData(data) {
  return Object.values(data).map(
    ({ key: value = nanoID(5), title = nanoID(5), ...child }) => {
      const children = toTreeData(child);
      return children.length > 0
        ? { value, title, children }
        : { value, title };
    }
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
        { key: constantCase(key), title }
      ])
  );

  const tree = unflatten(map, {
    safe: true,
    delimiter: '/'
  })[0];

  return toTreeData(tree);
}
