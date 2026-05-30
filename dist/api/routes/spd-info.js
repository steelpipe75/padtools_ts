import { z } from "zod";
import { describeRoute, resolver } from "hono-openapi";
import { SPD_EXPLANATION } from "../../spd/docs.js";
const SpdInfoResponseSchema = z.object({
    explanation: z
        .string()
        .describe("The explanation of SPD notation in Markdown format")
        .meta({
        example: "SPD (Simple PAD Description) is...",
    }),
});
export const spdInfoRoute = describeRoute({
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: resolver(SpdInfoResponseSchema),
                },
            },
            description: "Returns the explanation of SPD notation",
        },
    },
});
export const spdInfoHandler = (c) => {
    return c.json({ explanation: SPD_EXPLANATION });
};
