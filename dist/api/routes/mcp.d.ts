import type { Context } from "hono";
import { z } from "zod";
export declare const configSchema: z.ZodObject<{}, z.core.$strip>;
export declare const mcpHandler: (c: Context) => Promise<Response | undefined>;
