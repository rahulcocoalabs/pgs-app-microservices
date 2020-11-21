var server = require('./server.js'); 
var routes = ['shopProduct'];
var serviceName = "shopProducts";
server.start(serviceName, routes);