# @road-to-rome/babel-plugin

Automatically generate routes by filename.

[![npm][npm-badge]][npm-url]
[![github][github-badge]][github-url]
![node][node-badge]

[npm-url]: https://www.npmjs.com/package/@road-to-rome/babel-plugin
[npm-badge]: https://img.shields.io/npm/v/@road-to-rome/babel-plugin.svg?style=flat-square&logo=npm
[github-url]: https://github.com/airkro/road-to-rome/tree/master/packages/babel-plugin
[github-badge]: https://img.shields.io/npm/l/@road-to-rome/babel-plugin.svg?style=flat-square&colorB=blue&logo=github
[node-badge]: https://img.shields.io/node/v/@road-to-rome/babel-plugin.svg?style=flat-square&colorB=green&logo=node.js

## Installation

```bash
npm install @road-to-rome/babel-plugin --save-dev
```

# Usage

```jsonc
// example: babel.config.json
{
  "plugins": [
    [
      "@road-to-rome/babel-plugin",
      {
        "entry": "src/route.config.js"
      }
    ]
  ]
}
```
