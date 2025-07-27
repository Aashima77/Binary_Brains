import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    info: {
      title: "VisionAI API",
      version: "1.0.0",
    },
  },
  apis: ["./app/api/**/*.ts"],
});
