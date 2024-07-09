const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "turbo",
  ],
  plugins: ["only-warn", "@typescript-eslint"],
  parser: "@typescript-eslint/parser",
  globals: {
    React: true,
    JSX: true,
  },
  env: {
    node: true,
  },
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: [
    // Ignore dotfiles
    ".*.js",
    "node_modules/",
    "dist/",
  ],

  rules: {
    "no-unused-vars": "off",
    "no-redeclare": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-redeclare": "warn",
  },
  overrides: [
    {
      files: ["*.spec.ts?(x)"],
      env: {
        jest: true,
      },
    },
    {
      files: ["*.ts?(x)"],
    },
  ],
};
