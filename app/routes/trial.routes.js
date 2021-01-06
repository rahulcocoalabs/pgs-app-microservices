
const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const tests = require('../controllers/trial.controller');
    
    app.post('/trial/accounts', tests.create);
   
}
