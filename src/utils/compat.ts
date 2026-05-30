import { createRequire } from "node:module";

/**
 * Returns a `require` function (createRequire)
 * that is safe to use in both ESM and CJS environments,
 * resolving relative paths based on the caller file's directory.
 */
export function getRequire(callerFilename?: string): NodeRequire {
  let filename = callerFilename;
  if (!filename) {
    const orig = Error.prepareStackTrace;
    Error.prepareStackTrace = (_, stack) => stack;
    const err = new Error();
    const stack = err.stack as any;
    Error.prepareStackTrace = orig;
    // stack[0] is getRequire
    // stack[1] is the caller of getRequire
    filename = stack[1] ? stack[1].getFileName() : "";
  }

  if (!filename) {
    throw new Error(
      "Could not determine caller filename to create require context",
    );
  }

  return createRequire(filename);
}
