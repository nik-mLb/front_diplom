"use strict";

import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from 'typescript-eslint';
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: { globals: { ...globals.browser } },
    files: ["src/**/*.ts", "src/**/*.tsx"],
    ignores: ["src/shared/**"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    }

  },

  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs["recommended-latest"],
  reactRefresh.configs.vite,
  eslintPluginPrettier,

  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-undef": "off",
      "prettier/prettier": [  //or whatever plugin that is causing the clash
        "error",
        {
          "tabWidth": 4
        }
      ]
    },
  },
];
