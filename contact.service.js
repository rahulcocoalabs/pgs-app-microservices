var server = require('./server.js'); 
var routes = ['contact'];
var serviceName = "contact";
server.start(serviceName, routes);