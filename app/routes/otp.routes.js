
module.exports = (app) => {
    const accounts = require('../controllers/accounts.controller');
    app.post('/accounts/otp',accounts.generate);
    app.post('/accounts/otp/verify',accounts.validate);
}
