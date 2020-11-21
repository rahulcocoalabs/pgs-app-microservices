const mongoose = require('mongoose');


const BankAccountSchema = mongoose.Schema({
    name : String, 
    number : String,
    code : String, 
    bank : String, 
    upi : String,
    branch : String,
    userIdCreator : mongoose.Schema.Types.ObjectId,
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
})

module.exports = mongoose.model('BankAccount', BankAccountSchema, 'BankAccounts');