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
          url: 'https://movie-api-9ds8.onrender.com/api/v1',
        },
      ],
      
    },
    apis: ['./src/routes/*.js'],
  };
  