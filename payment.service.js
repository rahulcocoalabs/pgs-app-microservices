var server = require('./server.js'); 
var routes = ['payment'];
var serviceName = "payment";
server.start(serviceName, routes);