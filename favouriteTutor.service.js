var server = require('./server.js'); 
console.log('test34');
var routes = ['tutor'];
var serviceName = "favouriteTutor";
server.start(serviceName, routes);