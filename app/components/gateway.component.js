const superagent = require('superagent');
var config = require('../../config/app.config.js');
var gatewayUrl = config.gateway.url; 
module.exports = {
    
    get: function(path,params,callback) {
        /**
         * 
        */
        var url = gatewayUrl + path;
        console.log("Routing path "+url +" through gateway");
        superagent.get(url).query(params).end((err,res)=> { 
            console.log(err.message,"09/04");
            callback(err,res.body);
        }); 
    },
    
    patch: function(path,params,callback) {
        /**
         * 
        */
       var url = gatewayUrl + path;
       console.log("Routing path "+url +" through gateway");
       superagent.patch(url).send(params).set('Accept', 'application/json').end((err,res)=> { 
           callback(err,res.body);
       }); 
    },

    getWithAuth:  function (path, params,bearer,callback) {
        var url = gatewayUrl + path;
        console.log("Routing path " + url + " through gateway");
        superagent.get(url)
        .query(params)
        .set({'Content-Type': 'application/json', 'authorization':  bearer})
        .end((err,res)=> { 
            callback(err,res.text);
        }); 

    },

    // patchWith:  function (path, params,callback) {
        patchWithAuth:  function (path, params,bearer,callback) {
        var url = gatewayUrl + path;
        console.log("Routing path " + url + " through gateway");
        superagent.patch(url)
        .send(params)
        // .set({'Content-Type': 'application/json'})
        .set({'Content-Type': 'application/json', 'authorization':  bearer})
        .end((err,res)=> { 
            callback(err,res.text);
        }); 

    },
}
 