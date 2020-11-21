var server = require('./server.js'); 
var routes = ['game'];
var serviceName = "games";
server.start(serviceName, routes);