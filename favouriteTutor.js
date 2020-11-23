var server = require('./server.js'); 
var routes = ['favouriteTotor','favouriteClass'];
var serviceName = "favouriteTutors";
server.start(serviceName, routes);