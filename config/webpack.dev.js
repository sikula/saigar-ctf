const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const Dotenv = require('dotenv-webpack')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const config = {
  devtool: 'cheap-module-eval-source-map',
  mode: 'development',
  stats: {
    chunks: false,
    children: false,
    chunkModules: false,
  },

  devServer: {
    historyApiFallback: true,
    hot: true,
    port: 8084,
  },
}

const rules = [
  {
    test: /\.scss$/,
    use: [
      'style-loader',
      { loader: 'css-loader', options: { url: false, sourceMap: true } },
      { loader: 'sass-loader', options: { sourceMap: true } },
    ],
  },
]

const plugins = [
  new HtmlWebpackPlugin({
    template: path.resolve('./src/index.html'),
    filename: 'index.html',
    inject: 'body',
    minify: false,
    chunkSortMode: 'auto',
  }),
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoEmitOnErrorsPlugin(),
  // new Dotenv({ safe: true }),
  // new BundleAnalyzerPlugin(),
]

const Config = {
  name: 'client',
  target: 'web',
  ...config,
  module: { rules: [...rules] },
  plugins,
}

module.exports = Config
