import { createRequire } from "node:module";

/**
 * Returns a `require` function (createRequire)
 * that is safe to use in both ESM and CJS environments,
 * resolving relative paths based on the caller file's directory.
 * If createRequire is not supported or fails (e.g. in Cloudflare Workers),
 * it returns a fallback function.
 */
export function getRequire(callerFilename?: string): NodeRequire {
  let filename = callerFilename;
  if (!filename) {
    try {
      const orig = Error.prepareStackTrace;
      Error.prepareStackTrace = (_, stack) => stack;
      const err = new Error();
      const stack = err.stack as unknown as NodeJS.CallSite[];
      Error.prepareStackTrace = orig;
      // stack[0] is getRequire
      // stack[1] is the caller of getRequire
      filename = stack[1]?.getFileName() ?? "";
    } catch (_) {
      filename = "";
    }
  }

  if (filename) {
    try {
      // Check if it looks like a valid path/URL before calling createRequire
      if (
        filename.startsWith("file://") ||
        filename.startsWith("/") ||
        filename.includes(":\\") ||
        filename.includes(":/")
      ) {
        return createRequire(filename);
      }
    } catch (_) {
      // Fall through to fallback
    }
  }

  // Fallback require implementation for restricted environments (like Cloudflare Workers)
  return ((path: string) => {
    if (path.endsWith("package.json")) {
      return { version: "0.4.0" };
    }
    const globalRequire = (
      globalThis as typeof globalThis & { require?: unknown }
    ).require;
    if (typeof globalRequire === "function") {
      return globalRequire(path);
    }
    throw new Error(`Cannot require ${path} in this environment`);
  }) as NodeRequire;
}
