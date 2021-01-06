
const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const tests = require('../controllers/trial.controller');
    console.log("flag ..2");
    app.post('/trial/accounts',auth, tests.create);
   
}
