var server = require('./server.js'); 
var routes = ['notifications'];
var serviceName = "notifications";
server.start(serviceName, routes);