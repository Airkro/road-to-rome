# @road-to-rome/webpack-plugin

Automatically generate routes by filename.

[![npm][npm-badge]][npm-url]
[![license][license-badge]][github-url]
![node][node-badge]

## Installation

```bash
npm install @road-to-rome/routes --save
npm install @road-to-rome/webpack-plugin --save-dev
```

## Usage

<!-- global Router  -->
<!-- eslint-disable no-new  -->

```js
// example: 'src/index.js'
import { routes } from '@road-to-rome/routes';

new Router({ routes });
```

<!-- eslint-enable no-new  -->

```js
// example: webpack.config.js
const RoadToRomePlugin = require('@road-to-rome/webpack-plugin');

module.exports = {
  plugins: [
    new RoadToRomePlugin({
      filter: (page) => page !== 'Home'
    })
  ]
};
```

## Options

### pagePath

- type: `string`
- default: `src/pages`

Find your routes by matching `${pagePath}/*/route.config.js`.

### filter

- type: `function: string => boolean`

Page component filter for generations.

[npm-url]: https://www.npmjs.com/package/@road-to-rome/webpack-plugin
[npm-badge]: https://img.shields.io/npm/v/@road-to-rome/webpack-plugin.svg?style=flat-square&logo=npm
[github-url]: https://github.com/road-to-rome/road-to-rome/tree/master/packages/webpack-plugin
[node-badge]: https://img.shields.io/node/v/@road-to-rome/webpack-plugin.svg?style=flat-square&colorB=green&logo=node.js
[license-badge]: https://img.shields.io/npm/l/@road-to-rome/webpack-plugin.svg?style=flat-square&colorB=blue&logo=github
