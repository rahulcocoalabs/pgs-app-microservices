var server = require('./server.js'); 
var routes = ['event'];
var serviceName = "events";
server.start(serviceName, routes);