const mongoose = require('mongoose');

const PaymentSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    charityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Charity'
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OnlineClass'
    },
    transactionId: String,
    paymentType:String,
    paymentStatus:String,
    message:String,
    amount: Number,
   
    paidOn: Date,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('Payment', PaymentSchema, 'Payments');