import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

const browserGlobals = {
  console: 'readonly',
  document: 'readonly',
  DOMParser: 'readonly',
  fetch: 'readonly',
  Map: 'readonly',
  navigator: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly',
  window: 'readonly'
};

export default [
  { ignores: ['dist/**', 'deploy/**', '.tools/**'] },
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: browserGlobals,
      parserOptions: { ecmaFeatures: { jsx: true } }
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'react-refresh/only-export-components': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/use-memo': 'off'
    }
  },
  {
    files: ['vite.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { process: 'readonly' }
    }
  }
];
