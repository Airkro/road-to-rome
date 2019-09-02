import { lazyImportRoutes, syncImportRoutes } from './lib';

export default function DecentralizedRoutes({
  handleLazyError,
  lazyContext,
  lazyConfig,
  lazyNormalize = name =>
    name.replace(/^\.|\/(index\.async|route\.config)\.jsx?$/g, ''),

  syncContext,
  syncNormalize = name => name.replace(/^\.|\/index\.sync\.jsx?$/g, ''),

  // Page403,
  Page404
}) {
  return [
    ...syncImportRoutes({
      context: syncContext,
      normalize: syncNormalize
    }),
    ...lazyImportRoutes({
      config: lazyConfig,
      context: lazyContext,
      normalize: lazyNormalize,
      handleError: handleLazyError
    }),
    ...(Page404 ? [{ component: Page404 }] : undefined)
  ];
}
