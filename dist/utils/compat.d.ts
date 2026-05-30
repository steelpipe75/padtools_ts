/**
 * Returns a `require` function (createRequire)
 * that is safe to use in both ESM and CJS environments,
 * resolving relative paths based on the caller file's directory.
 * If createRequire is not supported or fails (e.g. in Cloudflare Workers),
 * it returns a fallback function.
 */
export declare function getRequire(callerFilename?: string): NodeRequire;
