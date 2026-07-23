import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "off",           // Next.js handles globals
      "react/react-in-jsx-scope": "off",
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        React: "readonly",
        process: "readonly",
        console: "readonly",
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        globalThis: "readonly",
        setTimeout: "readonly",
        clearInterval: "readonly",
        setInterval: "readonly",
        fetch: "readonly",
        FormData: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        Promise: "readonly",
        JSON: "readonly",
        Math: "readonly",
        Date: "readonly",
        Error: "readonly",
        Array: "readonly",
        Object: "readonly",
        String: "readonly",
        Number: "readonly",
        Boolean: "readonly",
        Map: "readonly",
        Set: "readonly",
        alert: "readonly",
        confirm: "readonly",
      },
    },
    settings: {
      react: { version: "detect" },
    },
  },
  {
    // Ignore build output and deps
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "*.config.js",
      "*.config.mjs",
      "postcss.config.mjs",
    ],
  },
];
