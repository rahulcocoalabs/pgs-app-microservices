var server = require('./server.js'); 
var routes = ['offlineClass'];
var serviceName = "offlineClass";
server.start(serviceName, routes);