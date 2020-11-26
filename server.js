const express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');
var consoleArguments = require('minimist');
var argv = consoleArguments(process.argv.slice(2));
// Configuring the database
var env = process.env.NODE_ENV;
env = env ? env : "development";
console.log("Environment is " + env);
const dbConfig = require('./config/database.config.js')[env];
if (!dbConfig) {
  console.log("Database configuaration for environment " + env + " is not in the db config file. Exiting...");
  process.exit(0);
}
const params = require('./config/params.config');
var gateway = require('./app/components/gateway.component');
const Sequelize = require('sequelize');
const mongoose = require('mongoose');
const fs = require("fs");
const https = require("https");

var sequelize = null;
//jwttoken and verification
var privateKey  = fs.readFileSync('/etc/ssl/pgsedu.com/private.key', 'utf8');
var certificate = fs.readFileSync('/etc/ssl/pgsedu.com/certificate.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};

// create express app
const app = express();

app.use(cors());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(bodyParser.json());
module.exports = {
  connectToDb: function(callback) {
    var that = this;
    this.connectToMongoDb(dbConfig.mongodb,function(mongoose){     
      //  that.connectToMysqlDb(dbConfig.sql,function(sequelize){
           callback({
               sequelize:sequelize,
               mongoose:mongoose
           });
      //  })
    });
},
connectToMongoDb: function (dbConfig,callback) {
  mongoose.connect(dbConfig.url, {
    useNewUrlParser: true,

  }).then(() => {
    console.log("Successfully connected to the mongodb");
    if (callback) {
      callback(mongoose);
    }
  }).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
  });
},
// connectToMysqlDb: function (dbConfig,callback) {
//   sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
//       host: '172.104.61.150',
//       dialect: 'mysql'
//     });
//   sequelize
//     .authenticate()
//     .then(() => {
//       console.log('Connected to sql.');
//       if (callback) {
//         callback(sequelize);
//       }
//     })
//     .catch(err => {
//       console.error('Unable to connect to the database:', err);
//       process.exit();
//     });
// },
  start: function (serviceName, routes) {
    var that = this;
    console.log('test1');
    console.log(serviceName,routes);
    this.connectToDb(function (db) {
      var options = db
      var port = process.env.port ? process.env.port : null;
      port = port ? port : argv.port ? argv.port : null;
      if (!port) {
        console.log("PORT not set for " + serviceName + " service");

        process.exit(0);
      }
      if (routes) {
        var len = routes.length ? routes.length : 0;
        var i = 0;
        var route = null;
        while (i < len) {
          route = routes[i];
          console.log("Loading route " + route);
          require('./app/routes/' + route + '.routes.js')(app, that.methods, options);
          i++;
        }
        // app.listen(port, () => {
        //   console.log("Server is listening on port " + port);
        // });
        // var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

// httpServer.listen(port);
httpsServer.listen(port);

      }

    });



  }




};
