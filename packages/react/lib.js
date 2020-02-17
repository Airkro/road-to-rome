import { constantCase } from 'constant-case';
import { createElement, lazy } from 'react';

import { captureException, withScope } from '@sentry/minimal';

export function contextMapper(context, onError) {
  return Object.entries(context).map(([filePath, modules]) => [
    filePath
      .replace('.', '')
      .replace(/(\d+)?@/g, '')
      .replace(/\/(index\.(lazy|sync)|route\.config)\.jsx?$/, ''),
    onError
      ? lazy(() =>
          modules().catch(error => {
            console.error(error);
            withScope(scope => {
              scope.setTag('scene', 'PageLazyLoad');
              captureException(error);
            });

            return { default: onError };
          })
        )
      : modules.default
  ]);
}

export function routeMerge(components, configs) {
  return Object.entries(components).map(([key, component]) => {
    const { [key]: { meta = {}, path = key, exact = true } = {} } = configs;
    const uniqueId = constantCase(key);
    return {
      key: uniqueId,
      path,
      exact,
      render(routeProps) {
        return createElement(component, { ...routeProps, meta, uniqueId });
      }
    };
  });
}
