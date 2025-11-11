import HtmlWebpackPlugin from 'html-webpack-plugin';
import { RoadToRomePlugin } from '@road-to-rome/webpack-plugin';

export default {
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
