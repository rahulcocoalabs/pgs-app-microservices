var server = require('./server.js'); 
var routes = ['store'];
var serviceName = "store";
server.start(serviceName, routes);