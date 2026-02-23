const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Client Portal API",
    version: "1.0.0",
    description: "API for Client Portal - Auth, Projects, Comments, Dashboard",
  },
  servers: [{ url: "http://localhost:3000", description: "Local" },{ url: "http://18.209.50.230:3000", description: "Remote" }],
  paths: {
    "/api/auth/register": {
      post: {
        summary: "Register user",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                  name: { type: "string" },
                  role: { type: "string", enum: ["admin", "client"] },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Created" } },
      },
    },
    "/api/auth/login": {
      post: {
        summary: "Login",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Returns token and user" } },
      },
    },
    "/api/auth/me": {
      get: {
        summary: "Current user",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "User" } },
      },
    },
    "/api/projects": {
      get: {
        summary: "List projects (filtered by role)",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Projects array" } },
      },
      post: {
        summary: "Create project (Admin only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  status: {
                    type: "string",
                    enum: ["active", "completed", "on-hold"],
                  },
                  clientId: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Created project" } },
      },
    },
    "/api/projects/stats": {
      get: {
        summary: "Project stats (Admin only)",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "active, completed, onHold counts" } },
      },
    },
    "/api/projects/{id}": {
      get: {
        summary: "Get project with comments",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { 200: { description: "Project" } },
      },
      patch: {
        summary: "Update project (Admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { 200: { description: "Updated project" } },
      },
      delete: {
        summary: "Delete project (Admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { 204: { description: "Deleted" } },
      },
    },
    "/api/projects/{id}/comments": {
      get: {
        summary: "List comments",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { 200: { description: "Comments array" } },
      },
      post: {
        summary: "Add comment",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { content: { type: "string" } },
              },
            },
          },
        },
        responses: { 201: { description: "Created comment" } },
      },
    },
    "/api/dashboard": {
      get: {
        summary: "Dashboard stats by role",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Stats" } },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
  },
  security: [{ bearerAuth: [] }],
};

export { swaggerSpec };
