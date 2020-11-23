var server = require('./server.js'); 
var routes = ['favouriteTutor'];
var serviceName = "favouriteTutors";
server.start(serviceName, routes);