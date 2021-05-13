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
    amount: Number,
    paidStatus: Boolean,
    paidOn: Date,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('Payment', PaymentSchema, 'Payments');