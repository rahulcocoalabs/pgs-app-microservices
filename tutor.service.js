var server = require('./server.js'); 
console.log('test1');
var routes = ['tutor'];
var serviceName = "tutor";
server.start(serviceName, routes);