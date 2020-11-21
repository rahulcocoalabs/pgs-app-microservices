var server = require('./server.js'); 
var routes = ['feed'];
var serviceName = "feeds";
server.start(serviceName, routes);