import { lazy } from 'react';

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

    return {
      component: lazy(() => item().catch(handleError)),
      path: namespace,
      exact: true,
      ...(configPath ? config[configPath].default || {} : undefined)
    };
  });
}

export function syncImportRoutes({ context, normalize }) {
  return Object.entries(context).map(
    ([
      name,
      {
        default: component,
        route: { path = normalize(name), exact = true, ...route } = {}
      }
    ]) => ({
      component,
      path,
      exact,
      ...route
    })
  );
}
