const { createDefaultPreset } = require("ts-jest");

// Configure ts-jest to compile to CommonJS for testing,
// but keep moduleResolution as NodeNext to support resolve of .js extension imports.
const tsJestTransformCfg = createDefaultPreset({
  tsconfig: {
    module: "commonjs",
    moduleResolution: "NodeNext",
    esModuleInterop: true,
  },
}).transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
    // Map .js imports to the original source files for TypeScript in jest environment
    "^(\\.\\.?/.*)\\.js$": "$1",
  },
  testPathIgnorePatterns: ["/node_modules/", "/tests/web/"],
};
