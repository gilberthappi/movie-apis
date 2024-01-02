// swaggerConfig.js
export const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'MOVIE API',
        version: '1.0.0',
        description: 'Movie  API Documentation',
      },
      servers: [
        {
          url: 'http://localhost:100/api/v1',
        },
        {
          url: 'https://xxx/api/v1',
        },
      ],
      
    },
    apis: ['./src/routes/*.js'],
  };
  