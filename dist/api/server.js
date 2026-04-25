"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const convert_1 = __importDefault(require("./routes/convert"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Swagger definition
const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "PAD Tools API",
        version: "1.0.0",
        description: "API for converting SPD to SVG",
    },
    servers: [
        {
            url: `http://localhost:${port}`,
            description: "Development server",
        },
    ],
};
const options = {
    swaggerDefinition,
    apis: ["./src/api/routes/*.ts"], // Path to the API docs
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
// Middleware
app.use(express_1.default.json());
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
// Routes
app.use("/api", convert_1.default);
// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
});
