import { createElement, lazy } from 'react';

export function lazyImportRoutes({
  context,
  config,
  normalize,
  handleError = error => {
    console.error(error);
    return { default: null };
  }
}) {
  const configGroup = Object.keys(config).reduce(
    (io, name) => ({ ...io, [normalize(name)]: name }),
    {}
  );

  return Object.entries(context).map(([name, item]) => {
    const namespace = normalize(name);

    const configPath = configGroup[namespace];

    const Component = lazy(() => item().catch(handleError));

    const {
      default: {
        path = namespace,
        sensitive,
        strict,
        exact = true,
        meta = {}
      } = {}
    } = configPath ? config[configPath] : {};

    return {
      path,
      exact,
      strict,
      sensitive,
      render: routeProps => createElement(Component, { ...routeProps, meta })
    };
  });
}

export function syncImportRoutes({ context, normalize }) {
  return Object.entries(context).map(
    ([
      name,
      {
        default: Component,
        route: {
          path = normalize(name),
          exact = true,
          strict,
          sensitive,
          meta
        } = {}
      }
    ]) => ({
      Component,
      path,
      exact,
      strict,
      sensitive,
      render: routeProps => createElement(Component, { ...routeProps, meta })
    })
  );
}
