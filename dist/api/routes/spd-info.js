import { createRoute, z } from "@hono/zod-openapi";
import { SPD_EXPLANATION } from "../../spd/docs.js";
const SpdInfoResponseSchema = z.object({
    explanation: z.string().openapi({
        example: "SPD (Simple PAD Description) is...",
        description: "The explanation of SPD notation in Markdown format",
    }),
});
export const spdInfoRoute = createRoute({
    method: "get",
    path: "/spd-info",
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: SpdInfoResponseSchema,
                },
            },
            description: "Returns the explanation of SPD notation",
        },
    },
});
export const spdInfoHandler = (c) => {
    return c.json({ explanation: SPD_EXPLANATION });
};
