var server = require('./server.js'); 
var routes = ['user', 'otp'];
var serviceName = "accounts";
server.start(serviceName, routes);
