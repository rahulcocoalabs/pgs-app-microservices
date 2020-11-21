var server = require('./server.js'); 
var routes = ['contest'];
var serviceName = "contest";
server.start(serviceName, routes);