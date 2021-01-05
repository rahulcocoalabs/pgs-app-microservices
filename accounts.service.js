var server = require('./server.js'); 
var routes = ['user', 'otp'];
var serviceName = "accounts";
console.log("flag8903");
server.start(serviceName, routes);
