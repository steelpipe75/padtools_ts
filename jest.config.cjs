const { createDefaultPreset } = require("ts-jest");

// Configure ts-jest to compile to CommonJS for testing,
// but keep moduleResolution as NodeNext to support resolve of .js extension imports.
const tsJestTransformCfg = createDefaultPreset({
  tsconfig: {
    module: "commonjs",
    moduleResolution: "NodeNext",
    esModuleInterop: true,
    allowJs: true,
  },
}).transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
    // Transpile JS files in node_modules (like commander)
    "^.+\\.jsx?$": [
      "ts-jest",
      {
        tsconfig: {
          module: "commonjs",
          moduleResolution: "NodeNext",
          esModuleInterop: true,
          allowJs: true,
        },
      },
    ],
  },
  transformIgnorePatterns: [
    // Transpile commander from node_modules, ignore other node_modules
    "/node_modules/(?!(commander)/)",
  ],
  moduleNameMapper: {
    // Map .js imports to the original source files for TypeScript in jest environment
    "^(\\.\\.?/.*)\\.js$": "$1",
  },
  testPathIgnorePatterns: ["/node_modules/", "/tests/web/"],
};
