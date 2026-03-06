import HtmlWebpackPlugin from 'html-webpack-plugin';
import { RoadToRomePlugin } from '@road-to-rome/webpack-plugin';

export default {
  mode: 'production',
  devtool: 'source-map',
  target: 'es2025',
  output: {
    module: true,
    clean: true,
  },
  devServer: {
    static: false,
  },
  resolve: {
    symlinks: true,
  },
  experiments: {
    outputModule: true,
  },
  optimization: {
    runtimeChunk: {
      name: 'runtime',
    },
    usedExports: true,
  },
  plugins: [new HtmlWebpackPlugin(), new RoadToRomePlugin()],
};
