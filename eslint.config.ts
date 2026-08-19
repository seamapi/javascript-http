import { globalIgnores } from 'eslint/config'
import importPlugin from 'eslint-plugin-import'
import jsdoc from 'eslint-plugin-jsdoc'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import unusedImports from 'eslint-plugin-unused-imports'
import neostandard, { resolveIgnoresFromGitignore } from 'neostandard'

const files = ['**/*.{ts,tsx}']

// Documentation is required only for the core client modules
// covering the concepts in the README:
// client options, authentication, action attempts, pagination,
// requests, and errors.
const publicApiFiles = [
  'src/lib/options.ts',
  'src/lib/request-options.ts',
  'src/lib/resolve-action-attempt.ts',
  'src/lib/seam-http-error.ts',
  'src/lib/seam-http-request.ts',
  'src/lib/seam-paginator.ts',
]

export default [
  globalIgnores(resolveIgnoresFromGitignore()),
  ...neostandard({ ts: true, noStyle: true }),
  {
    files,
    rules: {
      'no-console': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
    },
  },
  {
    files,
    plugins: {
      'unused-imports': unusedImports,
      import: importPlugin,
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          fixStyle: 'inline-type-imports',
        },
      ],
      'import/no-duplicates': ['error', { 'prefer-inline': true }],
      'import/no-cycle': [
        'error',
        {
          ignoreExternal: true,
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['..', '../**'],
              message:
                'Import by path alias instead, e.g., lib/foo/bar.js or test/fixtures/blueprint.js.',
            },
          ],
        },
      ],
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    ...jsdoc.configs['flat/recommended-typescript-error'],
    files: publicApiFiles,
    rules: {
      ...jsdoc.configs['flat/recommended-typescript-error']?.rules,
      'jsdoc/require-jsdoc': [
        'error',
        {
          publicOnly: true,
          require: {
            ArrowFunctionExpression: true,
            ClassDeclaration: true,
            ClassExpression: true,
            FunctionDeclaration: true,
            FunctionExpression: true,
            MethodDefinition: false,
          },
          contexts: [
            'ExportNamedDeclaration > TSInterfaceDeclaration',
            'ExportNamedDeclaration > TSTypeAliasDeclaration',
            'ExportNamedDeclaration > TSEnumDeclaration',
          ],
          checkConstructors: false,
          checkGetters: false,
          checkSetters: false,
          enableFixer: false,
        },
      ],
      'jsdoc/require-description': [
        'error',
        {
          contexts: ['any'],
          exemptedBy: ['deprecated', 'inheritdoc', 'internal', 'see'],
        },
      ],
      'jsdoc/require-param': 'off',
      'jsdoc/require-returns': 'off',
      'jsdoc/require-yields': 'off',
      // Types belong in the TypeScript type annotations, not the JSDoc tags.
      'jsdoc/require-throws-type': 'off',
      'jsdoc/tag-lines': ['error', 'never', { startLines: 1 }],
      // Conflicts with how Prettier formats JSDoc inside union types.
      'jsdoc/check-alignment': 'off',
    },
  },
  {
    files,
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^\\u0000'],
            ['^node:'],
            ['^@?\\w'],
            ['@seamapi/http'],
            ['^lib/', '^test/'],
            ['^'],
            ['^\\.'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },
]
