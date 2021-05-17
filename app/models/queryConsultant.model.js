const mongoose = require('mongoose');

const QueryConsultantSchema = mongoose.Schema({
    name:String,
    description:String,
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QueryCategory'
    },
    
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('QueryConsultant', QueryConsultantSchema, 'QueryConsultants');