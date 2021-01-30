const mongoose = require('mongoose');



const AlumniSchema = mongoose.Schema({
    fullName: String,
    address: String,
    companyName : String,
    description: String,
    image: String,
    designation: String,
    passingYear: String,
    email: String,
    contact: String,
    facebook: String,
    linkedin: String,
    groupName: String,
    groupTargets: String,
    createdBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tsCreatedAt: Number,
    tsModifiedAt: Number
    
});
module.exports = mongoose.model('Alumni', AlumniSchema, 'Alumnis');