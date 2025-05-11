import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import prettierPlugin from 'eslint-plugin-prettier'
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort'
import importPlugin from 'eslint-plugin-import'

export default [
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				ecmaFeatures: {
					jsx: true
				}
			}
		},
		plugins: {
			'@typescript-eslint': tsPlugin,
			'prettier': prettierPlugin,
			'simple-import-sort': simpleImportSortPlugin,
			'import': importPlugin
		},
		rules: {
			'prettier/prettier': ['error', {
				singleQuote: true,
				semi: false,
				useTabs: true,
				tabWidth: 4,
				trailingComma: 'none',
				endOfLine: 'auto'
			}],
			'@typescript-eslint/no-unused-vars': 'error',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/interface-name-prefix': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/consistent-type-definitions': ['error', 'type'],
			'simple-import-sort/imports': ['error', {
				groups: [
					['^@/api'],
					['^@/lib', '^@/utils', '^@/hooks', '^@/store'],
					['^@/components', '^@/ui'],
					['^[a-z]']
				]
			}],
			'simple-import-sort/exports': 'error',
			'import/first': 'error',
			'import/newline-after-import': 'error',
			'import/no-duplicates': 'error'
		}
	}
] 