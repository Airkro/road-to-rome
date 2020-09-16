const { mappers } = require('./lib');

module.exports = {
  type: 'object',
  additionalProperties: false,
  properties: {
    pagePath: {
      type: 'string',
    },
    depth: {
      type: 'number',
    },
    mode: {
      type: 'string',
      enum: Object.keys(mappers),
    },
    mapper: {
      instanceof: 'Function',
    },
    filter: {
      instanceof: 'Function',
    },
  },
};
