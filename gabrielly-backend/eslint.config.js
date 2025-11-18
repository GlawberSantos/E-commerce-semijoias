import js from '@eslint/js';

export default [
  {
    ignores: ['node_modules', 'dist', 'coverage', 'LogFiles', '__tests__']
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        Buffer: 'readonly',
        URLSearchParams: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly'
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': 'off',
      'no-console': 'off',
      'no-useless-escape': 'warn',
      'no-useless-catch': 'off',
      'quotes': 'off',
      'semi': 'warn',
      'indent': 'off'
    }
  }
];
