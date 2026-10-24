const swaggerAutogen = require('swagger-autogen')();
require('dotenv').config();
const doc = {
  info: {
    title: 'DBSCALE',
    description: 'BAse de datos de Modelos a Escala'
  },
  host: 'localhost:'+process.env.PORT || 8080
};

const outputFile = './swagger-output.json';
const routes = [
    './app/routes/user.routes.js', 
    './app/routes/auth.routes.js', 
];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, routes, doc);