var server = require('./server.js'); 
var routes = ['bookings'];
var serviceName = "bookings";
server.start(serviceName, routes);