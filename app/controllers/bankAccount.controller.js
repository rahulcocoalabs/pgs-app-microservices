const BankAccount = require('../models/bankAccount.model.js');

function bankAccountController(methods, options) {
  this.listAll = (req, res) => {
    console.log("listAll() working...");
  };
};

module.exports = bankAccountController;
