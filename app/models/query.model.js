const mongoose = require('mongoose');

const QueryConsultantSchema = mongoose.Schema({
    question:String,
    answer:String,
    isAnswered:Boolean,
    code:Number,
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QueryCategory'
    },
    consultant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QueryConsultant'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('Query', QueryConsultantSchema, 'Queries');