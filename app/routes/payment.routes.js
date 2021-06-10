
const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const payment = require('../controllers/payment.controller');
    app.get('/payment/get-credentials',auth, payment.getCredentials);
    app.get('/payment/get-credentials-business',auth, payment.getCredentialsBusiness);
    app.post('/payment/update-payments/:id',auth, payment.updatePayment);
    app.get('/payment/get-key',auth, payment.getKey);
    app.get('/payment/get-key-business',auth, payment.getKeyBusiness);
    app.get('/payment/list-packages',auth, payment.getPackage);
    app.post('/payment/save-transaction',auth, payment.savePayment);
   
}
