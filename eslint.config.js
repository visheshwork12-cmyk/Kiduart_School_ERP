import pluginJs from '@eslint/js';
import pluginImport from 'eslint-plugin-import';
import prettier from 'eslint-config-prettier';

export default [
  pluginJs.configs.recommended,
  prettier,
  {
    plugins: { import: pluginImport },
    rules: {
      'import/order': ['error', { 'newlines-between': 'always', alphabetize: { order: 'asc' } }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'import/no-unresolved': ['error', { ignore: ['^#'] }],
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
];