import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';

export default tseslint.config({
  files: [
    '**/*.ts',
    '**/*.tsx',
    '**/*.vue',
  ],
  extends: [
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.stylistic,
    ...pluginVue.configs['flat/recommended'],
  ],
  languageOptions: {
    parser: vueParser,
    parserOptions: {
      project: true,
      extraFileExtensions: ['.vue'],
      sourceType: 'module',
      parser: {
        ts: tseslint.parser,
      },
    },
  },
});
