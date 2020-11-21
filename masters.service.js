var server = require('./server.js'); 
var routes = ['masters'];
var serviceName = "masters";
server.start(serviceName, routes);