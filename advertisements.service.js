var server = require('./server.js'); 
var routes = ['advertisement'];
var serviceName = "advertisements";
server.start(serviceName, routes);