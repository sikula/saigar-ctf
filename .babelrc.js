const Config = {
  presets: [
    [
      '@babel/env',
      {
        useBuiltIns: 'usage',
        targets: {
          node: 'current'
        }
      },
    ],
    '@babel/react',
  ],
  plugins: [
    'react-hot-loader/babel',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/proposal-class-properties',
  ],
}

module.exports = Config
