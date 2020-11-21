const mongoose = require('mongoose');

const EnquirySchema = mongoose.Schema({
    name : String,
    email : String, 
    subject : String,
    message : String,
    phone : String,
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
})

module.exports = mongoose.model('Enquiry', EnquirySchema, 'Enquiries');