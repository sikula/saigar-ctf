const Config = {
  extends: ['airbnb', 'plugin:prettier/recommended', 'prettier/react'],
  parser: 'babel-eslint',
  rules: {
    semi: ['error', 'never'], // no semicolons
    'no-unexpected-multiline': 'error', // no semicolons
    'react/jsx-filename-extension': ['error', { extensions: ['.js'] }],
    'import/no-unresolved': 'off',
  },
  env: { browser: true, jest: true },
  overrides: {
    files: [
      '**/config/webpack.common.js',
      '**/config/webpack.dev.js',
      '**/config/webpack.prod.js',
      '**/config/webpack.state.js',
    ],
    rules: {
      'import/no-extraneous-dependencies': 'off',
      'jsx-a11y/anchor-is-valid': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
    },
  },
}

module.exports = Config
