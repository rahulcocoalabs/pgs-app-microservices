var server = require('./server.js'); 
var routes = ['queries'];
var serviceName = "queries";
server.start(serviceName, routes);