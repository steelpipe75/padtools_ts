import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import convertRoute from "./routes/convert";

const app = express();
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

const swaggerSpec = swaggerJsdoc(options);

// Middleware
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api", convertRoute);

export default app;

// Start server
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
  });
}
