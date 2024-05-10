import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
    ],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylistic,
    ],
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
  },
  {
    files: [
      '**/*.js',
    ],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    ignores: ['**/dist/'],
  },
  {
    rules: {
      /**
       * Allow comparing enums' values against numbers
       */
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
    },
  },
);
