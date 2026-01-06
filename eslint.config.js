import js from '@eslint/js'
import prettier from 'eslint-config-prettier/flat'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import typescript from 'typescript-eslint'

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Base JS
  js.configs.recommended,

  // React Hooks (🔥 NO QUITAR)
  reactHooks.configs.flat.recommended,

  // TypeScript
  ...typescript.configs.recommended,

  // React
  {
    ...react.configs.flat.recommended,
    ...react.configs.flat['jsx-runtime'], // React 17+

    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },

    rules: {
      // React
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',

      // ===============================
      // TS / DX (NO bloquean CI)
      // ===============================
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // ===============================
      // Hooks (balance correcto)
      // ===============================
      'react-hooks/exhaustive-deps': 'warn',

      // ===============================
      // Estilo / ruido
      // ===============================
      'no-empty': 'off',
    },

    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // Ignorar carpetas
  {
    ignores: [
      'vendor',
      'node_modules',
      'public',
      'bootstrap/ssr',
      'tailwind.config.js',
    ],
  },

  // Prettier (al final siempre)
  prettier,
]
