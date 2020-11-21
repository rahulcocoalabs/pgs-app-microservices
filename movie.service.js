var server = require('./server.js'); 
var routes = ['movie'];
var serviceName = "movie";
server.start(serviceName, routes);