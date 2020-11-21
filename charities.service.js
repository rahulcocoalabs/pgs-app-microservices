var server = require('./server.js'); 
var routes = ['charity'];
var serviceName = "charities";
server.start(serviceName, routes);