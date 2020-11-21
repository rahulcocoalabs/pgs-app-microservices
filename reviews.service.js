var server = require('./server.js'); 
var routes = ['review'];
var serviceName = "reviews";
server.start(serviceName, routes);