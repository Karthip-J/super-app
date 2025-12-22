module.exports = {
  extends: ['react-app'],
  rules: {
    'no-unused-vars': 'off',
    'jsx-a11y/img-redundant-alt': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'no-throw-literal': 'off',
    'no-unreachable': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'react/jsx-no-undef': 'off',
    'react/prop-types': 'off',
    'react/no-unescaped-entities': 'off',
    'react/display-name': 'off'
  },
  env: {
    browser: true,
    es6: true,
    node: true
  },
  ignorePatterns: ['**/*']
}; 