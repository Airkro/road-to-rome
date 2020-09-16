# @road-to-rome/webpack-plugin

Automatically generate routes by filename.

[![npm][npm-badge]][npm-url]
[![github][github-badge]][github-url]
![node][node-badge]

[npm-url]: https://www.npmjs.com/package/@road-to-rome/webpack-plugin
[npm-badge]: https://img.shields.io/npm/v/@road-to-rome/webpack-plugin.svg?style=flat-square&logo=npm
[github-url]: https://github.com/airkro/road-to-rome/tree/master/packages/webpack-plugin
[github-badge]: https://img.shields.io/npm/l/@road-to-rome/webpack-plugin.svg?style=flat-square&colorB=blue&logo=github
[node-badge]: https://img.shields.io/node/v/@road-to-rome/webpack-plugin.svg?style=flat-square&colorB=green&logo=node.js

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
  watch: true, // Needed in watch mode
  plugins: [new RoadToRomePlugin()]
};
```

## Options

### pagePath

- type: `string`
- default: `src/pages`

Find your routes by matching `${pagePath}/**/route.config.js`.

### depth

- type: `integer`
- default: `10`

`options.deep` of `globby`. `options.depth` of `chokidar`.

### mode

- enum: [`flat-array`, `deep-map`]
- default: `flat-array`

Internal mapper of route config.

### mapper

- type: `function: ({ route, index }[]) => string`

custom mapper of route config, will override `options.mode`

### filter

- type: `function: ({ route, index }) => boolean`

Page component filter for generations.
