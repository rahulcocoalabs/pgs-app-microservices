var server = require('./server.js'); 
var routes = ['book'];
var serviceName = "books";
server.start(serviceName, routes);