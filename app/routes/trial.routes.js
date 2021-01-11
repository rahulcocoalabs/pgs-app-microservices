
const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const tests = require('../controllers/trial.controller');
    
    app.get('/trial/get-credentials',auth, tests.getCredentials);
    app.post('/trial/update-payments/:id',auth, tests.updatePayment);
    app.get('/trial/get-key/:id',auth, tests.getKey);
   
}
