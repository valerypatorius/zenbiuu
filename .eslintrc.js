/**
 * @type {import('@typescript-eslint/types').ParserOptions}
 */
const parserOptions = {
  parser: '@typescript-eslint/parser',
  tsconfigRootDir: __dirname,
  project: [
    './tsconfig.json',
    './tsconfig.eslint.json',
    './packages/**/tsconfig.json',
  ],
  ecmaVersion: 2022,
  extraFileExtensions: ['.vue'],
};

module.exports = {
  extends: [
    'standard-with-typescript',
    'plugin:vue/vue3-recommended',
  ],
  parser: 'vue-eslint-parser',
  parserOptions,
  ignorePatterns: [
    '**/dist/*.js',
  ],
  rules: {
    /** Prefer semicolons */
    semi: ['error', 'always'],
    '@typescript-eslint/semi': ['error', 'always'],
    '@typescript-eslint/member-delimiter-style': [
      'error',
      {
        multiline: {
          delimiter: 'semi',
          requireLast: true,
        },
        singleline: {
          delimiter: 'semi',
          requireLast: false,
        },
        multilineDetection: 'brackets',
      },
    ],

    /** Makes code unnecessary complicated */
    '@typescript-eslint/promise-function-async': 'off',

    /** Use typescript rule to support enums */
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],

    /** Such patterns are not used */
    'node/no-callback-literal': 'off',

    /** Buggy behavior */
    'padded-blocks': 'off',

    /** Too much promises do not need to be handled */
    '@typescript-eslint/no-floating-promises': 'off',

    /** Causes unnecessary code complications  */
    '@typescript-eslint/strict-boolean-expressions': 'off',

    /** Does not work well with imported types for some reason */
    '@typescript-eslint/restrict-template-expressions': [
      'error', {
        allowAny: true,
      },
    ],

    /** Require trailing comma for better git diffs */
    'comma-dangle': ['error', 'always-multiline'],

    /** Disable because of not doing well with TS call Signatures */
    'func-call-spacing': 'off',

    /** These cases are rare */
    'vue/no-v-html': 'off',

    /** Allow props destructruringm when reactivityTransform is enabled */
    'vue/no-setup-props-destructure': 'off',

    /** Allow single-word component names */
    'vue/multi-word-component-names': 'off',
  },
};
