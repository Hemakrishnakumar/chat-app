import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import { defineConfig, globalIgnores } from 'eslint/config';



export default defineConfig([
    globalIgnores(['dist', 'coverage']),
    {
        files: ['**/*.{js,jsx,ts,tsx}'],

        plugins: {
            import: importPlugin,
        },

        extends: [
            js.configs.recommended,
            ...tseslint.configs.recommended,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
        ],

        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },

        rules: {
            'import/newline-after-import': ['error', { count: 3 }],

            indent: ['error', 4, { SwitchCase: 1 }],

            'no-console': 'warn',
            semi: ['error', 'always'],
        },
    },
]);
