import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import stylistic from '@stylistic/eslint-plugin'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

/**
 * Objects, interfaces, type literals and destructurings with 3 or more members put every member on its own line
 */
const chopThreeOrMore = {
  multiline: true,
  minProperties: 3,
  consistent: true,
}

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      '@stylistic': stylistic,
    },
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // functions are always arrow functions assigned to a const
      'func-style': ['error', 'expression'],

      // the closing brace stands alone, else / catch / finally start the next line
      '@stylistic/brace-style': ['error', 'stroustrup', { allowSingleLine: true }],

      // single quotes, double quotes only to avoid escaping
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: 'avoidEscape' }],
      '@stylistic/jsx-quotes': ['error', 'prefer-single'],

      // chop long constructions
      '@stylistic/max-len': ['error', {
        code: 120,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      }],
      '@stylistic/object-curly-newline': ['error', {
        ObjectExpression: chopThreeOrMore,
        ObjectPattern: chopThreeOrMore,
        TSInterfaceBody: chopThreeOrMore,
        TSTypeLiteral: chopThreeOrMore,
        ImportDeclaration: { multiline: true, consistent: true },
        ExportDeclaration: { multiline: true, consistent: true },
      }],
      '@stylistic/object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],
      '@stylistic/newline-per-chained-call': ['error', { ignoreChainWithDepth: 2 }],
      '@stylistic/comma-dangle': ['error', {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'always-multiline',
        enums: 'always-multiline',
        generics: 'ignore',
        tuples: 'always-multiline',
      }],
    },
  },
])
