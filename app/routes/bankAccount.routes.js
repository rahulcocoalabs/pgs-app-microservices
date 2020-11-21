module.exports = (app) => {
    const bankAccount = require('../controllers/bankAccount.controller.js');
    app.get('/bankAccounts', bankAccount.listAll);
   
}