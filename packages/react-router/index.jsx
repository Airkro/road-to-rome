import { lazyImportRoutes, syncImportRoutes } from './lib';

export default function DecentralizedRoutes({
  handleLazyError,
  lazyContext,
  lazyConfig,
  lazyNormalize,

  syncContext,
  syncNormalize,

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
    { component: Page404 }
  ];
}
