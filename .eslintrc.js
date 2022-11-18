module.exports = {
  root: true,
  ignorePatterns: [
    "**/node_modules/**/*.*",
    "**/bin/**/*.*",
    "**/build/**/*.*",
    "**/dist/**/*.*",
    "**/coverage/**/*.*",
    "**/w3/**/*.*",
    "**/node_modules/**/*.*",
    "**/archive/**/*.*",
    "**/typechain/**/*.*",
    "**/typechain-types/**/*.*",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  rules: {
    "prettier/prettier": [
      "error",
      {
        endOfLine: "lf",
      },
    ],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-var-requires": "off",
  },
};
