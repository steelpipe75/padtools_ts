/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.[cm]?[tj]sx?$": [
      "@swc/jest",
      {
        jsc: {
          parser: {
            syntax: "typescript",
            tsx: false,
          },
          target: "es2022",
        },
        module: {
          type: "commonjs",
        },
      },
    ],
  },
  transformIgnorePatterns: [
    // Transpile commander and standard-community from node_modules, ignore other node_modules
    "/node_modules/(?!(commander|@standard-community|langium|chevrotain|chevrotain-allstar|@chevrotain|vscode-uri|vscode-languageserver|vscode-languageserver-protocol|vscode-languageserver-types|vscode-languageserver-textdocument|lodash-es|sanitize-html|htmlparser2|dom-serializer|domelementtype|domhandler|domutils|entities|escape-string-regexp)/)",
  ],
  moduleNameMapper: {
    "^zod/v4/core$": "<rootDir>/node_modules/zod/v4/core/index.cjs",
    "^langium$": "<rootDir>/node_modules/langium/lib/index.js",
    "^chevrotain$": "<rootDir>/node_modules/chevrotain/lib/src/api.js",
    "^@chevrotain/([^/]+)$":
      "<rootDir>/node_modules/@chevrotain/$1/lib/src/api.js",
    // Map .js imports to the original source files for TypeScript in jest environment
    "^(\\.\\.?/.*)\\.js$": "$1",
  },
  testPathIgnorePatterns: ["/node_modules/", "/tests/web/"],
  setupFiles: ["<rootDir>/src/polyfills.ts"],
};
