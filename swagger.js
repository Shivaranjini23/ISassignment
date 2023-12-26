const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Prison VMS API',
      version: '1.0.0',
      description: 'API documentation for Prison VMS',
    },
  },
  apis: ['./https://github.com/Shivaranjini23/ISassignment.git"/*.js'], // Specify the path to your route files
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
