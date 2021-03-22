const mongoose = require('mongoose');
var moment = require('moment');


var InstituteEnquirySchema = mongoose.Schema({
    
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute' },
    
    status: Number,
    comment:String,
    tsCreatedAt: Number,
    tsModifiedAt: Number
})

module.exports = mongoose.model('InstituteEnquiry', InstituteEnquirySchema, 'InstituteEnquiries');