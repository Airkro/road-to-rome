'use strict';

const { validate } = require('schema-utils');

const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    globs: {
      type: 'string',
      description: 'Find your routes by globs',
    },
    depth: {
      type: 'number',
      description: 'Value of `globbyOptions.deep` and `chokidarOptions.depth`',
    },
    filter: {
      instanceof: 'Function',
      description: 'Page component filter for generations',
    },
    include: {
      type: 'array',
      uniqueItems: true,
      description: 'Page component filter for generations',
      items: {
        type: 'string',
        minLength: 1,
      },
    },
    exclude: {
      type: 'array',
      uniqueItems: true,
      description: 'Page component filter for generations',
      items: {
        type: 'string',
        minLength: 1,
      },
    },
  },
};

module.exports = {
  schema,
  validator(options, pluginName) {
    validate(schema, options, { name: pluginName });
  },
};
