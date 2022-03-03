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

```js
// example: 'src/index.js'
import { routes } from '@road-to-rome/routes';

const router = new Router({ routes });
```

```cjs
// example: webpack.config.js
const RoadToRomePlugin = require('@road-to-rome/webpack-plugin');

module.exports = {
  plugins: [new RoadToRomePlugin()]
};
```

## Options

### globs

- type: `string`
- default: `src/pages/**/route.config.js`

Find your routes by globs.

### depth

- type: `integer`
- default: `10`

Value of `globbyOptions.deep` and `chokidarOptions.depth`

### filter

- type: `function: ({ path }) => boolean`

Page component filter for generations.

### include

- type: `string[]`

Page component filter for generations.

### exclude

- type: `string[]`

Page component filter for generations.

## Tips

When your `webpack` compiler in watching mode, typing `rtr` command in your terminal can trigger routes rebuild manually.
