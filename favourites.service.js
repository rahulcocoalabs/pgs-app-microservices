var server = require('./server.js'); 
var routes = ['favourite'];
var serviceName = "favourites";
server.start(serviceName, routes);