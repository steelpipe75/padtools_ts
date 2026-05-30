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
    "^.+\\.[cm]?jsx?$": [
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
    // Transpile commander and standard-community from node_modules, ignore other node_modules
    "/node_modules/(?!(commander|@standard-community)/)",
  ],
  moduleNameMapper: {
    "^zod/v4/core$": "<rootDir>/node_modules/zod/v4/core/index.cjs",
    // Map .js imports to the original source files for TypeScript in jest environment
    "^(\\.\\.?/.*)\\.js$": "$1",
  },
  testPathIgnorePatterns: ["/node_modules/", "/tests/web/"],
};
