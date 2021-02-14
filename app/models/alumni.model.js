const mongoose = require('mongoose');



const AlumniSchema = mongoose.Schema({
    fullName: String,
    address: String,
    companyName : String,
    description: String,
    image: String,
    batch:String,
    designation: String,
    passingYear: String,
    email: String,
    contact: String,
    facebook: String,
    linkedin: String,
    status:Number,
    groupName: String,
    groupTargets: String,
    createdBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    admins:[{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    tsCreatedAt: Number,
    tsModifiedAt: Number,
    isApproved: Boolean,
    
});
module.exports = mongoose.model('Alumni', AlumniSchema, 'Alumnis');