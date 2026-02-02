const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'UXIA API',
            version: '1.0.0',
            description: 'API para el proyecto UXIA'
        },
        servers: [
            {
                url: 'http://127.0.0.1:3000',
                description: 'Servidor de desenvolupament'
            }
        ]
    },
    apis: ['./src/routes/*.js']
};

module.exports = swaggerJsDoc(swaggerOptions);
