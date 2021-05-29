
const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const payment = require('../controllers/payment.controller');
    
    app.get('/payment/get-credentials',auth, payment.getCredentials);
    app.post('/payment/update-payments/:id',auth, payment.updatePayment);
    app.get('/payment/get-key',auth, payment.getKey);
    app.get('/payment/test',auth, payment.tests);
    app.post('/payment/save-transaction',auth, payment.savePayment);
   
}
