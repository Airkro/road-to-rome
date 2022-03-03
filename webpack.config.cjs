'use strict';

const HtmlWebpackPlugin = require('html-webpack-plugin');
const RoadToRomePlugin = require('@road-to-rome/webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    static: false,
  },
  resolve: {
    symlinks: true,
  },
  plugins: [new HtmlWebpackPlugin(), new RoadToRomePlugin()],
};
