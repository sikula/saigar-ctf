const Config = {
  '*.js': ['eslint', 'jest --bail --findRelatedTests'],
  '*.{json,graphql}': ['prettier --list-different'],
}

module.exports = Config
