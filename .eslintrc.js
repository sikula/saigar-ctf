const Config = {
  extends: ['airbnb', 'plugin:prettier/recommended', 'prettier/react'],
  parser: 'babel-eslint',
  rules: {
    semi: ['error', 'never'], // no semicolons
    'no-unexpected-multiline': 'error', // no semicolons
    'react/jsx-filename-extension': ['error', { extensions: ['.js'] }],
    'import/no-unresolved': 'off',
  },
  overrides: {
    files: [
      '**/config/webpack.common.js',
      '**/config/webpack.dev.js',
      '**/config/webpack.prod.js',
      '**/config/webpack.state.js',
    ],
    rules: { 'import/no-extraneous-dependencies': 'off' },
  },
}

module.exports = Config
