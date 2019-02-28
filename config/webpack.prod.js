const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const config = {
  devtool: 'source-map',
  mode: 'production',
  stats: {
    chunks: true,
    chunkModules: true,
  },
}

const rules = [
  {
    test: /\.scss$/,
    use: [
      MiniCssExtractPlugin.loader,
      { loader: 'css-loader', options: { url: false, sourceMap: true } },
      { loader: 'sass-loader', options: { sourceMap: true } },
    ],
  },
]

const plugins = [
  new MiniCssExtractPlugin({
    filename: '[name].[hash].css',
    chunkFilename: '[name].[hash].css',
  }),
  new HtmlWebpackPlugin({
    template: path.resolve('./src/index.html'),
    filename: 'index.html',
    inject: 'body',
    minify: {
      collapseWhitespace: true,
    },
    chunksSortMode: 'auto',
  }),
]

const Config = {
  name: 'client',
  target: 'web',
  ...config,
  module: { rules: [...rules] },
  plugins,
}

module.exports = Config
