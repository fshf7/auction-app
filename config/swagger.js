// config/swagger.js
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Опции для Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.0', // Версия OpenAPI
        info: {
            title: 'Auction App API',
            version: '1.0.0',
            description: 'API documentation for the Auction App',
            contact: {
                name: 'Your Name',
                email: 'your.email@example.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000/api', // URL вашего API
                description: 'Development server',
            },
        ],
    },
    apis: ['./routes/*.js'], // Пути к файлам, где находятся маршруты
};

// Инициализация Swagger
const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};

//http://localhost:5000/api-docs