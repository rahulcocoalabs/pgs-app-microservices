const mongoose = require('mongoose');

const QuoteSchema = mongoose.Schema({
    title : String,
    description : String,
    keywords : [String],
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
})

module.exports = mongoose.model('Quote', QuoteSchema, 'Quotes');