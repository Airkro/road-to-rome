export const routes = [];

/* globals process: readonly */
// eslint-disable-next-line node/no-process-env
if (process.env.NODE_ENV !== 'production') {
  console.warn(
    'You are using a fallback routes list, the generator might not working.',
  );
}
