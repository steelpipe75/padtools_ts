/**
 * Returns a `require` function (createRequire)
 * that is safe to use in both ESM and CJS environments,
 * resolving relative paths based on the caller file's directory.
 */
export declare function getRequire(callerFilename?: string): NodeRequire;
