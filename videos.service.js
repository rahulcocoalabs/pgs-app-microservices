var server = require('./server.js'); 
var routes = ['video'];
var serviceName = "videos";
server.start(serviceName, routes);