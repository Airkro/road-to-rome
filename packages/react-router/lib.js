import { lazy } from 'react';

export function lazyImportRoutes({
  context,
  config,
  normalize = name =>
    name.replace(/^\.|\/(index\.async|route\.config)\.jsx?$/g, ''),
  handleError = error => {
    console.error(error);
    return { default: null };
  }
}) {
  const configGroup = config
    .keys()
    .reduce((io, name) => ({ ...io, [normalize(name)]: name }), {});

  return context.keys().map(name => {
    const namespace = normalize(name);

    const configPath = configGroup[namespace];

    return {
      component: lazy(() =>
        context(name)
          // .then(({ default: result }) => result)
          .catch(handleError)
      ),
      path: namespace,
      exact: true,
      ...(configPath ? config(configPath).default || {} : undefined)
    };
  });
}

export function syncImportRoutes({
  context,
  normalize = name => name.replace(/^\.|\/index\.sync\.jsx?$/g, '')
}) {
  return context
    .keys()
    .map(name => {
      const { default: component, route = {} } = context(name);
      return {
        component,
        route,
        defaultPath: normalize(name)
      };
    })
    .map(
      ({
        defaultPath,
        component,
        route: { path = defaultPath, exact = true, ...route } = {}
      }) => ({
        component,
        path,
        exact,
        ...route
      })
    );
}
