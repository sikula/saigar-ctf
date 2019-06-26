const path = require('path')
const merge = require('webpack-merge')

// const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')

/* Configs */
const development = require('./webpack.dev')
const production = require('./webpack.prod')

const TARGET = process.env.npm_lifecycle_event

process.env.BABEL_ENV = TARGET

const PATHS = {
  app: path.join(__dirname, '../src'),
  build: path.join(__dirname, '../dist'),
}

const optimizations = {
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
          minChunks: 2,
          priority: 20,
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'async',
          priority: 10,
          reuseExistingChunk: true,
          enforce: true,
        },
      },
    },
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            unused: true,
            dead_code: true,
            warnings: false,
          },
        },
        sourceMap: true,
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
  },
  performance: {
    hints: false,
  },
}

const rules = [
  {
    test: /\.js$/,
    exclude: /node_modules/,
    loader: 'babel-loader',
    query: {
      presets: [
        [
          '@babel/env',
          {
            useBuiltIns: 'usage',
            targets: {
              node: 'current',
            },
          },
        ],
        '@babel/react',
      ],
      plugins: [
        'react-hot-loader/babel',
        '@babel/plugin-syntax-dynamic-import',
        '@babel/proposal-class-properties',
      ],
    },
  },
  {
    test: /\.(png|jpg|gif)$/i,
    use: [
      {
        loader: 'url-loader',
        options: {
          limit: 8192,
        },
      },
    ],
  },
  {
    test: /\.(eot|woff|woff2|ttf|svg)(\?\S*)?$/,
    use: [
      {
        loader: 'url-loader',
        options: {
          limit: 100000,
          // name: '[name].[ext]',
        },
      },
    ],
  },
  // {
  //   test: /\.png$/,
  //   exclude: /node_modules/,
  //   loader: 'url-loader?name=assets/[name].[ext]',
  // },
  {
    test: /\.css$/,
    use: ['style-loader', 'css-loader'],
  },
  {
    test: /\.less$/,
    use: [
      'style-loader',
      { loader: 'css-loader', options: { importLoaders: 1 } },
      {
        loader: 'less-loader',
      },
    ],
  },
  {
    test: /\.(graphql|gql)$/,
    use: [
      {
        loader: 'graphql-tag/loader',
      },
    ],
    exclude: /node_modules/,
  },
]

const common = {
  entry: [PATHS.app],
  output: {
    path: PATHS.build,
    filename: '[name].[hash].js',
    chunkFilename: '[name].[hash].js',
    publicPath: '/',
  },

  resolve: {
    extensions: ['.mjs', '.js', '.jsx', '.css', '.scss'],
    modules: [PATHS.app, 'node_modules'],
    alias: {
      '@app': path.resolve(__dirname, '../src/_App'),
      '@features': path.resolve(__dirname, '../src/features'),
      '@shared': path.resolve(__dirname, '../src/shared'),
      '@utils': path.resolve(__dirname, '../src/utils'),
      '@pages': path.resolve(__dirname, '../src/pages'),
    },
  },

  module: { rules },
  ...optimizations,
}

if (TARGET === 'start:dev' || !TARGET) {
  module.exports = merge(development, common)
}

if (TARGET === 'build' || !TARGET) {
  module.exports = merge(production, common)
}
