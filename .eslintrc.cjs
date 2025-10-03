/* ESLint configuration root */
module.exports = {
  root: true,
  ignorePatterns: [
    'node_modules',
    'dist',
    '**/dist',
    '*.d.ts'
  ],
  env: { es2022: true, node: true, browser: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: [
      './server/tsconfig.json',
      './client/tsconfig.json'
    ],
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint','import'],
  settings: {
    react: { version: 'detect' }
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    'no-console': ['warn', { allow: ['warn','error','info'] }],
    'eqeqeq': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'import/order': ['warn', { 'newlines-between': 'always', alphabetize: { order: 'asc', caseInsensitive: true } }]
  },
  overrides: [
    {
      files: ['server/**/*.{ts,tsx}'],
      env: { node: true },
      rules: {
        'react/react-in-jsx-scope': 'off'
      }
    },
    {
      files: ['client/**/*.{ts,tsx}'],
      env: { browser: true },
      plugins: ['react','react-hooks'],
      extends: [
        'plugin:react/recommended',
        'plugin:react-hooks/recommended'
      ],
      rules: {
        'react/react-in-jsx-scope': 'off'
      }
    },
    {
      files: ['**/*.test.{ts,tsx}'],
      env: { node: true, browser: true },
      globals: {
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly'
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off'
      }
    }
  ]
};
